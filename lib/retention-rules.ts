// lib/retention-rules.ts
//
// Retention periods that code and the privacy policy must agree on, kept as
// plain numbers so a test can pin both.
//
// Accounts are not here on purpose. An account is kept until its owner
// deletes it, however long it goes unused: we never delete an account because
// nobody has signed in (founders' decision, 13 November 2026). Between 10 and
// 13 November 2026 a nightly job warned and then deleted accounts unused for
// two, later four, years; it never ran against a real account and was
// removed, together with the "last used" date it relied on.

/**
 * How long a row of the administrator audit log is kept. Enforced in the
 * database by supabase/retention-rules.sql, not here: this constant exists so
 * the privacy policy and the SQL can be checked against one number.
 */
export const AUDIT_LOG_RETENTION_DAYS = 730;
