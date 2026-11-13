-- supabase/retention-rules.sql
--
-- The retention rule the database applies itself:
--
--   The record of what administrators do is kept for two years.
--
-- Accounts are kept until their owner deletes them, however long they go
-- unused (founders' decision, 13 November 2026). From 10 to 13 November 2026
-- this file also added two columns for a nightly job that warned and then
-- deleted unused accounts; that job was removed before it ever acted on a
-- real account, and block 1 removes its columns. The data in them (when each
-- person last opened the site) no longer has a purpose, so it is not kept.
--
-- Safe to run more than once, in any order relative to a deployment: the old
-- code treats the missing columns as "not set up" and does nothing. Run each
-- numbered block on its own.


-- ════════════════════════════════════════════════
-- BLOCK 1 of 3  —  remove the unused-account columns
-- ════════════════════════════════════════════════

DROP INDEX IF EXISTS public.idx_profiles_last_active_at;

ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS last_active_at;

ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS inactivity_notice_sent_at;


-- ════════════════════════════════════════════════
-- BLOCK 2 of 3  —  the administrator log: two years
-- ════════════════════════════════════════════════
--
-- 03:25 UTC daily, ten minutes after the analytics job. The unschedule first
-- makes this safe to re-run. Already live since 11 November 2026; running it
-- again changes nothing.

SELECT cron.unschedule('purge-audit-logs')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge-audit-logs');

SELECT cron.schedule(
  'purge-audit-logs',
  '25 3 * * *',
  $$
    DELETE FROM public.audit_logs
    WHERE created_at < now() - interval '2 years'
  $$
);


-- ════════════════════════════════════════════════
-- BLOCK 3 of 3  —  confirm it took
-- ════════════════════════════════════════════════
--
-- Expect: no rows from the first query (the columns are gone), and two jobs,
-- both active = true.

SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name IN ('last_active_at', 'inactivity_notice_sent_at');

SELECT jobid, jobname, schedule, active
FROM cron.job
WHERE jobname IN ('purge-analytics-events', 'purge-audit-logs')
ORDER BY jobname;

-- oldest_entry_age must stay under two years once the job has run.
SELECT
  count(*)                    AS audit_rows,
  min(created_at)             AS oldest_entry,
  now() - min(created_at)     AS oldest_entry_age
FROM public.audit_logs;
