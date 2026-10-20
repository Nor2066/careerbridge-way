import { describe, it, expect } from 'vitest';
import {
  acknowledgementEmail,
  describePurchase,
  formatMoment,
  isWithdrawable,
  lastDayToWithdraw,
  orderReference,
  planAttemptRemoval,
  refundDueBy,
  suggestedRemoval,
  withdrawalDeadline,
  withdrawalReference,
  type PaymentForWithdrawal,
} from '@/lib/withdrawal-rules';
import { ATTEMPTS_GRANTED } from '@/lib/plans';

const payment = (o: Partial<PaymentForWithdrawal> = {}): PaymentForWithdrawal => ({
  id: '1a2b3c4d-0000-4000-8000-000000000000',
  created_at: '2026-10-01T10:00:00Z',
  product_type: 'full',
  amount_cents: 450,
  currency: 'eur',
  status: 'completed',
  stripe_session_id: 'cs_test_123',
  ...o,
});

describe('the withdrawal period', () => {
  it('ends with the 14th day after the purchase day, which does not count', () => {
    expect(lastDayToWithdraw(new Date('2026-10-01T10:00:00Z')).toISOString()).toBe('2026-10-15T00:00:00.000Z');
    // Bought one minute before midnight UTC: still the same purchase day.
    expect(lastDayToWithdraw(new Date('2026-10-01T23:59:00Z')).toISOString()).toBe('2026-10-15T00:00:00.000Z');
  });

  // The legal deadline is midnight in the customer's own zone, which we do
  // not know. The furthest any zone reaches is UTC+14 buying just after its
  // midnight, whose period ends at 10:00 UTC on day 15 (UTC-12 reaches 12:00).
  it('stays open until every time zone’s period has ended', () => {
    const bought = new Date('2026-10-01T10:00:00Z');
    const deadline = withdrawalDeadline(bought);
    expect(deadline.toISOString()).toBe('2026-10-17T00:00:00.000Z');
    expect(deadline.getTime()).toBeGreaterThan(new Date('2026-10-16T12:00:00Z').getTime());
  });

  it('is offered inside the period and not after it', () => {
    expect(isWithdrawable(payment(), new Date('2026-10-14T12:00:00Z'))).toBe(true);
    expect(isWithdrawable(payment(), new Date('2026-10-16T23:59:59Z'))).toBe(true);
    expect(isWithdrawable(payment(), new Date('2026-10-17T00:00:00Z'))).toBe(false);
  });

  it('is not offered for a regrant, which is not a new contract', () => {
    const now = new Date('2026-10-02T00:00:00Z');
    expect(isWithdrawable(payment({ stripe_session_id: 'regrant_cs_test_123_abc', amount_cents: 0 }), now)).toBe(false);
    expect(isWithdrawable(payment({ amount_cents: 0 }), now)).toBe(false);
    expect(isWithdrawable(payment({ status: 'refunded' }), now)).toBe(false);
  });

  it('gives the founders 14 days from the statement to refund', () => {
    expect(refundDueBy(new Date('2026-10-20T09:30:00Z')).toISOString()).toBe('2026-11-03T09:30:00.000Z');
  });
});

describe('naming the contract', () => {
  it('describes a purchase in English and Spanish', () => {
    expect(describePurchase('en', payment())).toBe('Full plan, €4.50, bought 1 October 2026 (order ref. 1A2B3C4D)');
    // The currency sign follows Intl, as on the pricing cards ("4,50 EUR" or
    // "4,50 €" depending on the ICU data), so only the rest is pinned.
    expect(describePurchase('es', payment())).toMatch(
      /^Plan Completo, 4,50\s(€|EUR), comprado el 1 de octubre de 2026 \(ref\. de pedido 1A2B3C4D\)$/
    );
  });

  it('keeps the two kinds of reference apart', () => {
    expect(orderReference('1a2b3c4d-0000-4000-8000-000000000000')).toBe('1A2B3C4D');
    expect(withdrawalReference('9f8e7d6c-0000-4000-8000-000000000000')).toBe('W-9F8E7D6C');
  });

  it('states the time with its zone', () => {
    expect(formatMoment('en', new Date('2026-10-20T14:03:00Z'))).toBe('20 October 2026 at 14:03 UTC');
  });
});

describe('the acknowledgement', () => {
  const statement = {
    reference: 'W-9F8E7D6C',
    name: 'Ana García',
    contract: 'Full plan, €4.50, bought 1 October 2026 (order ref. 1A2B3C4D)',
    confirmationEmail: 'ana@example.com',
    submittedAt: new Date('2026-10-05T08:15:00Z'),
  };

  // Article 11a(4): the content of the statement, and the date and time.
  it('repeats everything the customer sent, and when', () => {
    const { subject, text } = acknowledgementEmail('en', statement, 'ADAQNO');
    expect(subject).toContain('W-9F8E7D6C');
    for (const part of [statement.name, statement.contract, statement.confirmationEmail, '5 October 2026 at 08:15 UTC']) {
      expect(text).toContain(part);
    }
  });

  it('is written in the customer’s language', () => {
    const { subject, text } = acknowledgementEmail('es', statement, 'ADAQNO');
    expect(subject).toMatch(/hemos recibido tu desistimiento/);
    expect(text).toContain('Ana García');
    expect(text).toMatch(/UTC/);
  });
});

describe('taking back a refunded purchase', () => {
  const none = { mainAttempts: 0, followupCredits: 0, revokeBundle: false, resetPlan: false };

  it('suggests exactly what each product granted', () => {
    expect(suggestedRemoval('full', ATTEMPTS_GRANTED, false)).toEqual({ ...none, mainAttempts: 3, resetPlan: true });
    expect(suggestedRemoval('basic', ATTEMPTS_GRANTED, false)).toEqual({ ...none, mainAttempts: 2, resetPlan: true });
    expect(suggestedRemoval('topup', ATTEMPTS_GRANTED, false)).toEqual({ ...none, mainAttempts: 3, followupCredits: 3 });
    expect(suggestedRemoval('followup_unlock', ATTEMPTS_GRANTED, true)).toEqual({ ...none, mainAttempts: 1, revokeBundle: true });
  });

  it('never takes a balance below zero, and pins what it read', () => {
    const plan = planAttemptRemoval(
      { plan: 'full', main_attempts_remaining: 1, topup_followup_credits: null, followup_bundle_purchased: false },
      { mainAttempts: 3, followupCredits: 3, revokeBundle: true, resetPlan: true }
    );
    expect(plan).toEqual({
      updates: { main_attempts_remaining: 0, topup_followup_credits: 0, plan: 'free' },
      guards: { main_attempts_remaining: 1, topup_followup_credits: null, plan: 'full' },
    });
  });

  it('does nothing when there is nothing to take', () => {
    expect(planAttemptRemoval({ plan: 'free', main_attempts_remaining: 2 }, none)).toBeNull();
    expect(planAttemptRemoval({ plan: 'free', main_attempts_remaining: 2 }, { ...none, resetPlan: true })).toBeNull();
  });
});
