-- supabase/analytics-retention.sql
--
-- Enforces the 90-day analytics retention the privacy policy promises.
--
-- WHY THIS IS A FILE OF ITS OWN
--
-- The promise has been published since the privacy policy went up, and until
-- now nothing kept it. A commented-out DELETE at the bottom of
-- analytics-setup.sql is not a retention policy — it is a note to somebody who
-- will not remember. A retention claim nobody enforces is the easiest kind of
-- privacy statement to disprove: one SELECT with a min(created_at) shows rows
-- older than the policy allows, and the whole document loses credibility.
--
-- So this schedules the deletion instead of describing it.
--
-- Run each numbered block on its own, the same way as the other files here.


-- ═══════════════════════════════════════════════════════════════════════
-- BLOCK 1 of 4  —  turn on the scheduler
-- ═══════════════════════════════════════════════════════════════════════
--
-- PREFERRED: enable pg_cron from the Dashboard instead, under
-- Database → Extensions → search "pg_cron" → toggle on. The Dashboard puts it
-- in the schema Supabase expects and is the supported route.
--
-- This statement is here for completeness and is safe to run if you would
-- rather not leave the SQL editor. Either way the scheduling functions end up
-- in the `cron` schema, which is what blocks 2 and 3 use.

CREATE EXTENSION IF NOT EXISTS pg_cron;


-- ═══════════════════════════════════════════════════════════════════════
-- BLOCK 2 of 4  —  the job
-- ═══════════════════════════════════════════════════════════════════════
--
-- 03:15 UTC daily. Off-peak, and deliberately not midnight — a great many
-- scheduled jobs run at exactly 00:00 and there is no reason to join them.
--
-- The unschedule first makes this file safe to re-run. cron.schedule() on an
-- existing job name replaces it on current versions, but that has not always
-- been true, and a duplicated job silently doing the same delete twice a night
-- is an annoying thing to debug.

SELECT cron.unschedule('purge-analytics-events')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge-analytics-events');

SELECT cron.schedule(
  'purge-analytics-events',
  '15 3 * * *',
  $$
    DELETE FROM public.analytics_events
    WHERE created_at < now() - interval '90 days'
  $$
);


-- ═══════════════════════════════════════════════════════════════════════
-- BLOCK 3 of 4  —  confirm it exists and is active
-- ═══════════════════════════════════════════════════════════════════════
--
-- Expect exactly one row, active = true.

SELECT jobid, jobname, schedule, active
FROM cron.job
WHERE jobname = 'purge-analytics-events';

-- After it has run at least once, this shows whether it succeeded. Worth
-- checking the morning after you set it up; a job that exists but fails every
-- night is worse than no job, because the row in cron.job looks reassuring.
SELECT status, return_message, start_time
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'purge-analytics-events')
ORDER BY start_time DESC
LIMIT 5;


-- ═══════════════════════════════════════════════════════════════════════
-- BLOCK 4 of 4  —  prove the promise is kept
-- ═══════════════════════════════════════════════════════════════════════
--
-- This is the query to run if anyone ever asks whether the retention claim is
-- true. `oldest_event_age` must stay under 90 days once the first run has
-- happened. If it does not, the job is not working and the privacy policy is
-- currently untrue.
--
-- Run the DELETE once by hand the first time, since the backlog predates the
-- job and the policy applies to it too.

DELETE FROM public.analytics_events
WHERE created_at < now() - interval '90 days';

SELECT
  count(*)                              AS rows_held,
  min(created_at)                       AS oldest_event,
  now() - min(created_at)               AS oldest_event_age
FROM public.analytics_events;


-- ═══════════════════════════════════════════════════════════════════════
-- NOT COVERED HERE
-- ═══════════════════════════════════════════════════════════════════════
--
-- The privacy policy also promises "up to 90 days" for error and security
-- logs. Those do not live in this database:
--
--   • Sentry  — retention is a plan/organisation setting in the Sentry
--                dashboard, not something SQL can reach. Check it matches.
--   • Vercel  — runtime log retention is fixed by plan tier.
--
-- Neither is enforceable from here. Both need checking against the wording in
-- lib/legal.ts RETENTION before launch.
