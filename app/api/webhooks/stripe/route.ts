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

// IMPORTANT: In the Next.js App Router, route handlers receive the raw,
// unparsed Request body by default (unlike the old Pages Router API routes
// which needed `export const config = { api: { bodyParser: false } }`).
// request.text() below gives us the exact raw bytes Stripe signed — this
// is what makes signature verification work correctly. Do NOT call
// request.json() anywhere in this file before constructEvent().

// Service role client — webhooks have no user session, so this is the
// only correct way to write to the database here. RLS blocks anon/auth writes
// to subscriptions/payments/followup_unlocks, so service role is required.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  // ─── Signature verification (fixes #31) ─────────────────────────────
  // Stripe signs every webhook with a secret only Stripe and your server know.
  // Without this check, ANYONE could POST a fake "payment succeeded" event
  // to this URL and grant themselves free attempts.
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  // We need the RAW body for signature verification — NOT request.json(),
  // which would parse it and invalidate the signature check.
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

  // ─── Only handle the event we care about ─────────────────────────────
  if (event.type !== 'checkout.session.completed') {
    // Acknowledge other event types so Stripe stops retrying them
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
    // Return 200 so Stripe doesn't retry — this is a data problem, not a transient one
    return NextResponse.json({ received: true });
  }

  try {
    // ─── Idempotency check (fixes duplicate webhook deliveries) ────────
    // Stripe can send the same event multiple times. The unique constraint
    // on payments.stripe_session_id is our safeguard — if this insert
    // fails with a duplicate key error, we've already processed this payment.
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
      // Postgres unique violation code is 23505
      if (paymentInsertError.code === '23505') {
        console.log('WEBHOOK: duplicate event for session', sessionId, '— already processed');
        return NextResponse.json({ received: true });
      }
      throw paymentInsertError;
    }

    // ─── Grant the purchase ──────────────────────────────────────────────
    await grantPurchase(userId, productType, resultId);

    return NextResponse.json({ received: true });
  } catch (err: any) {
    Sentry.captureException(err);
    console.error('WEBHOOK PROCESSING ERROR:', err);
    // Return 500 so Stripe retries — this WAS a transient error (DB issue etc)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

// ─── Core business logic: what each product type grants ─────────────────
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
        })
        .eq('user_id', userId);

      if (error) throw error;
      break;
    }

    case 'followup_unlock': {
      if (!resultId) throw new Error('followup_unlock requires resultId');

      // Mark this specific attempt's followup as unlocked
      const { error: unlockError } = await supabaseAdmin.from('followup_unlocks').insert({
        user_id: userId,
        result_id: resultId,
      });

      if (unlockError && unlockError.code !== '23505') {
        // 23505 = already unlocked (shouldn't happen due to checkout checks, but safe)
        throw unlockError;
      }

      // Track progress toward the €6 bonus attempt
      const newPaidCount = sub.followups_paid_count + 1;
      const updates: Record<string, unknown> = { followups_paid_count: newPaidCount };

      // After 2 followup unlocks (€1.50 x 2 = €3, on top of the €3 Basic = €6 total)
      // grant 1 bonus attempt — but only once, ever
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