// lib/inactive-accounts.ts
//
// The nightly job for accounts nobody has used for four years: one email, then
// deletion three months later if nobody has signed in. An account that still
// holds an attempt (paid for and unused, or started and unfinished) is never
// warned or deleted. The rule itself is in lib/retention-rules.ts; this file
// is the order of operations around it.
//
// Everything that touches the outside world (the database, the mail provider)
// comes in through `deps`, so the test can run the whole job against a fake
// and check what it would have sent and deleted. The real ones are wired up
// in app/api/cron/retention/route.ts.
//
// THREE THINGS THIS MUST NEVER DO
//
//   1. Delete an account that was not warned. The notice is recorded BEFORE
//      the email goes out and taken back if the send fails, so "noticed" in
//      the database always means the provider accepted a message.
//   2. Delete on stale information. The account is read again immediately
//      before it is deleted, and only goes if the rule still says 'delete'.
//   3. Run away. Each run handles a capped number of accounts; a bug that made
//      every account look unused would warn or remove a handful, not all.
//   4. Touch an account that holds an attempt. Its holdings are read before a
//      notice and read again right before a deletion; if they cannot be read,
//      the account is kept.
//
// The scheduler may call this twice for one night, or skip a night. Both are
// harmless: claiming the notice is a conditional update that only one caller
// wins, and an account missed today is still due tomorrow.

import {
  inactivityAction,
  inactivityCutoff,
  deletionDate,
  holdsAttempts,
  type AttemptHoldings,
} from '@/lib/retention-rules';

export type InactiveAccountRow = {
  id: string;
  email: string | null;
  role: string | null;
  last_active_at: string | null;
  inactivity_notice_sent_at: string | null;
};

export type InactiveAccountDeps = {
  /**
   * Accounts last used before `cutoffIso`, oldest first. `ready: false` means
   * the database has not been prepared yet (supabase/retention-rules.sql), in
   * which case the job does nothing at all.
   */
  listCandidates(cutoffIso: string, limit: number): Promise<{ ready: boolean; rows: InactiveAccountRow[] }>;
  /** The same account, read fresh. Null if it no longer exists. */
  reload(id: string): Promise<InactiveAccountRow | null>;
  /** The address on the sign-in record, for a profile that has none. */
  emailFor(id: string): Promise<string | null>;
  /** What attempts the account still holds. Null if that cannot be read; the account is then kept. */
  holdings(id: string): Promise<AttemptHoldings | null>;
  /**
   * Records `nowIso` as the notice time, but only if the stored value is
   * still `previous`. False means another run got there first.
   */
  claimNotice(id: string, previous: string | null, nowIso: string): Promise<boolean>;
  /** Puts the notice time back after a failed send. */
  releaseNotice(id: string, previous: string | null): Promise<void>;
  /** True only if the mail provider accepted the message. */
  sendNotice(to: string, deleteOn: Date): Promise<boolean>;
  deleteAccount(id: string): Promise<{ ok: boolean; stage?: string }>;
  audit(event: 'inactive_account_notice' | 'inactive_account_deleted', details: Record<string, unknown>): Promise<void>;
};

export type InactiveAccountSummary = {
  /** 'not_ready' until supabase/retention-rules.sql has been run. */
  status: 'ok' | 'not_ready';
  dryRun: boolean;
  candidates: number;
  notified: number;
  deleted: number;
  waiting: number;
  exempt: number;
  /** Due by age, but kept because the account holds an attempt. */
  kept: number;
  /** Accounts skipped because something went wrong; details are in the log. */
  failed: number;
  /** Due today but left for the next run because the cap was reached. */
  deferred: number;
};

export const MAX_NOTICES_PER_RUN = 25;
export const MAX_DELETIONS_PER_RUN = 25;
const CANDIDATE_LIMIT = 500;

export async function runInactiveAccountJob(args: {
  now: Date;
  dryRun?: boolean;
  deps: InactiveAccountDeps;
  maxNotices?: number;
  maxDeletions?: number;
}): Promise<InactiveAccountSummary> {
  const { now, deps } = args;
  const dryRun = Boolean(args.dryRun);
  const maxNotices = args.maxNotices ?? MAX_NOTICES_PER_RUN;
  const maxDeletions = args.maxDeletions ?? MAX_DELETIONS_PER_RUN;
  const nowIso = now.toISOString();

  const summary: InactiveAccountSummary = {
    status: 'ok',
    dryRun,
    candidates: 0,
    notified: 0,
    deleted: 0,
    waiting: 0,
    exempt: 0,
    kept: 0,
    failed: 0,
    deferred: 0,
  };

  const { ready, rows } = await deps.listCandidates(inactivityCutoff(now).toISOString(), CANDIDATE_LIMIT);
  if (!ready) return { ...summary, status: 'not_ready' };
  summary.candidates = rows.length;

  for (const row of rows) {
    const action = inactivityAction({
      lastActiveAt: row.last_active_at,
      noticeSentAt: row.inactivity_notice_sent_at,
      role: row.role,
      now,
    });

    if (action === 'none') continue;
    if (action === 'exempt') { summary.exempt += 1; continue; }
    if (action === 'wait') { summary.waiting += 1; continue; }

    try {
      // Only now, for the accounts actually due: an account holding an
      // attempt is neither warned nor deleted.
      if (holdsAttempts(await deps.holdings(row.id))) { summary.kept += 1; continue; }

      if (action === 'notify') {
        if (summary.notified >= maxNotices) { summary.deferred += 1; continue; }
        if (dryRun) { summary.notified += 1; continue; }

        const to = row.email ?? (await deps.emailFor(row.id));
        if (!to) {
          // Nowhere to send a warning, so no warning, so no deletion. Left
          // for a person to look at rather than removed unannounced.
          console.warn(`RETENTION: account ${row.id} has no email address; it cannot be warned and will not be deleted.`);
          summary.failed += 1;
          continue;
        }

        const claimed = await deps.claimNotice(row.id, row.inactivity_notice_sent_at, nowIso);
        if (!claimed) continue; // another run is handling it

        const sent = await deps.sendNotice(to, deletionDate(now));
        if (!sent) {
          await deps.releaseNotice(row.id, row.inactivity_notice_sent_at);
          summary.failed += 1;
          continue;
        }

        await deps.audit('inactive_account_notice', {
          user_id: row.id,
          last_active_at: row.last_active_at,
          delete_on: deletionDate(now).toISOString(),
        });
        summary.notified += 1;
        continue;
      }

      // action === 'delete'
      if (summary.deleted >= maxDeletions) { summary.deferred += 1; continue; }
      if (dryRun) { summary.deleted += 1; continue; }

      // Read it again: the list was fetched at the start of the run, and the
      // person may have signed in since.
      const fresh = await deps.reload(row.id);
      if (!fresh) continue;
      const stillDue = inactivityAction({
        lastActiveAt: fresh.last_active_at,
        noticeSentAt: fresh.inactivity_notice_sent_at,
        role: fresh.role,
        holdsAttempts: holdsAttempts(await deps.holdings(row.id)),
        now,
      });
      if (stillDue === 'keep') { summary.kept += 1; continue; }
      if (stillDue !== 'delete') continue;

      const result = await deps.deleteAccount(row.id);
      if (!result.ok) {
        console.error(`RETENTION: could not delete unused account ${row.id} (stage: ${result.stage ?? 'unknown'}).`);
        summary.failed += 1;
        continue;
      }

      // No user id on this one: the account it would point to is gone.
      await deps.audit('inactive_account_deleted', {
        last_active_at: fresh.last_active_at,
        notice_sent_at: fresh.inactivity_notice_sent_at,
      });
      summary.deleted += 1;
    } catch (err) {
      // One account's failure must not stop the others being handled.
      console.error(`RETENTION: unexpected error on account ${row.id}:`, err);
      summary.failed += 1;
    }
  }

  return summary;
}
