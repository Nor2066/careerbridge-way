'use client';

// app/admin/withdrawals/WithdrawalsAdmin.tsx
//
// Withdrawals customers sent with the "withdraw from contract here" button.
// For each new one, within 14 days of it arriving:
//
//   1. Refund in the Stripe Dashboard: in full for an unused purchase, the
//      unused share for a partly used one (see /refunds).
//   2. Come back here, pick the outcome, check the amounts to take back, Save.
//
// The refund is never made from this page: moving money stays a deliberate
// act in Stripe, where the amount and the card are in front of you.

import { useCallback, useEffect, useState } from 'react';
import AdminHeader from '@/components/AdminHeader';
import {
  formatDay,
  formatMoment,
  formatMoney,
  productName,
  type AttemptRemoval,
  type WithdrawalStatus,
} from '@/lib/withdrawal-rules';

type Purchase = {
  id: string;
  ref: string;
  createdAt: string;
  productType: string;
  amountCents: number;
  currency: string;
  status: string;
  paymentIntentId: string | null;
};

type Withdrawal = {
  id: string;
  reference: string;
  submittedAt: string;
  refundDueBy: string;
  /** Worked out on the server, at load time. */
  overdue: boolean;
  name: string;
  contract: string;
  confirmationEmail: string;
  accountEmail: string | null;
  locale: string;
  acknowledgementSentAt: string | null;
  status: WithdrawalStatus;
  handledAt: string | null;
  note: string | null;
  accountFound: boolean;
  purchase: Purchase | null;
  balance: {
    plan: string;
    main_attempts_remaining: number;
    topup_followup_credits: number;
    followup_bundle_purchased: boolean;
  } | null;
  suggestedRemoval: AttemptRemoval | null;
  recentPurchases: Purchase[];
};

const STATUS_LABEL: Record<WithdrawalStatus, { label: string; className: string }> = {
  received: { label: 'New: refund due', className: 'bg-amber-500/15 text-amber-300 border-amber-500/40' },
  refunded: { label: 'Refunded', className: 'bg-green-500/15 text-green-300 border-green-500/40' },
  partly_refunded: { label: 'Partly refunded', className: 'bg-green-500/15 text-green-300 border-green-500/40' },
  not_owed: { label: 'No refund owed', className: 'bg-gray-500/15 text-gray-300 border-gray-500/40' },
};

const inputClass =
  'w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500';
const labelClass = 'block text-xs font-medium uppercase tracking-wider text-gray-400 mb-1';

function describe(p: Purchase): string {
  return `${productName('en', p.productType)}, ${formatMoney('en', p.amountCents, p.currency)}, bought ${formatMoment('en', new Date(p.createdAt))} (ref. ${p.ref})`;
}

function StripeLink({ p }: { p: Purchase }) {
  if (!p.paymentIntentId) return null;
  return (
    <a
      href={`https://dashboard.stripe.com/payments/${p.paymentIntentId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="ml-2 text-indigo-300 underline"
    >
      Open in Stripe
    </a>
  );
}

async function fetchWithdrawals(): Promise<{ withdrawals: Withdrawal[]; notSetUp: boolean } | { error: string }> {
  try {
    const res = await fetch('/api/admin/withdrawals', { credentials: 'include', cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: data.error || `Request failed (${res.status})` };
    return { withdrawals: data.withdrawals ?? [], notSetUp: Boolean(data.notSetUp) };
  } catch {
    return { error: 'Could not load withdrawals.' };
  }
}

export default function WithdrawalsAdmin() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [notSetUp, setNotSetUp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const applyLoad = useCallback((result: Awaited<ReturnType<typeof fetchWithdrawals>>) => {
    if ('error' in result) {
      setLoadError(result.error);
    } else {
      setWithdrawals(result.withdrawals);
      setNotSetUp(result.notSetUp);
      setLoadError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchWithdrawals().then((result) => {
      if (!cancelled) applyLoad(result);
    });
    return () => {
      cancelled = true;
    };
  }, [applyLoad]);

  const reload = async () => applyLoad(await fetchWithdrawals());
  const open = withdrawals.filter((w) => w.status === 'received').length;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <AdminHeader />
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-white">Withdrawals</h1>
        <p className="mt-1 text-sm text-gray-400">
          Sent with the &ldquo;withdraw from contract here&rdquo; button. Refund each new one in
          Stripe within 14 days of it arriving, then record it here: that also takes back what
          the purchase granted.
        </p>

        {notSetUp && (
          <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
            The withdrawals table does not exist yet, so customers&rsquo; withdrawals cannot be
            recorded. Run <code>supabase/withdrawals.sql</code> in the Supabase SQL Editor.
          </p>
        )}
        {loadError && (
          <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{loadError}</p>
        )}
        {loading && <p className="mt-6 text-sm text-gray-400">Loading…</p>}
        {!loading && !loadError && !notSetUp && withdrawals.length === 0 && (
          <p className="mt-6 text-sm text-gray-400">No withdrawals yet.</p>
        )}
        {open > 0 && (
          <p className="mt-4 text-sm font-medium text-amber-300">
            {open} waiting for a refund.
          </p>
        )}

        <div className="mt-6 flex flex-col gap-4">
          {withdrawals.map((w) => (
            <WithdrawalCard key={w.id} w={w} onSaved={reload} />
          ))}
        </div>
      </div>
    </div>
  );
}

function WithdrawalCard({ w, onSaved }: { w: Withdrawal; onSaved: () => Promise<void> }) {
  const firstHandling = w.status === 'received';
  const suggested = w.suggestedRemoval;

  const [status, setStatus] = useState<WithdrawalStatus>(firstHandling ? 'refunded' : w.status);
  const [note, setNote] = useState(w.note ?? '');
  const [mainAttempts, setMainAttempts] = useState(String(suggested?.mainAttempts ?? 0));
  const [followupCredits, setFollowupCredits] = useState(String(suggested?.followupCredits ?? 0));
  const [revokeBundle, setRevokeBundle] = useState(suggested?.revokeBundle ?? false);
  const [resetPlan, setResetPlan] = useState(suggested?.resetPlan ?? false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const overdue = firstHandling && w.overdue;
  const canRemove = firstHandling && w.accountFound && status !== 'not_owed' && status !== 'received';

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const main = Number(mainAttempts);
      const followup = Number(followupCredits);
      if (![main, followup].every((n) => Number.isInteger(n) && n >= 0 && n <= 20)) {
        throw new Error('Attempts to take back must be whole numbers from 0 to 20.');
      }
      const res = await fetch(`/api/admin/withdrawals/${w.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status,
          note: note.trim() || undefined,
          ...(canRemove
            ? {
                removeMainAttempts: main,
                removeFollowupCredits: followup,
                revokeFollowupBundle: revokeBundle,
                resetPlan,
              }
            : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Save failed (${res.status})`);
      setMessage({ ok: true, text: 'Saved.' });
      await onSaved();
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : 'Could not save.' });
    } finally {
      setSaving(false);
    }
  };

  const badge = STATUS_LABEL[w.status];

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-white">{w.reference}</span>
          <span className={`rounded-full border px-2 py-0.5 text-xs ${badge.className}`}>{badge.label}</span>
        </div>
        <div className="text-right text-xs text-gray-400">
          <div>Received {formatMoment('en', new Date(w.submittedAt))}</div>
          {firstHandling && (
            <div className={overdue ? 'font-semibold text-red-300' : 'text-amber-300'}>
              Refund {overdue ? 'was due' : 'due'} by {formatDay('en', new Date(w.refundDueBy))}
            </div>
          )}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-[10rem_1fr]">
        <dt className="text-gray-400">Name</dt>
        <dd>{w.name}</dd>
        <dt className="text-gray-400">Purchase, as stated</dt>
        <dd className="whitespace-pre-wrap">{w.contract}</dd>
        <dt className="text-gray-400">Confirmation sent to</dt>
        <dd>
          {w.confirmationEmail}{' '}
          {w.acknowledgementSentAt ? (
            <span className="text-xs text-green-300">(emailed)</span>
          ) : (
            <span className="text-xs font-semibold text-red-300">
              (NOT emailed: send the customer a confirmation by hand)
            </span>
          )}
        </dd>
        <dt className="text-gray-400">Account</dt>
        <dd>
          {w.accountEmail ?? '—'}{' '}
          {!w.accountFound && <span className="text-xs text-amber-300">(no matching account found)</span>}
        </dd>
        {w.purchase && (
          <>
            <dt className="text-gray-400">Linked purchase</dt>
            <dd>
              {describe(w.purchase)}
              <StripeLink p={w.purchase} />
            </dd>
          </>
        )}
        {w.recentPurchases.length > 0 && (
          <>
            <dt className="text-gray-400">{w.purchase ? 'Other purchases' : 'Recent purchases'}</dt>
            <dd className="flex flex-col gap-1">
              {w.recentPurchases.map((p) => (
                <span key={p.id}>
                  {describe(p)}
                  <StripeLink p={p} />
                </span>
              ))}
            </dd>
          </>
        )}
        {w.balance && (
          <>
            <dt className="text-gray-400">Balance now</dt>
            <dd>
              Plan {w.balance.plan} · {w.balance.main_attempts_remaining} attempt(s) ·{' '}
              {w.balance.topup_followup_credits} follow-up credit(s) · bundle{' '}
              {w.balance.followup_bundle_purchased ? 'yes' : 'no'}
            </dd>
          </>
        )}
      </dl>

      <div className="mt-5 grid gap-4 border-t border-gray-800 pt-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor={`status-${w.id}`}>Outcome</label>
          <select
            id={`status-${w.id}`}
            className={inputClass}
            value={status}
            onChange={(e) => setStatus(e.target.value as WithdrawalStatus)}
          >
            <option value="received">Not handled yet</option>
            <option value="refunded">Refunded in full</option>
            <option value="partly_refunded">Refunded the unused part</option>
            <option value="not_owed">No refund owed</option>
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor={`note-${w.id}`}>Note (amount refunded, reason)</label>
          <input
            id={`note-${w.id}`}
            className={inputClass}
            value={note}
            maxLength={2000}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Refunded €3.00 in Stripe, 1 attempt was used"
          />
        </div>

        {canRemove && (
          <div className="sm:col-span-2 rounded-lg border border-gray-800 bg-gray-950/50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Take back with this save (once only)
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor={`main-${w.id}`}>Attempts</label>
                <input
                  id={`main-${w.id}`}
                  type="number"
                  min={0}
                  max={20}
                  className={inputClass}
                  value={mainAttempts}
                  onChange={(e) => setMainAttempts(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor={`followup-${w.id}`}>Follow-up credits</label>
                <input
                  id={`followup-${w.id}`}
                  type="number"
                  min={0}
                  max={20}
                  className={inputClass}
                  value={followupCredits}
                  onChange={(e) => setFollowupCredits(e.target.value)}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input type="checkbox" checked={revokeBundle} onChange={(e) => setRevokeBundle(e.target.checked)} />
                Remove the follow-up bundle
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input type="checkbox" checked={resetPlan} onChange={(e) => setResetPlan(e.target.checked)} />
                Set the plan back to free
              </label>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              {suggested
                ? 'Filled in with everything the linked purchase granted. Lower it if some was used, or if other purchases share the balance.'
                : 'No purchase is linked, so nothing is filled in. Match it against the purchases above first.'}{' '}
              Balances never go below zero.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        {message && (
          <span className={`text-sm ${message.ok ? 'text-green-300' : 'text-red-300'}`}>{message.text}</span>
        )}
      </div>
    </div>
  );
}
