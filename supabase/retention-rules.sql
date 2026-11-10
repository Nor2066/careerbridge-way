-- supabase/retention-rules.sql
--
-- Two retention rules the privacy policy states from 10 November 2026:
--
--   1. An account nobody has used for two years gets one email, and is
--      deleted three months later unless somebody signs in.
--   2. The record of what administrators do is kept for two years.
--
-- Rule 1 is applied by the website (app/api/cron/retention, once a night),
-- because it has to send an email and remove the sign-in record. What it
-- needs from the database is two columns, which block 1 adds. Until this file
-- has been run the nightly job answers "not_ready" and does nothing, so run
-- this BEFORE the code is pushed, the same order as the other files here.
--
-- Rule 2 is applied here, by a scheduled delete (block 2), the same way
-- analytics-retention.sql does it.
--
-- Safe to run more than once. Run each numbered block on its own.


-- ═══════════════════════════════════════════════════════════════════════
-- BLOCK 1 of 4  —  when an account was last used, and when it was warned
-- ═══════════════════════════════════════════════════════════════════════
--
-- last_active_at             moved by the website when a signed-in person
--                            opens a page, at most once a day
-- inactivity_notice_sent_at  set when the warning email goes out
--
-- The order matters. The column is added empty, filled for existing accounts
-- from the last time each one signed in, and only then given its default and
-- made required. Adding it WITH a default would stamp every existing account
-- as used today, and re-running a fill that ignored what is already there
-- would overwrite newer times with older ones.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_active_at timestamptz;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS inactivity_notice_sent_at timestamptz;

UPDATE public.profiles p
SET last_active_at = COALESCE(u.last_sign_in_at, u.created_at, now())
FROM auth.users u
WHERE u.id = p.id
  AND p.last_active_at IS NULL;

-- A profile with no sign-in record should not exist. If one does, treat it as
-- used now rather than as two years old.
UPDATE public.profiles
SET last_active_at = now()
WHERE last_active_at IS NULL;

ALTER TABLE public.profiles
  ALTER COLUMN last_active_at SET DEFAULT now();

ALTER TABLE public.profiles
  ALTER COLUMN last_active_at SET NOT NULL;

-- The nightly job asks for "last used before <date>, oldest first".
CREATE INDEX IF NOT EXISTS idx_profiles_last_active_at
  ON public.profiles (last_active_at);

COMMENT ON COLUMN public.profiles.last_active_at IS
  'When a signed-in person last opened the site. Moved at most once a day by app/api/auth/me. Drives the two-year rule for unused accounts.';
COMMENT ON COLUMN public.profiles.inactivity_notice_sent_at IS
  'When the "sign in to keep your account" email was sent. The account is deleted 90 days later unless last_active_at has moved past this.';


-- ═══════════════════════════════════════════════════════════════════════
-- BLOCK 2 of 4  —  the administrator log: two years
-- ═══════════════════════════════════════════════════════════════════════
--
-- 03:25 UTC daily, ten minutes after the analytics job. The unschedule first
-- makes this safe to re-run.

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


-- ═══════════════════════════════════════════════════════════════════════
-- BLOCK 3 of 4  —  confirm it took
-- ═══════════════════════════════════════════════════════════════════════
--
-- Expect: every account has a last_active_at (missing = 0), nobody warned yet,
-- and the oldest account is far younger than two years.

SELECT
  count(*)                                             AS accounts,
  count(*) FILTER (WHERE last_active_at IS NULL)       AS missing,
  count(*) FILTER (WHERE inactivity_notice_sent_at IS NOT NULL) AS warned,
  min(last_active_at)                                  AS least_recently_used,
  now() - min(last_active_at)                          AS longest_unused
FROM public.profiles;

-- Expect two rows, both active = true.
SELECT jobid, jobname, schedule, active
FROM cron.job
WHERE jobname IN ('purge-analytics-events', 'purge-audit-logs')
ORDER BY jobname;


-- ═══════════════════════════════════════════════════════════════════════
-- BLOCK 4 of 4  —  prove the promises are kept (run whenever asked)
-- ═══════════════════════════════════════════════════════════════════════
--
-- oldest_entry_age must stay under two years once the job has run.

SELECT
  count(*)                    AS audit_rows,
  min(created_at)             AS oldest_entry,
  now() - min(created_at)     AS oldest_entry_age
FROM public.audit_logs;

-- Accounts the nightly job has in hand. `overdue` should be 0 the morning
-- after any night it ran: these are accounts warned more than 90 days ago,
-- not used since, and still here.
SELECT
  count(*) FILTER (WHERE last_active_at < now() - interval '730 days')            AS unused_two_years,
  count(*) FILTER (WHERE inactivity_notice_sent_at IS NOT NULL
                     AND inactivity_notice_sent_at >= last_active_at)             AS warned_and_waiting,
  count(*) FILTER (WHERE inactivity_notice_sent_at < now() - interval '91 days'
                     AND inactivity_notice_sent_at >= last_active_at
                     AND COALESCE(role, '') NOT IN ('admin', 'superadmin'))       AS overdue
FROM public.profiles;


-- ═══════════════════════════════════════════════════════════════════════
-- NOT DONE BY THIS FILE
-- ═══════════════════════════════════════════════════════════════════════
--
-- The nightly job only runs once Vercel has an environment variable called
-- CRON_SECRET (any long random string of letters and numbers) and the site
-- has been deployed after adding it. Without it the job refuses every call,
-- which is also how to switch it off.
--
-- To see what a run would do without sending or deleting anything:
--
--   curl -H "Authorization: Bearer <CRON_SECRET>" "https://adaqno.com/api/cron/retention?dry=1"
