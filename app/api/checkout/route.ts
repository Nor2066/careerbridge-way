// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { requireAuth } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase-server';
import { getStripe } from '@/lib/stripe';
import { STRIPE_PRICE_IDS, type ProductType } from '@/lib/plans';
import { readLimiter, getUserIdentifier } from '@/lib/rate-limit';

const CheckoutSchema = z.object({
  productType: z.enum(['basic', 'full', 'followup_unlock', 'topup']),
  // resultId is no longer used by followup_unlock (it's now an account-wide
  // bundle purchase), but kept optional/accepted for backward compatibility
  // in case any old client code still sends it — it's simply ignored.
  resultId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);

    const { success } = await readLimiter.limit(getUserIdentifier(user.id));
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { productType } = parsed.data;

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

    // followup_unlock: account-wide bundle, Basic plan only, one-time purchase.
    // Full plan already includes followups, and Free plan has no attempts to
    // use it on.
    if (productType === 'followup_unlock') {
      if (sub.plan === 'full') {
        return NextResponse.json(
          { error: 'Your plan already includes followups' },
          { status: 400 }
        );
      }
      if (sub.plan === 'free') {
        return NextResponse.json(
          { error: 'Please purchase a plan first' },
          { status: 400 }
        );
      }
      if (sub.followup_bundle_purchased) {
        return NextResponse.json(
          { error: 'You have already unlocked all followups' },
          { status: 400 }
        );
      }
    }

    // topup requires an existing base plan
    if (productType === 'topup' && sub.plan === 'free') {
      return NextResponse.json(
        { error: 'Please purchase a plan first' },
        { status: 400 }
      );
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
      },
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment/cancelled`,
      customer_email: user.email,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    Sentry.captureException(err);
    const message = err?.message || String(err);
    console.error('CHECKOUT ERROR:', message);
    const errorMsg = process.env.NODE_ENV === 'development'
      ? message
      : 'Internal server error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}