// lib/account-deletion.ts
//
// Removing one account's data, when its owner presses the delete button
// (app/api/account/delete). That is the only way an account is ever deleted:
// ADAQNO never deletes an account because it has not been used (founders'
// decision, 13 November 2026).
//
// Order matters and is deliberate:
//
//   1. Content tables first. Each delete is idempotent, so a partial failure
//      is repaired by running the whole thing again.
//   2. Payments are detached, not deleted — Hungarian accounting law requires
//      eight years of sales records. We drop the link to the person and keep
//      the transaction.
//   3. The auth user last. Once it is gone nobody can sign in to retry, so
//      nothing that might fail should come after it.

if (typeof window !== 'undefined') {
  throw new Error('This module is server-only and must not be imported by client code');
}

import * as Sentry from '@sentry/nextjs';
import { supabaseServer } from '@/lib/supabase-server';
import {
  USER_DATA_TABLES,
  PAYMENTS_TABLE,
  AUDIT_TABLE,
  isMissingTableError,
} from '@/lib/account-data';

export type AccountDeletionResult =
  | { ok: true }
  /** A content table refused. Nothing the person needs has been half-removed. */
  | { ok: false; stage: 'content'; table: string; message: string }
  /** Payment rows could not be detached, and deleting the user would cascade them away. */
  | { ok: false; stage: 'payments'; message: string }
  /** The data is gone but the sign-in record is still there. */
  | { ok: false; stage: 'auth'; message: string };

export async function deleteAccountData(userId: string): Promise<AccountDeletionResult> {
  // ── 1. Content tables ───────────────────────────────────────────────
  for (const { table, userColumn } of USER_DATA_TABLES) {
    const { error } = await supabaseServer.from(table).delete().eq(userColumn, userId);
    if (error && isMissingTableError(error)) {
      console.warn(`DELETE ACCOUNT: ${table} does not exist yet — nothing to delete there.`);
      continue;
    }
    if (error) {
      Sentry.captureException(error);
      console.error(`DELETE ACCOUNT: failed on ${table}:`, error.message);
      return { ok: false, stage: 'content', table, message: error.message };
    }
  }

  // ── 2. Detach payments, keep the transaction ────────────────────────
  // The audit found payments.user_id is NOT NULL with ON DELETE CASCADE, so
  // this update fails and step 3 would then delete the payment rows outright
  // — destroying sales records accounting law requires be kept for eight years.
  //
  // So a failure here is fatal, not a warning. Refusing to finish is the
  // safe outcome: the customer can be told to contact us, whereas records
  // deleted to satisfy an erasure request cannot be brought back.
  //
  // supabase/security-fixes-part2.sql makes the column nullable with
  // ON DELETE SET NULL, after which this succeeds and the branch never runs.
  const { error: paymentError } = await supabaseServer
    .from(PAYMENTS_TABLE)
    .update({ user_id: null })
    .eq('user_id', userId);

  if (paymentError) {
    const { count } = await supabaseServer
      .from(PAYMENTS_TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if ((count ?? 0) > 0) {
      Sentry.captureException(paymentError);
      console.error(
        'DELETE ACCOUNT: refusing to continue — cannot detach',
        count,
        'payment record(s), and deleting the user would cascade them away:',
        paymentError.message
      );
      return { ok: false, stage: 'payments', message: paymentError.message };
    }

    // No payment rows to lose, so the failed update was a no-op anyway.
    console.warn('DELETE ACCOUNT: payment detach failed but user has no payments —', paymentError.message);
  }

  // Audit rows record that something happened, not what was in it.
  await supabaseServer.from(AUDIT_TABLE).update({ user_id: null }).eq('user_id', userId);

  // ── 3. The auth user, last ──────────────────────────────────────────
  const { error: authError } = await supabaseServer.auth.admin.deleteUser(userId);
  if (authError) {
    Sentry.captureException(authError);
    console.error('DELETE ACCOUNT: auth user deletion failed:', authError.message);
    return { ok: false, stage: 'auth', message: authError.message };
  }

  return { ok: true };
}
