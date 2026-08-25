// app/api/webhooks/stripe/route.ts
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { getStripe } from '@/lib/stripe';
import { fulfillCheckoutSession } from '@/lib/fulfillment';
import type { ProductType } from '@/lib/plans';
import type Stripe from 'stripe';

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
  } catch (err: unknown) {
    Sentry.captureException(err);
    const message = err instanceof Error ? err.message : String(err);
    console.error('WEBHOOK SIGNATURE VERIFICATION FAILED:', message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // checkout.session.completed fires as soon as the session completes, which
  // for some payment methods is BEFORE the money has actually settled.
  // async_payment_succeeded is the late confirmation for those. Both are
  // handled through the same idempotent fulfillment path.
  if (
    event.type !== 'checkout.session.completed' &&
    event.type !== 'checkout.session.async_payment_succeeded'
  ) {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  const userId = session.metadata?.userId;
  const productType = session.metadata?.productType as ProductType | undefined;
  const sessionId = session.id;
  // payment_intent is either the id or the expanded object, depending on how
  // the session was created; normalise it the same way the verify route does.
  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id;

  if (!userId || !productType) {
    Sentry.captureMessage(`Webhook missing metadata: session ${sessionId}`, 'error');
    console.error('WEBHOOK: missing userId or productType in session metadata', sessionId);
    return NextResponse.json({ received: true });
  }

  // Don't grant anything for a session that completed without being paid
  // (e.g. a delayed bank debit that is still processing). The matching
  // async_payment_succeeded event will come back through here once it is.
  if (session.payment_status && session.payment_status !== 'paid') {
    console.log(
      'WEBHOOK: session',
      sessionId,
      'not paid yet (payment_status:',
      session.payment_status,
      ') — skipping grant'
    );
    return NextResponse.json({ received: true });
  }

  try {
    const outcome = await fulfillCheckoutSession({
      userId,
      productType,
      sessionId,
      paymentIntentId,
    });

    if (outcome === 'already_processed') {
      console.log('WEBHOOK: session', sessionId, 'already fulfilled — nothing to do');
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    Sentry.captureException(err);
    console.error('WEBHOOK PROCESSING ERROR:', err);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
