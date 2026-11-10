// lib/retention-rules.ts
//
// How long an unused account is kept, as plain rules with no database in them,
// so the periods the privacy policy states and the periods the nightly job
// applies are the same numbers and a test can pin both.
//
// The rule: an account nobody has used for two years gets one email. If
// nobody signs in during the three months after it, the account is deleted the
// same way the delete button deletes it. Signing in, or just opening the site
// while signed in, at any point before that cancels it.
//
// "Until you delete your account" used to be the whole retention rule, which
// in practice meant for ever for anyone who forgot they had signed up.

/** Two years without use before we write to the person. */
export const INACTIVE_NOTICE_AFTER_DAYS = 730;

/** Three months between the email and the deletion. */
export const INACTIVE_DELETE_AFTER_NOTICE_DAYS = 90;

/**
 * How long a row of the administrator audit log is kept. Enforced in the
 * database by supabase/retention-rules.sql, not here: this constant exists so
 * the privacy policy and the SQL can be checked against one number.
 */
export const AUDIT_LOG_RETENTION_DAYS = 730;

/** An account's "last used" time moves at most this often — see lib/activity.ts. */
export const ACTIVITY_TOUCH_INTERVAL_HOURS = 24;

const DAY_MS = 24 * 60 * 60 * 1000;

export type InactivityAction =
  /** Used recently enough, or we cannot tell: leave it alone. */
  | 'none'
  /** Unused for two years and not yet told. */
  | 'notify'
  /** Told, and the three months are still running. */
  | 'wait'
  /** Told three months ago and not seen since. */
  | 'delete'
  /** An administrator's account. Never touched automatically. */
  | 'exempt';

function time(value: string | null | undefined): number | null {
  if (!value) return null;
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : t;
}

/**
 * What the nightly job should do with one account.
 *
 * Every doubtful case answers 'none'. A missing or unreadable date means "we
 * do not know when this was last used", and an account must never be deleted
 * on a guess.
 */
export function inactivityAction(input: {
  lastActiveAt: string | null | undefined;
  noticeSentAt: string | null | undefined;
  role: string | null | undefined;
  now: Date;
}): InactivityAction {
  if (input.role === 'admin' || input.role === 'superadmin') return 'exempt';

  const now = input.now.getTime();
  const lastActive = time(input.lastActiveAt);
  if (lastActive === null) return 'none';
  if (now - lastActive < INACTIVE_NOTICE_AFTER_DAYS * DAY_MS) return 'none';

  // A notice only counts if nothing has happened on the account since it was
  // sent. Someone who came back after an earlier warning and then drifted away
  // again is owed a fresh one.
  const noticed = time(input.noticeSentAt);
  if (noticed === null || noticed < lastActive) return 'notify';

  return now - noticed >= INACTIVE_DELETE_AFTER_NOTICE_DAYS * DAY_MS ? 'delete' : 'wait';
}

/** Accounts last used before this moment are due a notice. */
export function inactivityCutoff(now: Date): Date {
  return new Date(now.getTime() - INACTIVE_NOTICE_AFTER_DAYS * DAY_MS);
}

/** The earliest day an account told at `noticeSentAt` can be deleted. */
export function deletionDate(noticeSentAt: Date): Date {
  return new Date(noticeSentAt.getTime() + INACTIVE_DELETE_AFTER_NOTICE_DAYS * DAY_MS);
}

/** Before this moment, an account's "last used" time is stale enough to move. */
export function activityTouchThreshold(now: Date): Date {
  return new Date(now.getTime() - ACTIVITY_TOUCH_INTERVAL_HOURS * 60 * 60 * 1000);
}
