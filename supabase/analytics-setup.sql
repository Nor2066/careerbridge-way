-- supabase/analytics-setup.sql
--
-- The table behind lib/analytics.ts. Run this once, before deploying the
-- analytics code — the events endpoint fails quietly if the table is missing,
-- so you would lose data without seeing an error anywhere.
--
-- Select a whole numbered block and run it, the same way as the other files.


-- ═══════════════════════════════════════════════════════════════════════
-- BLOCK 1 of 3  —  the table
-- ═══════════════════════════════════════════════════════════════════════
--
-- user_id is deliberately nullable: the most valuable events happen before
-- anyone signs in. ON DELETE SET NULL rather than CASCADE, so a customer
-- erasing their account does not silently rewrite your historical funnel —
-- the events stay, detached from the person.

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id          bigserial PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  event       text        NOT NULL,
  session_id  text        NOT NULL,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  path        text,
  props       jsonb       NOT NULL DEFAULT '{}'::jsonb
);

-- RLS on with no policies: nothing but the service role may touch this.
-- Writes come from /api/events, which runs server-side; nothing in the
-- browser should ever read this table.
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_created
  ON public.analytics_events (event, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_session
  ON public.analytics_events (session_id, created_at);


-- ═══════════════════════════════════════════════════════════════════════
-- BLOCK 2 of 3  —  the funnel, which is the whole point
-- ═══════════════════════════════════════════════════════════════════════
--
-- Run this whenever you want to know where people are giving up. Each row is
-- a step; the drop is the gap between one row and the next.

SELECT
  step,
  sessions,
  ROUND(100.0 * sessions / NULLIF(MAX(sessions) OVER (), 0), 1) AS pct_of_top,
  ROUND(100.0 * sessions / NULLIF(LAG(sessions) OVER (ORDER BY ord), 0), 1) AS pct_of_previous
FROM (
  SELECT 1 AS ord, 'landing'          AS step, count(DISTINCT session_id) AS sessions FROM public.analytics_events WHERE event = 'landing_view'
  UNION ALL
  SELECT 2, 'started the quiz',        count(DISTINCT session_id) FROM public.analytics_events WHERE event = 'quiz_start'
  UNION ALL
  SELECT 3, 'finished the quiz',       count(DISTINCT session_id) FROM public.analytics_events WHERE event = 'quiz_complete'
  UNION ALL
  SELECT 4, 'saw the paywall',         count(DISTINCT session_id) FROM public.analytics_events WHERE event = 'paywall_view'
  UNION ALL
  SELECT 5, 'started checkout',        count(DISTINCT session_id) FROM public.analytics_events WHERE event = 'checkout_start'
  UNION ALL
  SELECT 6, 'paid',                    count(DISTINCT session_id) FROM public.analytics_events WHERE event = 'purchase_complete'
  UNION ALL
  SELECT 7, 'read their report',       count(DISTINCT session_id) FROM public.analytics_events WHERE event = 'report_view'
) f
ORDER BY ord;


-- ═══════════════════════════════════════════════════════════════════════
-- BLOCK 3 of 3  —  which question loses people
-- ═══════════════════════════════════════════════════════════════════════
--
-- The one worth watching for a 46-question assessment. `reached` is how many
-- sittings got to each question; where it falls off a cliff is where the
-- questionnaire is too long, too personal, or badly worded.

SELECT
  (props->>'index')::int              AS question,
  count(DISTINCT session_id)          AS reached,
  count(DISTINCT session_id) - LEAD(count(DISTINCT session_id)) OVER (ORDER BY (props->>'index')::int) AS lost_here
FROM public.analytics_events
WHERE event = 'quiz_question'
  AND props ? 'index'
  AND created_at > now() - interval '30 days'
GROUP BY 1
ORDER BY 1;


-- ═══════════════════════════════════════════════════════════════════════
-- HOUSEKEEPING  —  do not keep these forever
-- ═══════════════════════════════════════════════════════════════════════
--
-- The privacy policy promises technical records are kept "up to 90 days".
-- Nothing enforces that on its own, so either run this occasionally or set it
-- up as a scheduled job under Database → Cron.

-- DELETE FROM public.analytics_events WHERE created_at < now() - interval '90 days';
