// lib/fulfillment.ts
//
// Turning a paid Stripe Checkout Session into account credit lives here, in
// exactly one place, because two different callers need it:
//
//   1. the Stripe webhook  (app/api/webhooks/stripe/route.ts)
//   2. the success page's verify call (app/api/checkout/verify/route.ts)
//
// The webhook is the primary path, but it is asynchronous — Stripe can take
// a few seconds, and if the webhook is misconfigured or temporarily failing
// it may never arrive at all. Without a second path the customer pays, gets
// redirected back, and finds nothing was granted. The verify call closes
// that hole: whichever one gets there first does the work.
//
// Idempotency comes from the unique constraint on payments.stripe_session_id.
// Whoever inserts that row first owns the grant; the loser sees 23505 and
// backs off instead of granting twice.

import { createClient } from '@supabase/supabase-js';
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

export type FulfillOutcome = 'granted' | 'already_processed';

export async function fulfillCheckoutSession(params: {
  userId: string;
  productType: ProductType;
  sessionId: string;
  paymentIntentId?: string | null;
  // What Stripe actually charged, straight off the session. Recorded verbatim
  // so the payments table stays truthful when a price is replaced in the
  // Dashboard — Stripe prices are immutable, so "changing" one really means
  // pointing STRIPE_PRICE_* at a new object, and the code need not redeploy
  // for the amount to stay correct.
  amountTotal?: number | null;
  currency?: string | null;
}): Promise<FulfillOutcome> {
  const { userId, productType, sessionId, paymentIntentId } = params;

  // Fall back to the configured amount only when Stripe gave us nothing —
  // never refuse to fulfil a paid session just because the amount is
  // missing, but do say so, because it means the record may be wrong.
  const amountCents = params.amountTotal ?? PRODUCT_AMOUNTS_CENTS[productType];
  const currency = params.currency ?? 'eur';
  if (params.amountTotal == null) {
    console.warn(
      'FULFILLMENT: session', sessionId, 'had no amount_total — recording the',
      `configured ${productType} amount (${PRODUCT_AMOUNTS_CENTS[productType]}) instead`
    );
  }

  const { error: paymentInsertError } = await supabaseAdmin.from('payments').insert({
    user_id: userId,
    stripe_session_id: sessionId,
    stripe_payment_intent_id: paymentIntentId ?? null,
    product_type: productType,
    amount_cents: amountCents,
    currency,
    status: 'completed',
  });

  if (paymentInsertError) {
    // 23505 = unique violation on stripe_session_id — the webhook and the
    // verify call both reached this session. Someone else already granted it.
    if (paymentInsertError.code === '23505') {
      return 'already_processed';
    }
    throw paymentInsertError;
  }

  await grantPurchase(userId, productType);
  return 'granted';
}

async function grantPurchase(userId: string, productType: ProductType) {
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
      // A 3-pack: grants 3 full attempts (main + followup each) per
      // purchase — both numbers driven by ATTEMPTS_GRANTED.topup so they
      // always stay in sync with plans.ts.
      const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({
          main_attempts_remaining: sub.main_attempts_remaining + ATTEMPTS_GRANTED.topup,
          topup_followup_credits: (sub.topup_followup_credits ?? 0) + ATTEMPTS_GRANTED.topup,
        })
        .eq('user_id', userId);

      if (error) throw error;
      break;
    }

    case 'followup_unlock': {
      // A single account-wide bundle purchase (was: pay per-attempt €1.50
      // x2). Unlocks followup access for ALL of this Basic-plan account's
      // attempts, and immediately grants the bonus attempt that used to
      // require two separate unlock purchases.
      const updates: Record<string, unknown> = {
        followup_bundle_purchased: true,
      };

      if (!sub.bonus_attempt_granted) {
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
