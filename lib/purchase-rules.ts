// lib/purchase-rules.ts
//
// Who is allowed to buy what. Extracted from app/api/checkout/route.ts so the
// rules can be exercised directly — the route itself needs a live Supabase
// client and a Stripe key before it reaches this logic, which made the rules
// effectively untestable while they were inline.
//
// The route is still the only enforcement point; this module just holds the
// decision. PricingContent renders the customer-facing half of the same rules,
// so if you change one, change the other.

import type { ProductType } from '@/lib/plans';

// Only the fields the rules actually read. Kept structural rather than
// importing a generated DB row type so tests can build one by hand.
export interface EligibilitySubscription {
  plan: 'free' | 'basic' | 'full';
  followup_bundle_purchased?: boolean | null;
  bonus_attempt_granted?: boolean | null;
}

export interface PurchaseDenial {
  error: string;
  status: number;
  // Machine-readable discriminator for the one denial the UI reacts to
  // specifically (it swaps the modal over to the bundle card).
  code?: string;
}

/**
 * Returns null when the purchase is allowed, or the denial to send back.
 */
export function checkPurchaseEligibility(
  productType: ProductType,
  sub: EligibilitySubscription
): PurchaseDenial | null {
  // Basic/Full can only be purchased once — afterwards only topup/followup_unlock
  if ((productType === 'basic' || productType === 'full') && sub.plan !== 'free') {
    return {
      error: 'You already have a plan. Use top-ups to get more attempts.',
      status: 400,
    };
  }

  // followup_unlock: account-wide bundle, Basic plan only, one-time purchase.
  // Full plan already includes followups, and Free plan has no attempts to
  // use it on.
  if (productType === 'followup_unlock') {
    if (sub.plan === 'full') {
      return { error: 'Your plan already includes followups', status: 400 };
    }
    if (sub.plan === 'free') {
      return { error: 'Please purchase a plan first', status: 400 };
    }
    if (sub.followup_bundle_purchased) {
      return { error: 'You have already unlocked all followups', status: 400 };
    }
  }

  // topup requires an existing base plan
  if (productType === 'topup' && sub.plan === 'free') {
    return { error: 'Please purchase a plan first', status: 400 };
  }

  // Basic-plan customers buy the followup bundle before top-ups. The bundle
  // is what unlocks the followup half of every attempt, so selling extra
  // attempts first would sell them something they can only half-use. The UI
  // says the same thing; this is the server-side half of that rule.
  //
  // bonus_attempt_granted is the legacy escape hatch: accounts that unlocked
  // followups under the old per-attempt pricing never get followup_bundle_
  // purchased set, and must not be blocked here.
  if (
    productType === 'topup' &&
    sub.plan === 'basic' &&
    !sub.followup_bundle_purchased &&
    !sub.bonus_attempt_granted
  ) {
    return {
      error:
        'Unlock your followups first — that bundle covers the followup questionnaire for every attempt (and adds a bonus attempt). Top-ups become available afterwards.',
      code: 'FOLLOWUP_BUNDLE_REQUIRED',
      status: 400,
    };
  }

  return null;
}
