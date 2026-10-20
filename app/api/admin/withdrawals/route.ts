// app/api/admin/withdrawals/route.ts
//
// GET  every withdrawal statement, newest first, with what the founders need to
//      act on it: the purchase it names, the account's current balance, and the
//      account's other recent purchases (for statements written in the
//      customer's own words, which do not point at a purchase).
//
// Handling one is PATCH /api/admin/withdrawals/[id].

import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { requireAdmin } from '@/lib/admin-gate';
import { isUnauthorized, unauthorizedResponse } from '@/lib/api-errors';
import { isMissingTableError } from '@/lib/account-data';
import { NO_STORE_HEADERS } from '@/lib/auth-cookies';
import { supabaseServer } from '@/lib/supabase-server';
import { ATTEMPTS_GRANTED } from '@/lib/plans';
import { refundDueBy, withdrawalReference, orderReference, suggestedRemoval } from '@/lib/withdrawal-rules';

export const dynamic = 'force-dynamic';

const RECENT_PURCHASE_DAYS = 30;

type PaymentRow = {
  id: string;
  user_id: string | null;
  created_at: string;
  product_type: string;
  amount_cents: number;
  currency: string;
  status: string;
  stripe_payment_intent_id: string | null;
};

function toPurchase(p: PaymentRow) {
  return {
    id: p.id,
    ref: orderReference(p.id),
    createdAt: p.created_at,
    productType: p.product_type,
    amountCents: p.amount_cents,
    currency: p.currency,
    status: p.status,
    paymentIntentId: p.stripe_payment_intent_id,
  };
}

export async function GET(request: Request) {
  try {
    const gate = await requireAdmin(request);
    if ('response' in gate) return gate.response;

    const { data: rows, error } = await supabaseServer
      .from('withdrawals')
      .select('*')
      .order('submitted_at', { ascending: false })
      .limit(200);
    if (error && isMissingTableError(error)) {
      return NextResponse.json(
        { withdrawals: [], notSetUp: true },
        { headers: NO_STORE_HEADERS }
      );
    }
    if (error) throw error;

    const withdrawals = rows ?? [];
    const userIds = [...new Set(withdrawals.map((w) => w.user_id).filter(Boolean))] as string[];
    const paymentIds = withdrawals.map((w) => w.payment_id).filter(Boolean) as string[];

    const PAYMENT_COLUMNS =
      'id, user_id, created_at, product_type, amount_cents, currency, status, stripe_payment_intent_id';

    const [named, recent, subs] = await Promise.all([
      paymentIds.length
        ? supabaseServer.from('payments').select(PAYMENT_COLUMNS).in('id', paymentIds)
        : Promise.resolve({ data: [], error: null }),
      userIds.length
        ? supabaseServer
            .from('payments')
            .select(PAYMENT_COLUMNS)
            .in('user_id', userIds)
            .order('created_at', { ascending: false })
            .limit(500)
        : Promise.resolve({ data: [], error: null }),
      userIds.length
        ? supabaseServer
            .from('subscriptions')
            .select('user_id, plan, main_attempts_remaining, topup_followup_credits, followup_bundle_purchased, bonus_attempt_granted')
            .in('user_id', userIds)
        : Promise.resolve({ data: [], error: null }),
    ]);
    for (const result of [named, recent, subs]) if (result.error) throw result.error;

    const paymentsById = new Map((named.data as PaymentRow[]).map((p) => [p.id, p]));
    type Balance = {
      user_id: string;
      plan: string;
      main_attempts_remaining: number;
      topup_followup_credits: number;
      followup_bundle_purchased: boolean;
      bonus_attempt_granted: boolean;
    };
    const subsByUser = new Map((subs.data as Balance[]).map((s) => [s.user_id, s]));

    return NextResponse.json(
      {
        withdrawals: withdrawals.map((w) => {
          const submitted = new Date(w.submitted_at);
          const windowStart = submitted.getTime() - RECENT_PURCHASE_DAYS * 86_400_000;
          const payment = w.payment_id ? paymentsById.get(w.payment_id) : undefined;
          const balance = w.user_id ? subsByUser.get(w.user_id) ?? null : null;
          return {
            id: w.id,
            reference: withdrawalReference(w.id),
            submittedAt: w.submitted_at,
            refundDueBy: refundDueBy(submitted).toISOString(),
            overdue: w.status === 'received' && refundDueBy(submitted).getTime() < Date.now(),
            name: w.consumer_name,
            contract: w.contract_details,
            confirmationEmail: w.confirmation_email,
            accountEmail: w.account_email,
            locale: w.locale,
            acknowledgementSentAt: w.acknowledgement_sent_at,
            status: w.status,
            handledAt: w.handled_at,
            note: w.handled_note,
            accountFound: Boolean(w.user_id),
            purchase: payment ? toPurchase(payment) : null,
            balance,
            // Starting values for taking back what was granted; null when no
            // purchase is linked and the founder decides from scratch.
            suggestedRemoval: payment
              ? suggestedRemoval(payment.product_type, ATTEMPTS_GRANTED, Boolean(balance?.bonus_attempt_granted))
              : null,
            // The account's purchases in the month before the statement, so a
            // description like "the full plan last week" can be matched.
            recentPurchases: w.user_id
              ? (recent.data as PaymentRow[])
                  .filter(
                    (p) =>
                      p.user_id === w.user_id &&
                      new Date(p.created_at).getTime() >= windowStart &&
                      new Date(p.created_at).getTime() <= submitted.getTime() &&
                      p.id !== w.payment_id
                  )
                  .map(toPurchase)
              : [],
          };
        }),
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    if (isUnauthorized(err)) return unauthorizedResponse();
    Sentry.captureException(err);
    console.error('ADMIN WITHDRAWALS ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
