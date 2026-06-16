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
  followup_unlock: 150,
  topup: 100,
};

// How many main-questionnaire attempts each product grants
export const ATTEMPTS_GRANTED: Record<ProductType, number> = {
  basic: 2,
  full: 3,
  followup_unlock: 0, // doesn't grant a new attempt directly (bonus logic handles this)
  topup: 1,
};

// Which plan a purchase sets the user to (only basic/full change the plan)
export const PLAN_FOR_PRODUCT: Record<ProductType, 'basic' | 'full' | null> = {
  basic: 'basic',
  full: 'full',
  followup_unlock: null,
  topup: null,
};

// followup_unlock requires a result_id (which attempt's followup is being unlocked)
export function requiresResultId(productType: ProductType): boolean {
  return productType === 'followup_unlock';
}