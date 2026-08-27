// lib/account-data.ts
//
// The one list of tables that hold a user's personal data, shared by the
// export route and the delete route.
//
// Keeping it in one place is the point. Export and delete drifting apart is a
// specific, common failure: someone adds a table, wires it into export because
// that is the visible feature, forgets delete, and the deletion promise in the
// privacy policy quietly becomes false. Both routes read this array, so a new
// table is either in both or in neither.

/**
 * A table keyed by user, with the column that identifies the user.
 *
 * `label` is what the export file calls it — a person reading their own data
 * dump should not have to guess what `ai_main_reports` means.
 */
export type UserTable = {
  table: string;
  userColumn: string;
  label: string;
};

export const USER_DATA_TABLES: UserTable[] = [
  { table: 'user_results', userColumn: 'user_id', label: 'assessment_results' },
  { table: 'user_progress', userColumn: 'user_id', label: 'saved_progress' },
  { table: 'ai_main_reports', userColumn: 'user_id', label: 'career_reports' },
  { table: 'ai_followup_reports', userColumn: 'user_id', label: 'followup_roadmaps' },
  { table: 'followup_answers', userColumn: 'user_id', label: 'followup_answers' },
  { table: 'followup_unlocks', userColumn: 'user_id', label: 'followup_unlocks' },
  { table: 'assessments', userColumn: 'user_id', label: 'feedback_submissions' },
  { table: 'subscriptions', userColumn: 'user_id', label: 'plan_and_attempts' },
];

/**
 * Deleted last and treated separately, because UK tax law requires a record of
 * each sale to be kept for six years — longer than the customer's account.
 *
 * We keep the transaction and drop the link to the person where the schema
 * allows it. See app/api/account/delete/route.ts for what happens when it
 * does not.
 */
export const PAYMENTS_TABLE = 'payments';

/**
 * Audit rows record that an action happened, not what was in it. They are kept
 * for security investigation and expire on their own retention schedule, so
 * deletion detaches the user rather than erasing the history of the account
 * having existed.
 */
export const AUDIT_TABLE = 'audit_logs';
