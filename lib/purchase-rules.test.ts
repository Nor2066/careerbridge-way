import { describe, it, expect } from 'vitest';
import { checkPurchaseEligibility, type EligibilitySubscription } from '@/lib/purchase-rules';

const sub = (o: Partial<EligibilitySubscription> = {}): EligibilitySubscription => ({
  plan: 'free',
  followup_bundle_purchased: false,
  bonus_attempt_granted: false,
  ...o,
});

describe('base plan purchases', () => {
  it('lets a free account buy basic or full', () => {
    expect(checkPurchaseEligibility('basic', sub())).toBeNull();
    expect(checkPurchaseEligibility('full', sub())).toBeNull();
  });

  it.each(['basic', 'full'] as const)(
    'refuses a second base plan once on %s',
    (plan) => {
      expect(checkPurchaseEligibility('basic', sub({ plan }))?.error).toMatch(/already have a plan/);
      expect(checkPurchaseEligibility('full', sub({ plan }))?.error).toMatch(/already have a plan/);
    }
  );
});

describe('followup bundle', () => {
  it('is available to a basic account that has not bought it', () => {
    expect(checkPurchaseEligibility('followup_unlock', sub({ plan: 'basic' }))).toBeNull();
  });

  it('is refused on full — followups are already included', () => {
    expect(checkPurchaseEligibility('followup_unlock', sub({ plan: 'full' }))?.error).toMatch(
      /already includes followups/
    );
  });

  it('is refused on free — nothing to use it on', () => {
    expect(checkPurchaseEligibility('followup_unlock', sub({ plan: 'free' }))?.error).toMatch(
      /purchase a plan first/
    );
  });

  it('cannot be bought twice', () => {
    const s = sub({ plan: 'basic', followup_bundle_purchased: true });
    expect(checkPurchaseEligibility('followup_unlock', s)?.error).toMatch(/already unlocked/);
  });
});

describe('top-ups', () => {
  it('are refused without a base plan', () => {
    expect(checkPurchaseEligibility('topup', sub())?.error).toMatch(/purchase a plan first/);
  });

  // The rule this whole extraction exists for: a Basic customer whose
  // followups are still locked must buy the bundle before extra attempts,
  // because an attempt without followup access is only half an attempt.
  it('are blocked for a basic account with followups still locked', () => {
    const denial = checkPurchaseEligibility('topup', sub({ plan: 'basic' }));
    expect(denial).not.toBeNull();
    expect(denial!.code).toBe('FOLLOWUP_BUNDLE_REQUIRED');
    expect(denial!.status).toBe(400);
    expect(denial!.error).toMatch(/Unlock your followups first/);
  });

  it('open up once the bundle is purchased', () => {
    const s = sub({ plan: 'basic', followup_bundle_purchased: true });
    expect(checkPurchaseEligibility('topup', s)).toBeNull();
  });

  // Legacy accounts unlocked followups under the old per-attempt pricing,
  // which set bonus_attempt_granted but never followup_bundle_purchased.
  // They must not be pushed to re-buy a bundle they effectively own.
  it('open up for a legacy account with only bonus_attempt_granted', () => {
    const s = sub({ plan: 'basic', bonus_attempt_granted: true });
    expect(checkPurchaseEligibility('topup', s)).toBeNull();
  });

  it('are always available on full — followups are included', () => {
    expect(checkPurchaseEligibility('topup', sub({ plan: 'full' }))).toBeNull();
  });

  it('treats null flags the same as false', () => {
    const s = sub({ plan: 'basic', followup_bundle_purchased: null, bonus_attempt_granted: null });
    expect(checkPurchaseEligibility('topup', s)?.code).toBe('FOLLOWUP_BUNDLE_REQUIRED');
  });
});

describe('denial shape', () => {
  it('always carries a 400 and a non-empty message', () => {
    const denials = [
      checkPurchaseEligibility('basic', sub({ plan: 'basic' })),
      checkPurchaseEligibility('followup_unlock', sub({ plan: 'full' })),
      checkPurchaseEligibility('topup', sub()),
      checkPurchaseEligibility('topup', sub({ plan: 'basic' })),
    ];
    for (const d of denials) {
      expect(d).not.toBeNull();
      expect(d!.status).toBe(400);
      expect(d!.error.length).toBeGreaterThan(0);
    }
  });

  it('only tags the bundle-required denial with a code', () => {
    expect(checkPurchaseEligibility('topup', sub())?.code).toBeUndefined();
    expect(checkPurchaseEligibility('topup', sub({ plan: 'basic' }))?.code).toBe(
      'FOLLOWUP_BUNDLE_REQUIRED'
    );
  });
});

describe('checkout copy', () => {
  it('quotes the same attempt counts the fulfillment actually grants', async () => {
    const { CHECKOUT_SUBMIT_MESSAGE, ATTEMPTS_GRANTED } = await import('@/lib/plans');

    // If someone changes ATTEMPTS_GRANTED without touching the copy, the
    // customer is told one number under the Pay button and credited another.
    expect(CHECKOUT_SUBMIT_MESSAGE.basic).toContain(String(ATTEMPTS_GRANTED.basic));
    expect(CHECKOUT_SUBMIT_MESSAGE.full).toContain(String(ATTEMPTS_GRANTED.full));
    expect(CHECKOUT_SUBMIT_MESSAGE.topup).toContain(String(ATTEMPTS_GRANTED.topup));
  });

  it('gives every product a message inside Stripe’s length limit', async () => {
    const { CHECKOUT_SUBMIT_MESSAGE } = await import('@/lib/plans');
    for (const [product, message] of Object.entries(CHECKOUT_SUBMIT_MESSAGE)) {
      expect(message.length, product).toBeGreaterThan(0);
      expect(message.length, product).toBeLessThanOrEqual(1200);
    }
  });

  it('uses hex colours Stripe will accept', async () => {
    const { CHECKOUT_BRANDING } = await import('@/lib/plans');
    expect(CHECKOUT_BRANDING.button_color).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(CHECKOUT_BRANDING.background_color).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(['pill', 'rectangular', 'rounded']).toContain(CHECKOUT_BRANDING.border_style);
  });
});
