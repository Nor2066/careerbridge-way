'use client';

// app/withdraw/WithdrawClient.tsx
//
// The withdrawal statement and its "Confirm withdrawal" button. Article 11a
// asks for exactly three things — name, which contract, where to send the
// confirmation — and a separate confirm step, so that is all this form asks:
// no reason, no survey, no "are you sure" detour. Pre-filling what we already
// know is allowed ("provide or confirm"), so the purchase and email are filled
// in where we can.

import { useState } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useI18n } from '@/components/I18nProvider';
import type { MessageKey } from '@/lib/i18n/messages';
import { describePurchase, formatDay, formatMoment, REFUND_DUE_DAYS } from '@/lib/withdrawal-rules';

export type WithdrawablePurchase = {
  id: string;
  createdAt: string;
  productType: string;
  amountCents: number;
  currency: string;
  /** The last day of the period, for display. */
  lastDay: string;
  /** Set when this purchase has already been withdrawn from. */
  withdrawnAt: string | null;
};

type Receipt = {
  withdrawal: {
    reference: string;
    name: string;
    contract: string;
    confirmationEmail: string;
    submittedAt: string;
  };
  emailed: boolean;
  alreadySubmitted: boolean;
};

const OTHER = 'other';

const ERROR_KEYS: Record<string, MessageKey> = {
  TOO_MANY: 'withdraw.error.tooMany',
  EXPIRED: 'withdraw.error.expired',
  NOT_FOUND: 'withdraw.error.notFound',
  INVALID: 'withdraw.error.form',
};

const inputClass =
  'w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-white placeholder:text-gray-600 focus:border-indigo-400/60 focus:outline-none';
const labelClass = 'block text-sm font-medium text-gray-200';

export default function WithdrawClient({
  signedIn,
  accountEmail,
  purchases,
}: {
  signedIn: boolean;
  accountEmail: string;
  purchases: WithdrawablePurchase[];
}) {
  const { t, locale } = useI18n();

  const open = purchases.filter((p) => !p.withdrawnAt);
  const [choice, setChoice] = useState<string>(open[0]?.id ?? OTHER);
  const [otherText, setOtherText] = useState('');
  const [name, setName] = useState('');
  const [confirmationEmail, setConfirmationEmail] = useState(accountEmail);
  const [boughtWith, setBoughtWith] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const describing = !signedIn || choice === OTHER;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const body: Record<string, string> = { name, confirmationEmail };
    if (describing) body.contractDetails = otherText;
    else body.paymentId = choice;
    if (!signedIn && boughtWith.trim()) body.accountEmail = boughtWith;

    try {
      const res = await fetchWithAuth('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(t(ERROR_KEYS[data.code] ?? 'withdraw.error.generic'));
        return;
      }
      setReceipt(data as Receipt);
      window.scrollTo({ top: 0 });
    } catch {
      setError(t('account.networkCheck'));
    } finally {
      setSubmitting(false);
    }
  };

  if (receipt) {
    const w = receipt.withdrawal;
    return (
      <main className="min-h-screen bg-slate-950 px-5 py-14">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="text-3xl font-bold text-white">{t('withdraw.done.title')}</h1>
          <p className="mt-3 text-gray-300">
            {receipt.alreadySubmitted
              ? t('withdraw.done.already')
              : receipt.emailed
                ? t('withdraw.done.emailed', { email: w.confirmationEmail })
                : t('withdraw.done.notEmailed')}
          </p>

          <dl className="mt-8 grid grid-cols-1 gap-x-6 gap-y-3 rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-6 text-sm sm:grid-cols-[auto_1fr]">
            <dt className="text-gray-400">{t('withdraw.field.reference')}</dt>
            <dd className="font-mono text-white">{w.reference}</dd>
            <dt className="text-gray-400">{t('withdraw.field.submittedAt')}</dt>
            <dd className="text-white">{formatMoment(locale, new Date(w.submittedAt))}</dd>
            <dt className="text-gray-400">{t('withdraw.field.name')}</dt>
            <dd className="text-white">{w.name}</dd>
            <dt className="text-gray-400">{t('withdraw.field.contract')}</dt>
            <dd className="whitespace-pre-wrap text-white">{w.contract}</dd>
            <dt className="text-gray-400">{t('withdraw.field.confirmationTo')}</dt>
            <dd className="text-white">{w.confirmationEmail}</dd>
          </dl>

          <p className="mt-6 text-sm leading-relaxed text-gray-400">
            {t('withdraw.done.next', { days: REFUND_DUE_DAYS })}
          </p>

          <button onClick={() => window.print()} className="btn-secondary mt-6 text-sm print:hidden">
            {t('withdraw.done.print')}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-14">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-white">{t('withdraw.title')}</h1>
        <p className="mt-3 leading-relaxed text-gray-300">{t('withdraw.intro')}</p>
        <p className="mt-3 text-sm leading-relaxed text-gray-400">
          {t('withdraw.refundRule.before')}
          <Link href="/refunds" className="text-indigo-300 underline">
            {t('withdraw.refundRule.link')}
          </Link>
          .
        </p>

        {!signedIn && (
          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            {t('withdraw.signedOut.before')}
            <Link href="/login?returnTo=/withdraw" className="text-indigo-300 underline">
              {t('withdraw.signedOut.link')}
            </Link>
            {t('withdraw.signedOut.after')}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col gap-6 rounded-xl border border-white/10 bg-white/5 p-6"
        >
          <div>
            <label htmlFor="withdraw-name" className={labelClass}>
              {t('withdraw.field.name')}
            </label>
            <input
              id="withdraw-name"
              type="text"
              autoComplete="name"
              required
              maxLength={200}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${inputClass} mt-2`}
            />
          </div>

          <fieldset>
            <legend className={labelClass}>{t('withdraw.purchase.legend')}</legend>

            {signedIn && (
              <div className="mt-3 flex flex-col gap-3">
                {open.length === 0 && (
                  <p className="text-sm leading-relaxed text-gray-400">{t('withdraw.purchase.none')}</p>
                )}
                {purchases.map((p) => {
                  const withdrawn = Boolean(p.withdrawnAt);
                  return (
                    <label
                      key={p.id}
                      className={`flex gap-3 rounded-lg border p-3 text-sm ${
                        withdrawn
                          ? 'cursor-not-allowed border-white/5 text-gray-500'
                          : choice === p.id
                            ? 'cursor-pointer border-indigo-400/60 bg-indigo-400/10 text-white'
                            : 'cursor-pointer border-white/10 text-gray-200 hover:border-white/25'
                      }`}
                    >
                      <input
                        type="radio"
                        name="purchase"
                        value={p.id}
                        disabled={withdrawn}
                        checked={choice === p.id}
                        onChange={() => setChoice(p.id)}
                        className="mt-1"
                      />
                      <span>
                        <span className="block">
                          {describePurchase(locale, {
                            id: p.id,
                            created_at: p.createdAt,
                            product_type: p.productType,
                            amount_cents: p.amountCents,
                            currency: p.currency,
                          })}
                        </span>
                        <span className="mt-1 block text-xs text-gray-400">
                          {withdrawn
                            ? t('withdraw.purchase.already', { date: formatDay(locale, new Date(p.withdrawnAt!)) })
                            : t('withdraw.purchase.until', { date: formatDay(locale, new Date(p.lastDay)) })}
                        </span>
                      </span>
                    </label>
                  );
                })}
                <label
                  className={`flex cursor-pointer gap-3 rounded-lg border p-3 text-sm ${
                    choice === OTHER
                      ? 'border-indigo-400/60 bg-indigo-400/10 text-white'
                      : 'border-white/10 text-gray-200 hover:border-white/25'
                  }`}
                >
                  <input
                    type="radio"
                    name="purchase"
                    value={OTHER}
                    checked={choice === OTHER}
                    onChange={() => setChoice(OTHER)}
                    className="mt-1"
                  />
                  <span>{t('withdraw.purchase.other')}</span>
                </label>
              </div>
            )}

            {describing && (
              <div className="mt-3">
                <label htmlFor="withdraw-contract" className="block text-sm text-gray-400">
                  {t('withdraw.purchase.otherLabel')}
                </label>
                <textarea
                  id="withdraw-contract"
                  required
                  minLength={3}
                  maxLength={1000}
                  rows={3}
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  placeholder={t('withdraw.purchase.otherPlaceholder')}
                  className={`${inputClass} mt-2`}
                />
              </div>
            )}
          </fieldset>

          <div>
            <label htmlFor="withdraw-email" className={labelClass}>
              {t('withdraw.field.confirmationEmail')}
            </label>
            <input
              id="withdraw-email"
              type="email"
              autoComplete="email"
              required
              maxLength={320}
              value={confirmationEmail}
              onChange={(e) => setConfirmationEmail(e.target.value)}
              className={`${inputClass} mt-2`}
            />
          </div>

          {!signedIn && (
            <div>
              <label htmlFor="withdraw-account" className="block text-sm text-gray-400">
                {t('withdraw.accountEmail')}
              </label>
              <input
                id="withdraw-account"
                type="email"
                autoComplete="off"
                maxLength={320}
                value={boughtWith}
                onChange={(e) => setBoughtWith(e.target.value)}
                className={`${inputClass} mt-2`}
              />
            </div>
          )}

          {error && <p className="text-sm text-red-300">{error}</p>}

          {/* The confirmation function. Its label is the directive's own
              wording and nothing else, per Article 11a(3). */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary self-start disabled:opacity-50"
          >
            {submitting ? t('withdraw.submitting') : t('withdraw.confirm')}
          </button>
        </form>
      </div>
    </main>
  );
}
