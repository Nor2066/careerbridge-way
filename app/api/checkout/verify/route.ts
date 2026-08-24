// app/api/checkout/verify/route.ts
//
// Called by /payment/success as soon as Stripe redirects the customer back.
//
// Before this existed the success page simply waited two seconds and hoped
// the webhook had landed. When it hadn't — a slow webhook, a retry, a
// misconfigured endpoint — the customer was sent back to the page they came
// from with nothing granted, and walked straight back into the paywall they
// had just paid to get past.
//
// This route asks Stripe directly whether the session is paid and, if it is,
// applies the grant itself. The webhook still runs; whichever arrives first
// wins, and the payments.stripe_session_id unique constraint keeps the other
// one from granting twice.

import { NextResponse } from 'next/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { requireAuth } from '@/lib/auth';
import { safeReturnTo } from '@/lib/auth-cookies';
import { getStripe } from '@/lib/stripe';
import { fulfillCheckoutSession } from '@/lib/fulfillment';
import { getSubscription } from '@/lib/subscription';
import type { ProductType } from '@/lib/plans';
import { readLimiter, getUserIdentifier } from '@/lib/rate-limit';

const VerifySchema = z.object({
  sessionId: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  let user;
  try {
    user = await requireAuth(request);
  } catch {
    return NextResponse.json(
      { error: 'Your session has expired. Please sign in again.', code: 'UNAUTHENTICATED' },
      { status: 401 }
    );
  }

  try {
    const { success } = await readLimiter.limit(getUserIdentifier(user.id));
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = VerifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const session = await getStripe().checkout.sessions.retrieve(parsed.data.sessionId);

    // The session id comes off a URL, so never trust it to belong to the
    // caller — a session created for somebody else must not be fulfilled
    // (or even described) here.
    if (session.metadata?.userId !== user.id) {
      return NextResponse.json({ error: 'Checkout session not found' }, { status: 404 });
    }

    const productType = session.metadata?.productType as ProductType | undefined;
    const returnPath = safeReturnTo(session.metadata?.returnPath, '/assess');

    if (!productType) {
      Sentry.captureMessage(`Verify: session ${session.id} has no productType metadata`, 'error');
      return NextResponse.json({ error: 'Checkout session is incomplete' }, { status: 500 });
    }

    if (session.payment_status !== 'paid') {
      // Not an error — some payment methods settle asynchronously. The client
      // keeps polling, and the async_payment_succeeded webhook is the backstop.
      return NextResponse.json({
        status: 'pending',
        paymentStatus: session.payment_status,
        productType,
        returnPath,
      });
    }

    await fulfillCheckoutSession({
      userId: user.id,
      productType,
      sessionId: session.id,
      paymentIntentId:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
    });

    const sub = await getSubscription(user.id);

    return NextResponse.json({
      status: 'complete',
      productType,
      returnPath,
      subscription: {
        plan: sub.plan,
        mainAttemptsRemaining: sub.main_attempts_remaining,
        followupBundlePurchased: sub.followup_bundle_purchased,
      },
    });
  } catch (err: any) {
    Sentry.captureException(err);
    const message = err?.message || String(err);
    console.error('CHECKOUT VERIFY ERROR:', message);
    const errorMsg = process.env.NODE_ENV === 'development' ? message : 'Internal server error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
