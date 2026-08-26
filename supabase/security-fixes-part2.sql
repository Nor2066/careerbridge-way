-- supabase/security-fixes-part2.sql
--
-- What is left after security-fixes.sql. Blocks 1-4 of that file applied
-- cleanly and query 7 confirmed it: the profiles UPDATE policy, the anonymous
-- INSERT on assessments, the open read on user_roles, the recursive admin
-- policy, and the admin-only ALL policy are all gone.
--
-- HOW TO RUN THIS FILE, because the last one bit you twice:
--
--   1. Select a whole numbered block, never a partial selection. The
--      "syntax error at or near The" was a comment continuation line being
--      run as SQL because the highlight started mid-comment.
--
--   2. Run ONE statement at a time where a block contains several. The
--      Supabase editor wraps whatever you run in a transaction, which is why
--      CREATE INDEX CONCURRENTLY failed with 25001. CONCURRENTLY is gone from
--      this file — your tables are small enough that the brief lock is
--      irrelevant, and it can go back in later if they ever get large.


-- ═══════════════════════════════════════════════════════════════════════
-- BLOCK 1 of 3  —  stop account deletion destroying your tax records
-- ═══════════════════════════════════════════════════════════════════════
--
-- Confirmed by your output: payments.user_id is NOT NULL, and the foreign key
-- is ON DELETE CASCADE. Together those mean a customer exercising their right
-- to erasure would delete the sales records you are legally required to keep
-- for six years.
--
-- After this, deletion drops the link to the person and keeps the transaction.
-- Run these four lines as one selection.

ALTER TABLE public.payments ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.payments DROP CONSTRAINT payments_user_id_fkey;
ALTER TABLE public.payments
  ADD CONSTRAINT payments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


-- ═══════════════════════════════════════════════════════════════════════
-- BLOCK 2 of 3  —  the foreign key question your first run could not answer
-- ═══════════════════════════════════════════════════════════════════════
--
-- Query 4 returned no rows because information_schema only shows objects your
-- role owns, and auth.users belongs to supabase_auth_admin. This reads
-- pg_catalog instead, so it sees everything.
--
-- Read only. Send me the output — it tells us whether any OTHER table has the
-- same cascade problem payments had.

SELECT
  con.conname                          AS constraint_name,
  src.relname                          AS table_name,
  att.attname                          AS column_name,
  CASE con.confdeltype
    WHEN 'a' THEN 'NO ACTION'
    WHEN 'r' THEN 'RESTRICT'
    WHEN 'c' THEN 'CASCADE'
    WHEN 'n' THEN 'SET NULL'
    WHEN 'd' THEN 'SET DEFAULT'
  END                                  AS delete_rule,
  att.attnotnull                       AS column_is_not_null
FROM pg_constraint con
JOIN pg_class      src    ON src.oid = con.conrelid
JOIN pg_class      tgt    ON tgt.oid = con.confrelid
JOIN pg_namespace  tgt_ns ON tgt_ns.oid = tgt.relnamespace
JOIN pg_attribute  att    ON att.attrelid = con.conrelid
                        AND att.attnum = ANY (con.conkey)
WHERE con.contype = 'f'
  AND tgt.relname = 'users'
  AND tgt_ns.nspname = 'auth'
ORDER BY delete_rule, src.relname;


-- ═══════════════════════════════════════════════════════════════════════
-- BLOCK 3 of 3  —  indexes, without CONCURRENTLY this time
-- ═══════════════════════════════════════════════════════════════════════
--
-- Every one of these columns is filtered on by a route that runs on a normal
-- page load, and none of them are indexed today. user_results matters most:
-- /api/user-history filters by user_id and orders by created_at every time
-- somebody opens their history.
--
-- Safe to run as one selection, and safe to run twice.

CREATE INDEX IF NOT EXISTS idx_user_results_user_created
  ON public.user_results (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_main_reports_user
  ON public.ai_main_reports (user_id);

CREATE INDEX IF NOT EXISTS idx_ai_followup_reports_user
  ON public.ai_followup_reports (user_id);

CREATE INDEX IF NOT EXISTS idx_followup_answers_user
  ON public.followup_answers (user_id);

CREATE INDEX IF NOT EXISTS idx_payments_user
  ON public.payments (user_id);

CREATE INDEX IF NOT EXISTS idx_assessments_user
  ON public.assessments (user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created
  ON public.audit_logs (user_id, created_at DESC);


-- ═══════════════════════════════════════════════════════════════════════
-- VERIFY  —  run after block 1 and block 3
-- ═══════════════════════════════════════════════════════════════════════
--
-- Expected: is_nullable = YES, delete_rule = SET NULL, and seven idx_ rows.

SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'user_id';

SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
ORDER BY indexname;
