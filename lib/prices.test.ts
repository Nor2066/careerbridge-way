import { describe, it, expect } from 'vitest';
import { formatPrice, PRICES_CENTS } from '@/lib/prices';
import { PRODUCT_AMOUNTS_CENTS } from '@/lib/plans';

// The pricing cards are the "invitation to purchase" the drip-pricing rules
// look at: what they show has to be the full amount Stripe then charges.

describe('formatPrice', () => {
  it('shows euros', () => {
    expect(formatPrice('basic')).toBe('€3.00');
    expect(formatPrice('full')).toBe('€4.50');
    expect(formatPrice('followup_unlock')).toBe('€3.00');
    expect(formatPrice('topup')).toBe('€3.00');
  });

  it('writes them the Spanish way in Spanish', () => {
    expect(formatPrice('full', 'es')).toMatch(/^4,50\s€$/);
  });
});

describe('fallback amounts', () => {
  it('record the same amounts the site displays', () => {
    expect(PRODUCT_AMOUNTS_CENTS).toEqual(PRICES_CENTS);
  });
});
