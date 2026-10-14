-- supabase/institution-opt-out.sql
--
-- Lets a student object to being counted in their university's totals, as
-- the Privacy Policy says they may ("If your university gives you access").
-- Counting students in anonymous totals rests on legitimate interests, and
-- under the GDPR an objection to that has to be honoured.
--
-- A student marked here keeps their free access. They simply drop out of
-- every figure on the university dashboard: students joined, reports,
-- career areas, months and ratings (app/api/university/summary/route.ts).
--
-- Run once in the Supabase SQL Editor. Safe to re-run. The dashboard works
-- before it has run too: it treats the missing column as "nobody objected".
-- service_role already has rights on the table, and a new column is covered
-- by those table-level grants.

ALTER TABLE public.institution_members
  ADD COLUMN IF NOT EXISTS counted_in_totals boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.institution_members.counted_in_totals IS
  'false = the student objected to being counted in the university''s totals. Keeps their access.';

-- ── Recording an objection ─────────────────────────────────────────────────
-- When a student writes to the privacy address, replace the email and run:
--
-- UPDATE public.institution_members
--    SET counted_in_totals = false
--  WHERE user_id = (SELECT id FROM auth.users WHERE email = 'student@example.edu');
--
-- Then reply to the student to confirm. To undo, set it back to true.
