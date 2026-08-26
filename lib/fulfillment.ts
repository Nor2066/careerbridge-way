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

// Fail fast if this module is ever pulled into a client bundle. Next.js does
// not inline non-NEXT_PUBLIC env vars into browser code, so the service-role
// key cannot leak this way — but it would arrive as undefined and produce a
// confusing runtime 403 instead of an obvious error. lib/supabase-server.ts
// has guarded this way for a while; these modules did not.
if (typeof window !== 'undefined') {
  throw new Error('This module is server-only and must not be imported by client code');
}

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

/**
 * How many times to re-read and retry a grant that lost a race.
 *
 * Losing means another writer changed a counter between our read and our
 * write. That is rare and self-resolving, so a handful of attempts is plenty;
 * the cap exists so a genuinely stuck row raises an error instead of spinning.
 */
const MAX_GRANT_ATTEMPTS = 5;

/**
 * The new column values, plus the values they were derived from.
 *
 * `guards` is what makes the write safe: every column whose new value depends
 * on the old one is pinned to the value we read. If anything moved underneath
 * us, zero rows match and we start again from a fresh read.
 */
type GrantPlan = {
  updates: Record<string, unknown>;
  guards: Record<string, unknown>;
};

/**
 * Only the columns a grant reads. Structural rather than a generated row type
 * so the tests can hand in a plain object, matching lib/purchase-rules.ts.
 */
type GrantableSubscription = {
  main_attempts_remaining: number;
  topup_followup_credits?: number | null;
  bonus_attempt_granted?: boolean | null;
};

function planGrant(
  productType: ProductType,
  sub: GrantableSubscription
): GrantPlan {
  switch (productType) {
    case 'basic':
    case 'full': {
      return {
        updates: {
          plan: PLAN_FOR_PRODUCT[productType],
          main_attempts_remaining:
            sub.main_attempts_remaining + ATTEMPTS_GRANTED[productType],
        },
        guards: { main_attempts_remaining: sub.main_attempts_remaining },
      };
    }

    case 'topup': {
      // A 3-pack: grants 3 full attempts (main + followup each) per
      // purchase — both numbers driven by ATTEMPTS_GRANTED.topup so they
      // always stay in sync with plans.ts.
      return {
        updates: {
          main_attempts_remaining: sub.main_attempts_remaining + ATTEMPTS_GRANTED.topup,
          topup_followup_credits:
            (sub.topup_followup_credits ?? 0) + ATTEMPTS_GRANTED.topup,
        },
        guards: {
          main_attempts_remaining: sub.main_attempts_remaining,
          topup_followup_credits: sub.topup_followup_credits ?? null,
        },
      };
    }

    case 'followup_unlock': {
      // A single account-wide bundle purchase (was: pay per-attempt €1.50
      // x2). Unlocks followup access for ALL of this Basic-plan account's
      // attempts, and immediately grants the bonus attempt that used to
      // require two separate unlock purchases.
      const updates: Record<string, unknown> = { followup_bundle_purchased: true };
      const guards: Record<string, unknown> = {
        bonus_attempt_granted: sub.bonus_attempt_granted ?? null,
      };

      if (!sub.bonus_attempt_granted) {
        updates.main_attempts_remaining = sub.main_attempts_remaining + 1;
        updates.bonus_attempt_granted = true;
        guards.main_attempts_remaining = sub.main_attempts_remaining;
      }

      return { updates, guards };
    }
  }
}

/**
 * Applies a grant as a compare-and-swap, re-reading on contention.
 *
 * The previous version read the subscription row, added to a counter in
 * JavaScript, and wrote the sum back. Two payments settling at the same moment
 * — Stripe delivers webhooks concurrently, and the verify call races the
 * webhook by design — both read the same starting balance and both wrote the
 * same total, so the customer paid twice and was credited once. Pinning the
 * write to the values we read turns that silent loss into a retry.
 */
async function grantPurchase(userId: string, productType: ProductType) {
  for (let attempt = 1; attempt <= MAX_GRANT_ATTEMPTS; attempt++) {
    const { data: sub, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (subError || !sub) {
      throw new Error(`Subscription not found for user ${userId}`);
    }

    const { updates, guards } = planGrant(productType, sub);

    let query = supabaseAdmin.from('subscriptions').update(updates).eq('user_id', userId);
    for (const [column, value] of Object.entries(guards)) {
      // PostgREST needs `is` for null; `eq` never matches a NULL column.
      query = value === null ? query.is(column, null) : query.eq(column, value);
    }

    const { data, error } = await query.select('user_id');
    if (error) throw error;
    if ((data?.length ?? 0) > 0) return;

    console.warn(
      `FULFILLMENT: grant for ${userId} (${productType}) lost a write race,`,
      `retrying (${attempt}/${MAX_GRANT_ATTEMPTS})`
    );
  }

  // Never silently drop a grant the customer has already paid for.
  throw new Error(
    `Could not apply ${productType} grant for ${userId} after ${MAX_GRANT_ATTEMPTS} attempts`
  );
}
