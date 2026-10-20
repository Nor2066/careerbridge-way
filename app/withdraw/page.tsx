// app/withdraw/page.tsx
//
// "Withdraw from contract here": the page behind the EU withdrawal button
// (Consumer Rights Directive Art. 11a). Linked from the footer of every page,
// the account page and the receipt email, so it is reachable throughout the
// 14 days wherever the customer is.
//
// Open to everyone. Signed in, the customer's purchases from the last few
// weeks are listed to pick from; signed out, they describe the purchase
// themselves. See app/api/withdrawals/route.ts for why both exist.

import type { Metadata } from 'next';
import { getAuthenticatedUser } from '@/lib/supabase-server-auth';
import { supabaseServer } from '@/lib/supabase-server';
import {
  WITHDRAWAL_PERIOD_DAYS,
  isWithdrawable,
  lastDayToWithdraw,
  type PaymentForWithdrawal,
} from '@/lib/withdrawal-rules';
import WithdrawClient, { type WithdrawablePurchase } from './WithdrawClient';

export const metadata: Metadata = {
  title: 'Withdraw from contract',
  description: 'Withdraw from a purchase within 14 days, without giving a reason.',
  robots: { index: false, follow: true },
};

export const dynamic = 'force-dynamic';

// Wider than the period itself so the generous deadline in
// lib/withdrawal-rules.ts is never cut off by the query.
const LOOKBACK_DAYS = WITHDRAWAL_PERIOD_DAYS + 3;

async function loadPurchases(userId: string): Promise<WithdrawablePurchase[]> {
  const since = new Date(Date.now() - LOOKBACK_DAYS * 86_400_000).toISOString();
  const { data: payments, error } = await supabaseServer
    .from('payments')
    .select('id, created_at, product_type, amount_cents, currency, status, stripe_session_id')
    .eq('user_id', userId)
    .gte('created_at', since)
    .order('created_at', { ascending: false });
  if (error) {
    // The free-text option still works, so the page renders without the list
    // rather than failing.
    console.error('WITHDRAW PAGE: could not load purchases:', error.message);
    return [];
  }

  const now = new Date();
  const open = ((payments ?? []) as PaymentForWithdrawal[]).filter((p) => isWithdrawable(p, now));
  if (open.length === 0) return [];

  // Purchases already withdrawn from are shown as such instead of offered
  // again. Before supabase/withdrawals.sql has run, nothing has been.
  const { data: withdrawals, error: withdrawalsError } = await supabaseServer
    .from('withdrawals')
    .select('payment_id, submitted_at')
    .in('payment_id', open.map((p) => p.id));
  if (withdrawalsError) {
    console.error('WITHDRAW PAGE: could not load withdrawals:', withdrawalsError.message);
  }
  const withdrawnAt = new Map<string, string>(
    (withdrawals ?? []).map((w: { payment_id: string; submitted_at: string }) => [w.payment_id, w.submitted_at])
  );

  return open.map((p) => ({
    id: p.id,
    createdAt: p.created_at,
    productType: p.product_type,
    amountCents: p.amount_cents,
    currency: p.currency,
    lastDay: lastDayToWithdraw(new Date(p.created_at)).toISOString(),
    withdrawnAt: withdrawnAt.get(p.id) ?? null,
  }));
}

export default async function WithdrawPage() {
  const user = await getAuthenticatedUser();
  const purchases = user ? await loadPurchases(user.id) : [];

  return (
    <WithdrawClient
      signedIn={Boolean(user)}
      accountEmail={user?.email ?? ''}
      purchases={purchases}
    />
  );
}
