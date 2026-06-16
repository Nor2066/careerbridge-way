// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { requireAuth } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase-server';
import { getStripe } from '@/lib/stripe';
import { STRIPE_PRICE_IDS, requiresResultId, type ProductType } from '@/lib/plans';
import { readLimiter, getUserIdentifier } from '@/lib/rate-limit';

const CheckoutSchema = z.object({
  productType: z.enum(['basic', 'full', 'followup_unlock', 'topup']),
  // Required only for followup_unlock — which attempt's followup is being unlocked
  resultId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    const { success } = await readLimiter.limit(getUserIdentifier(user.id));
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { productType, resultId } = parsed.data;

    if (requiresResultId(productType) && !resultId) {
      return NextResponse.json(
        { error: 'resultId is required for followup_unlock' },
        { status: 400 }
      );
    }

    // ─── Business rule checks ──────────────────────────────────────────
    const { data: sub, error: subError } = await supabaseServer
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (subError || !sub) {
      return NextResponse.json({ error: 'Subscription record not found' }, { status: 500 });
    }

    // Basic/Full can only be purchased once — afterwards only topup/followup_unlock
    if ((productType === 'basic' || productType === 'full') && sub.plan !== 'free') {
      return NextResponse.json(
        { error: 'You already have a plan. Use top-ups to get more attempts.' },
        { status: 400 }
      );
    }

    // followup_unlock: verify the result belongs to this user and isn't already unlocked
    if (productType === 'followup_unlock' && resultId) {
      const { data: result, error: resultError } = await supabaseServer
        .from('user_results')
        .select('id, user_id')
        .eq('id', resultId)
        .eq('user_id', user.id)
        .single();

      if (resultError || !result) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }

      const { data: existingUnlock } = await supabaseServer
        .from('followup_unlocks')
        .select('id')
        .eq('user_id', user.id)
        .eq('result_id', resultId)
        .maybeSingle();

      if (existingUnlock) {
        return NextResponse.json({ error: 'Followup already unlocked for this attempt' }, { status: 400 });
      }

      // Full plan users get followups included — no need to pay
      if (sub.plan === 'full') {
        return NextResponse.json(
          { error: 'Your plan already includes followups' },
          { status: 400 }
        );
      }
    }

    // ─── Create Stripe Checkout Session ────────────────────────────────
    const priceId = STRIPE_PRICE_IDS[productType as ProductType];
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://careerbridge-way.vercel.app';

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      // Metadata is read by the webhook — this is how we know what to grant
      metadata: {
        userId: user.id,
        productType,
        ...(resultId ? { resultId } : {}),
      },
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment/cancelled`,
      customer_email: user.email,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    Sentry.captureException(err);
    console.error('CHECKOUT ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}