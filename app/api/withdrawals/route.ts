// app/api/withdrawals/route.ts
//
// POST: the "Confirm withdrawal" button on /withdraw. Records the customer's
// withdrawal statement and sends the acknowledgement Article 11a of the EU
// Consumer Rights Directive requires. See lib/withdrawal-rules.ts for the rules.
//
// Works signed in or signed out. Signed in, the customer picks a purchase and
// we know exactly which contract it is. Signed out, they tell us in their own
// words: the right must not depend on remembering a password, so a login wall
// in front of it is the wrong default.
//
// Withdrawing does not refund anything by itself. The founders do that from
// /admin/withdrawals, within the 14 days the law gives them, because the
// refund depends on how much of the purchase was used and attempts from
// different purchases share one balance.

import { NextResponse } from 'next/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { getAuthenticatedUser } from '@/lib/supabase-server-auth';
import { supabaseServer } from '@/lib/supabase-server';
import { isMissingTableError } from '@/lib/account-data';
import { isSameOrigin, NO_STORE_HEADERS } from '@/lib/auth-cookies';
import { authIpLimiter, authLimiter, emailIdentifier, getIP, getUserIdentifier } from '@/lib/rate-limit';
import { localeFromRequest, type Locale } from '@/lib/i18n/config';
import { logAudit } from '@/lib/audit';
import { notifyWithdrawalReceived, sendWithdrawalAcknowledgement } from '@/lib/email';
import {
  describePurchase,
  formatDay,
  isWithdrawable,
  refundDueBy,
  withdrawalReference,
  type PaymentForWithdrawal,
  type WithdrawalStatement,
} from '@/lib/withdrawal-rules';

export const dynamic = 'force-dynamic';

const WithdrawSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    confirmationEmail: z.string().trim().email().max(320),
    // A purchase picked from the list (signed in only)...
    paymentId: z.string().uuid().optional(),
    // ...or one described in the customer's own words.
    contractDetails: z.string().trim().min(3).max(1000).optional(),
    // Signed out, and only if it differs from confirmationEmail: the address
    // they bought with, so we can find the account.
    accountEmail: z.string().trim().email().max(320).optional(),
  })
  .refine((d) => d.paymentId || d.contractDetails, { message: 'Say which purchase' });

type WithdrawalRow = {
  id: string;
  consumer_name: string;
  contract_details: string;
  confirmation_email: string;
  submitted_at: string;
  payment_id: string | null;
  locale: string;
};

const ROW_COLUMNS =
  'id, consumer_name, contract_details, confirmation_email, submitted_at, payment_id, locale';

function fail(status: number, code: string, error: string) {
  return NextResponse.json({ error, code }, { status, headers: NO_STORE_HEADERS });
}

/** What the page shows back: the statement, in the reader's language. */
function present(row: WithdrawalRow, contract: string, emailed: boolean, alreadySubmitted: boolean) {
  return NextResponse.json(
    {
      withdrawal: {
        reference: withdrawalReference(row.id),
        name: row.consumer_name,
        contract,
        confirmationEmail: row.confirmation_email,
        submittedAt: row.submitted_at,
      },
      emailed,
      alreadySubmitted,
    },
    { headers: NO_STORE_HEADERS }
  );
}

/** Escapes LIKE wildcards so an address is matched literally. */
function literalLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

async function accountIdForEmail(email: string): Promise<string | null> {
  const { data, error } = await supabaseServer
    .from('profiles')
    .select('id')
    .ilike('email', literalLike(email.trim()))
    .limit(2);
  if (error) {
    console.error('WITHDRAWAL: account lookup failed:', error.message);
    return null;
  }
  // Two accounts on one address would be a data problem; leave it to a human.
  return data?.length === 1 ? data[0].id : null;
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return fail(403, 'BAD_REQUEST', 'Bad request');

  const ip = getIP(request);
  const { success: ipOk } = await authIpLimiter.limit(`withdraw_${ip}`);
  if (!ipOk) return fail(429, 'TOO_MANY', 'Too many requests');

  const parsed = WithdrawSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(400, 'INVALID', 'Invalid form');
  const input = parsed.data;
  const locale: Locale = localeFromRequest(request);

  try {
    const user = await getAuthenticatedUser();

    // Per person as well as per address: a signed-out form can name any
    // inbox, and the acknowledgement goes to it.
    const identity = user ? getUserIdentifier(user.id) : emailIdentifier(input.accountEmail ?? input.confirmationEmail);
    const [{ success: personOk }, { success: inboxOk }] = await Promise.all([
      authLimiter.limit(`withdraw_${identity}`),
      authLimiter.limit(`withdraw_to_${emailIdentifier(input.confirmationEmail)}`),
    ]);
    if (!personOk || !inboxOk) return fail(429, 'TOO_MANY', 'Too many requests');

    let paymentId: string | null = null;
    let storedContract: string;
    let shownContract: string;
    let userId: string | null = user?.id ?? null;
    const accountEmail = user?.email ?? input.accountEmail ?? null;

    if (input.paymentId) {
      if (!user) return fail(401, 'SIGN_IN', 'Sign in to choose a purchase, or describe it instead.');

      const { data: payment, error } = await supabaseServer
        .from('payments')
        .select('id, created_at, product_type, amount_cents, currency, status, stripe_session_id')
        .eq('id', input.paymentId)
        .eq('user_id', user.id)
        .maybeSingle<PaymentForWithdrawal>();
      if (error) throw error;
      if (!payment) return fail(404, 'NOT_FOUND', 'No such purchase on this account');

      // The page only offers purchases inside the period; this catches a
      // page left open past the deadline.
      if (!isWithdrawable(payment)) return fail(409, 'EXPIRED', 'The withdrawal period for this purchase is over');

      // Withdrawn once already: show that confirmation again rather than
      // file a second statement for the same contract.
      const { data: existing, error: existingError } = await supabaseServer
        .from('withdrawals')
        .select(ROW_COLUMNS)
        .eq('payment_id', payment.id)
        .maybeSingle<WithdrawalRow>();
      if (existingError && isMissingTableError(existingError)) return notSetUp(existingError);
      if (existingError) throw existingError;
      if (existing) return present(existing, describePurchase(locale, payment), true, true);

      paymentId = payment.id;
      // Stored in English for the founders; shown and emailed in the
      // customer's language.
      storedContract = describePurchase('en', payment);
      shownContract = describePurchase(locale, payment);
    } else {
      storedContract = input.contractDetails!;
      shownContract = input.contractDetails!;
      if (!userId) userId = await accountIdForEmail(input.accountEmail ?? input.confirmationEmail);
    }

    const { data: row, error: insertError } = await supabaseServer
      .from('withdrawals')
      .insert({
        user_id: userId,
        payment_id: paymentId,
        consumer_name: input.name,
        contract_details: storedContract,
        confirmation_email: input.confirmationEmail,
        account_email: accountEmail,
        locale,
      })
      .select(ROW_COLUMNS)
      .single<WithdrawalRow>();

    if (insertError) {
      if (isMissingTableError(insertError)) return notSetUp(insertError);
      // 23505: a double click raced itself to the unique index on payment_id.
      // The other request recorded it; answer with that row.
      if (insertError.code === '23505' && paymentId) {
        const { data: winner } = await supabaseServer
          .from('withdrawals')
          .select(ROW_COLUMNS)
          .eq('payment_id', paymentId)
          .maybeSingle<WithdrawalRow>();
        if (winner) return present(winner, shownContract, true, true);
      }
      throw insertError;
    }

    const submittedAt = new Date(row.submitted_at);
    const statement: WithdrawalStatement = {
      reference: withdrawalReference(row.id),
      name: row.consumer_name,
      contract: shownContract,
      confirmationEmail: row.confirmation_email,
      submittedAt,
    };

    // Awaited, unlike the receipt: whether it went out decides what the page
    // tells the customer, and is worth recording.
    const emailed = await sendWithdrawalAcknowledgement({
      to: row.confirmation_email,
      locale,
      statement,
    });
    if (emailed) {
      const { error: stampError } = await supabaseServer
        .from('withdrawals')
        .update({ acknowledgement_sent_at: new Date().toISOString() })
        .eq('id', row.id);
      if (stampError) console.error('WITHDRAWAL: could not record the acknowledgement:', stampError.message);
    }

    const dueBy = formatDay('en', refundDueBy(submittedAt));

    // The refund clock is running from this moment, so this has to reach
    // someone. A warning so Sentry raises it as an alert; no personal data,
    // just the reference to look up on /admin/withdrawals.
    Sentry.captureMessage(`Withdrawal received ${statement.reference}: refund due by ${dueBy}`, 'warning');
    await notifyWithdrawalReceived({ reference: statement.reference, contract: storedContract, refundDueBy: dueBy });

    await logAudit({
      userId,
      action: 'withdrawal_submitted',
      ipAddress: ip,
      metadata: { withdrawalId: row.id, paymentId, signedIn: Boolean(user), emailed },
    });

    return present(row, shownContract, emailed, false);
  } catch (err) {
    Sentry.captureException(err);
    console.error('WITHDRAWAL ERROR:', err);
    return fail(500, 'FAILED', 'Internal server error');
  }
}

/**
 * The table does not exist: supabase/withdrawals.sql has not been run. Loud,
 * because a withdrawal we cannot record is a legal right we are failing to
 * honour, and the customer is told to try again rather than that it worked.
 */
function notSetUp(error: { message?: string }) {
  console.error('WITHDRAWAL: the withdrawals table is missing. Run supabase/withdrawals.sql.', error.message);
  Sentry.captureMessage('Withdrawal could not be recorded: run supabase/withdrawals.sql', 'error');
  return fail(503, 'NOT_SET_UP', 'Withdrawals cannot be recorded right now');
}
