// lib/plans.ts
// Central configuration for all pricing/plan logic.
// Both the checkout route and webhook route import from here so the
// pricing rules live in exactly one place.

export type ProductType = 'basic' | 'full' | 'followup_unlock' | 'topup';

export const STRIPE_PRICE_IDS: Record<ProductType, string> = {
  basic: process.env.STRIPE_PRICE_BASIC!,
  full: process.env.STRIPE_PRICE_FULL!,
  followup_unlock: process.env.STRIPE_PRICE_FOLLOWUP!,
  topup: process.env.STRIPE_PRICE_TOPUP!,
};

export const PRODUCT_AMOUNTS_CENTS: Record<ProductType, number> = {
  basic: 300,
  full: 450,
  followup_unlock: 300, // was 150 — now ONE purchase that unlocks BOTH followups
  topup: 300,           // was 100 — now a 3-pack of full attempts (main + followup)
};

// How many main-questionnaire attempts each product grants
export const ATTEMPTS_GRANTED: Record<ProductType, number> = {
  basic: 2,
  full: 3,
  followup_unlock: 0, // doesn't grant a main attempt directly — grants followup
                       // access account-wide + an immediate bonus attempt
                       // (handled in the webhook, replacing the old "2 unlocks
                       // = bonus attempt" logic)
  topup: 3,            // was 1 — now grants 3 full attempts (main + followup
                        // each) per purchase
};

// ─── Stripe Checkout presentation ────────────────────────────────────
// Shown directly under the Pay button. At that moment the customer is
// asking exactly one question — "what do I actually get?" — so each
// product answers it in its own words. Counts are interpolated from
// ATTEMPTS_GRANTED so the copy can never drift from what is granted.
export const CHECKOUT_SUBMIT_MESSAGE: Record<ProductType, string> = {
  basic: `Your ${ATTEMPTS_GRANTED.basic} assessment attempts are added to your account the moment payment completes.`,
  full: `All ${ATTEMPTS_GRANTED.full} complete attempts — main and followup questionnaire each — are added the moment payment completes.`,
  followup_unlock:
    'Unlocks the followup questionnaire for every attempt on your account, and adds a bonus attempt straight away.',
  topup: `Adds ${ATTEMPTS_GRANTED.topup} complete attempts — main and followup for each — to your existing plan.`,
};

// Brand colours mirror --btn-primary-bg-start and --card-bg in globals.css.
// Stripe takes solid colours only, so the indigo end of the site's gradient
// stands in for it. font_family 'inter' is the closest supported match to
// the Tailwind default sans stack the rest of the site uses.
export const CHECKOUT_BRANDING = {
  display_name: 'CareerBridge Way',
  button_color: '#4f46e5',
  background_color: '#ffffff',
  border_style: 'rounded',
  font_family: 'inter',
} as const;

// Which plan a purchase sets the user to (only basic/full change the plan)
export const PLAN_FOR_PRODUCT: Record<ProductType, 'basic' | 'full' | null> = {
  basic: 'basic',
  full: 'full',
  followup_unlock: null,
  topup: null,
};

// followup_unlock is now an account-wide bundle purchase (unlocks all
// followups on the Basic plan) — it is no longer tied to a specific
// result_id, so nothing requires one anymore.
export function requiresResultId(productType: ProductType): boolean {
  return false;
}