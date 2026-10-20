// lib/withdrawal-rules.ts
//
// The rules behind the EU "withdraw from contract here" button: Article 11a of
// the Consumer Rights Directive, added by Directive (EU) 2023/2673 and applying
// from 19 June 2026. Anyone who buys online must be able to withdraw online,
// as easily as they bought:
//
//   1. a function labelled "withdraw from contract here", available, prominent
//      and easy to reach for the whole withdrawal period;
//   2. a statement where the customer gives their name, which contract, and
//      where the confirmation should go;
//   3. a second, separate "confirm withdrawal" step, so nobody withdraws by
//      accident;
//   4. an acknowledgement on a durable medium (email) without undue delay,
//      repeating the statement and the date and time it was sent.
//
// The page is app/withdraw, the endpoint app/api/withdrawals. This file is the
// part with no I/O, so the tests can pin it down. Client-safe on purpose: the
// page formats the same dates and names the email does.

import { INTL_LOCALE, type Locale } from '@/lib/i18n/config';
import { translate } from '@/lib/i18n/translate';
import type { MessageKey } from '@/lib/i18n/messages';

export const WITHDRAWAL_PERIOD_DAYS = 14;

/** How long we have to pay the refund once told (Article 13: 14 days). */
export const REFUND_DUE_DAYS = 14;

const DAY_MS = 86_400_000;

function startOfUtcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * The last day of the withdrawal period, for showing to the customer.
 *
 * The day of purchase does not count; the 14 days run from the next day and
 * end when the 14th is over.
 */
export function lastDayToWithdraw(purchasedAt: Date): Date {
  return new Date(startOfUtcDay(purchasedAt) + WITHDRAWAL_PERIOD_DAYS * DAY_MS);
}

/**
 * The moment the button stops being offered for a purchase.
 *
 * The legal period ends at midnight in the customer's own time zone, which we
 * do not know. Closing at the end of the 15th UTC day after purchase covers
 * every zone from UTC-12 to UTC+14: nobody loses the button before their
 * period is over, and at worst it stays up a day and a half longer than it
 * has to. Erring late costs a refund we would usually give anyway; erring
 * early takes away a legal right.
 */
export function withdrawalDeadline(purchasedAt: Date): Date {
  return new Date(startOfUtcDay(purchasedAt) + (WITHDRAWAL_PERIOD_DAYS + 2) * DAY_MS);
}

export function isWithinWithdrawalPeriod(purchasedAt: Date, now: Date = new Date()): boolean {
  return now.getTime() < withdrawalDeadline(purchasedAt).getTime();
}

/** When the refund for a withdrawal received at `submittedAt` must be paid. */
export function refundDueBy(submittedAt: Date): Date {
  return new Date(submittedAt.getTime() + REFUND_DUE_DAYS * DAY_MS);
}

/** The columns of a payments row these rules read. */
export type PaymentForWithdrawal = {
  id: string;
  created_at: string;
  product_type: string;
  amount_cents: number;
  currency: string;
  status: string;
  stripe_session_id: string;
};

/**
 * Whether the button is offered for this purchase.
 *
 * A regrant (app/api/admin/regrant) writes a row with a synthetic session id
 * and nothing charged: it moved an existing purchase to another account, so
 * it is not a contract of its own. The original row is the one to withdraw.
 */
export function isWithdrawable(payment: PaymentForWithdrawal, now: Date = new Date()): boolean {
  return (
    payment.status === 'completed' &&
    payment.amount_cents > 0 &&
    !payment.stripe_session_id.startsWith('regrant_') &&
    isWithinWithdrawalPeriod(new Date(payment.created_at), now)
  );
}

/** A short, readable order reference: the start of the payment's id. */
export function orderReference(paymentId: string): string {
  return paymentId.replace(/-/g, '').slice(0, 8).toUpperCase();
}

/** The same for a withdrawal, prefixed so the two are never confused. */
export function withdrawalReference(withdrawalId: string): string {
  return `W-${orderReference(withdrawalId)}`;
}

const PRODUCT_NAME_KEYS: Record<string, MessageKey> = {
  basic: 'withdraw.product.basic',
  full: 'withdraw.product.full',
  followup_unlock: 'withdraw.product.followup_unlock',
  topup: 'withdraw.product.topup',
};

export function productName(locale: Locale, productType: string): string {
  const key = PRODUCT_NAME_KEYS[productType];
  return key ? translate(locale, key) : productType;
}

export function formatMoney(locale: Locale, amountCents: number, currency: string): string {
  const code = (currency || 'gbp').toUpperCase();
  try {
    return new Intl.NumberFormat(INTL_LOCALE[locale], { style: 'currency', currency: code })
      .format(amountCents / 100);
  } catch {
    return `${(amountCents / 100).toFixed(2)} ${code}`;
  }
}

/**
 * A date with no time. In UTC so the server and the browser print the same
 * day; the period itself is generous enough to absorb the difference.
 */
export function formatDay(locale: Locale, date: Date): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/**
 * Date and time with the zone spelled out. The acknowledgement has to state
 * when the withdrawal was sent; "14:03" without a zone does not.
 */
export function formatMoment(locale: Locale, date: Date): string {
  const text = new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(date);
  return `${text} UTC`;
}

/**
 * The contract, described the way the statement and the acknowledgement name
 * it: "Full plan, £4.50, bought 18 October 2026 (order ref. 1A2B3C4D)".
 */
export function describePurchase(
  locale: Locale,
  payment: Pick<PaymentForWithdrawal, 'id' | 'created_at' | 'product_type' | 'amount_cents' | 'currency'>
): string {
  return translate(locale, 'withdraw.purchase.description', {
    product: productName(locale, payment.product_type),
    amount: formatMoney(locale, payment.amount_cents, payment.currency),
    date: formatDay(locale, new Date(payment.created_at)),
    ref: orderReference(payment.id),
  });
}

/** How a withdrawal ended, as the founders record it on /admin/withdrawals. */
export const WITHDRAWAL_STATUSES = ['received', 'refunded', 'partly_refunded', 'not_owed'] as const;
export type WithdrawalStatus = (typeof WITHDRAWAL_STATUSES)[number];

/** The balance columns a refund takes back. */
export type RemovableBalance = {
  plan?: string | null;
  main_attempts_remaining: number;
  topup_followup_credits?: number | null;
  followup_bundle_purchased?: boolean | null;
};

export type AttemptRemoval = {
  mainAttempts: number;
  followupCredits: number;
  revokeBundle: boolean;
  /** Back to the free plan, so a refunded plan can be bought again. */
  resetPlan: boolean;
};

/**
 * Taking back what a refunded purchase granted, as a compare-and-swap.
 *
 * The same shape as the grant in lib/fulfillment.ts: `guards` pins every
 * column the new value was computed from, so a report generated at the same
 * moment makes the write miss and retry instead of being overwritten. Never
 * goes below zero: anything already used is used, and the refund amount is
 * where that is accounted for, not the balance.
 */
export function planAttemptRemoval(
  sub: RemovableBalance,
  remove: AttemptRemoval
): { updates: Record<string, unknown>; guards: Record<string, unknown> } | null {
  const updates: Record<string, unknown> = {};
  const guards: Record<string, unknown> = {};

  if (remove.mainAttempts > 0) {
    updates.main_attempts_remaining = Math.max(sub.main_attempts_remaining - remove.mainAttempts, 0);
    guards.main_attempts_remaining = sub.main_attempts_remaining;
  }
  if (remove.followupCredits > 0) {
    const current = sub.topup_followup_credits ?? 0;
    updates.topup_followup_credits = Math.max(current - remove.followupCredits, 0);
    guards.topup_followup_credits = sub.topup_followup_credits ?? null;
  }
  if (remove.revokeBundle && sub.followup_bundle_purchased) {
    updates.followup_bundle_purchased = false;
    guards.followup_bundle_purchased = true;
  }
  if (remove.resetPlan && sub.plan && sub.plan !== 'free') {
    updates.plan = 'free';
    guards.plan = sub.plan;
  }

  return Object.keys(updates).length ? { updates, guards } : null;
}

/**
 * What a full refund of one purchase should take back, as the starting values
 * on /admin/withdrawals. A founder can change them: a partly used purchase,
 * or a plan bought alongside a top-up, needs judgement, not a formula.
 * Mirrors the grants in lib/fulfillment.ts; `attemptsGranted` is passed in so
 * this file stays free of lib/plans.ts and its server-only settings.
 */
export function suggestedRemoval(
  productType: string,
  attemptsGranted: Record<string, number>,
  bonusAttemptGranted: boolean
): AttemptRemoval {
  const granted = attemptsGranted[productType] ?? 0;
  switch (productType) {
    case 'basic':
    case 'full':
      return { mainAttempts: granted, followupCredits: 0, revokeBundle: false, resetPlan: true };
    case 'topup':
      return { mainAttempts: granted, followupCredits: granted, revokeBundle: false, resetPlan: false };
    case 'followup_unlock':
      return { mainAttempts: bonusAttemptGranted ? 1 : 0, followupCredits: 0, revokeBundle: true, resetPlan: false };
    default:
      return { mainAttempts: 0, followupCredits: 0, revokeBundle: false, resetPlan: false };
  }
}

/** What the customer stated, as the acknowledgement repeats it back. */
export type WithdrawalStatement = {
  reference: string;
  name: string;
  contract: string;
  confirmationEmail: string;
  submittedAt: Date;
};

/**
 * The acknowledgement email. Article 11a(4) asks for the content of the
 * statement and the date and time it was sent, so all of it is here
 * verbatim, before anything else we have to say.
 */
export function acknowledgementEmail(
  locale: Locale,
  statement: WithdrawalStatement,
  brand: string
): { subject: string; text: string } {
  const t = (key: MessageKey, vars?: Record<string, string | number>) => translate(locale, key, vars);
  const lines = [
    t('withdraw.email.opening'),
    '',
    `  ${t('withdraw.field.reference')}: ${statement.reference}`,
    `  ${t('withdraw.field.submittedAt')}: ${formatMoment(locale, statement.submittedAt)}`,
    `  ${t('withdraw.field.name')}: ${statement.name}`,
    `  ${t('withdraw.field.contract')}: ${statement.contract}`,
    `  ${t('withdraw.field.confirmationTo')}: ${statement.confirmationEmail}`,
    '',
    t('withdraw.email.next', { days: REFUND_DUE_DAYS }),
    '',
    t('withdraw.email.keep'),
  ];
  return {
    subject: t('withdraw.email.subject', { brand, reference: statement.reference }),
    text: lines.join('\n'),
  };
}
