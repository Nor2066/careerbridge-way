// app/api/webhooks/stripe/route.ts
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createClient } from '@supabase/supabase-js';
import { getStripe } from '@/lib/stripe';
import {
  ATTEMPTS_GRANTED,
  PLAN_FOR_PRODUCT,
  PRODUCT_AMOUNTS_CENTS,
  type ProductType,
} from '@/lib/plans';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const rawBody = await request.text();

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    Sentry.captureException(err);
    console.error('WEBHOOK SIGNATURE VERIFICATION FAILED:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as any;

  const userId = session.metadata?.userId;
  const productType = session.metadata?.productType as ProductType | undefined;
  const resultId = session.metadata?.resultId as string | undefined;
  const sessionId = session.id as string;
  const paymentIntentId = session.payment_intent as string | undefined;

  if (!userId || !productType) {
    Sentry.captureMessage(`Webhook missing metadata: session ${sessionId}`, 'error');
    console.error('WEBHOOK: missing userId or productType in session metadata', sessionId);
    return NextResponse.json({ received: true });
  }

  try {
    const { error: paymentInsertError } = await supabaseAdmin.from('payments').insert({
      user_id: userId,
      stripe_session_id: sessionId,
      stripe_payment_intent_id: paymentIntentId,
      product_type: productType,
      amount_cents: PRODUCT_AMOUNTS_CENTS[productType],
      currency: 'eur',
      result_id: resultId || null,
      status: 'completed',
    });

    if (paymentInsertError) {
      if (paymentInsertError.code === '23505') {
        console.log('WEBHOOK: duplicate event for session', sessionId, '— already processed');
        return NextResponse.json({ received: true });
      }
      throw paymentInsertError;
    }

    await grantPurchase(userId, productType, resultId);

    return NextResponse.json({ received: true });
  } catch (err: any) {
    Sentry.captureException(err);
    console.error('WEBHOOK PROCESSING ERROR:', err);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

async function grantPurchase(userId: string, productType: ProductType, resultId?: string) {
  const { data: sub, error: subError } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (subError || !sub) {
    throw new Error(`Subscription not found for user ${userId}`);
  }

  switch (productType) {
    case 'basic':
    case 'full': {
      const attempts = ATTEMPTS_GRANTED[productType];
      const plan = PLAN_FOR_PRODUCT[productType];

      const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({
          plan,
          main_attempts_remaining: sub.main_attempts_remaining + attempts,
        })
        .eq('user_id', userId);

      if (error) throw error;
      break;
    }

    case 'topup': {
      const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({
          main_attempts_remaining: sub.main_attempts_remaining + ATTEMPTS_GRANTED.topup,
          // Top-up grants a full attempt (main + followup), so credit 1 followup.
          // canAccessFollowup() in subscription.ts will consume this credit when
          // the user generates their followup report.
          topup_followup_credits: (sub.topup_followup_credits ?? 0) + 1,
        })
        .eq('user_id', userId);

      if (error) throw error;
      break;
    }

    case 'followup_unlock': {
      if (!resultId) throw new Error('followup_unlock requires resultId');

      const { error: unlockError } = await supabaseAdmin.from('followup_unlocks').insert({
        user_id: userId,
        result_id: resultId,
      });

      if (unlockError && unlockError.code !== '23505') {
        throw unlockError;
      }

      const newPaidCount = sub.followups_paid_count + 1;
      const updates: Record<string, unknown> = { followups_paid_count: newPaidCount };

      if (newPaidCount >= 2 && !sub.bonus_attempt_granted) {
        updates.main_attempts_remaining = sub.main_attempts_remaining + 1;
        updates.bonus_attempt_granted = true;
      }

      const { error: updateError } = await supabaseAdmin
        .from('subscriptions')
        .update(updates)
        .eq('user_id', userId);

      if (updateError) throw updateError;
      break;
    }
  }
}