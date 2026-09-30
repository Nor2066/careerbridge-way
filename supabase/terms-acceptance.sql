-- supabase/terms-acceptance.sql
--
-- Columns for recording that someone confirmed their age and accepted the
-- terms when they signed up.
--
-- WHY
--
-- The terms say "you accept these terms when you create an account" and "you
-- must be at least 16". Until now the signup form asked neither, so both
-- sentences described something that did not happen. The form now asks, and
-- these columns are where the answer goes.
--
-- Storing the VERSION rather than just a boolean is the point. The wording
-- will change; what matters later is which wording this person agreed to.
--
-- Run each numbered block on its own, the same way as the other files here.


-- ═══════════════════════════════════════════════════════════════════════
-- BLOCK 1 of 3  —  the columns
-- ═══════════════════════════════════════════════════════════════════════
--
-- All nullable, deliberately. Existing accounts predate the tickbox and there
-- is no honest value to backfill them with — see block 3.
--
-- No default on terms_accepted_at either: a default of now() would stamp every
-- row the moment this runs, inventing an acceptance that never happened.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS terms_version     text,
  ADD COLUMN IF NOT EXISTS age_confirmed_at  timestamptz;

COMMENT ON COLUMN public.profiles.terms_accepted_at IS
  'When this person first accepted the terms. Never overwritten — see lib/terms-acceptance.ts.';
COMMENT ON COLUMN public.profiles.terms_version IS
  'The TERMS_VERSION constant from lib/legal.ts at the moment of acceptance.';
COMMENT ON COLUMN public.profiles.age_confirmed_at IS
  'When this person confirmed they meet the minimum age in lib/legal.ts.';

-- Finding the accounts that never accepted is the query this table will
-- actually be asked, so it gets the index.
CREATE INDEX IF NOT EXISTS idx_profiles_terms_accepted_at
  ON public.profiles (terms_accepted_at)
  WHERE terms_accepted_at IS NULL;


-- ═══════════════════════════════════════════════════════════════════════
-- BLOCK 2 of 3  —  confirm it worked
-- ═══════════════════════════════════════════════════════════════════════

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name IN ('terms_accepted_at', 'terms_version', 'age_confirmed_at')
ORDER BY column_name;


-- ═══════════════════════════════════════════════════════════════════════
-- BLOCK 3 of 3  —  the accounts that predate the tickbox
-- ═══════════════════════════════════════════════════════════════════════
--
-- These existed before the form asked anything, so all three columns are null
-- for them and MUST STAY THAT WAY. Backfilling a date would be manufacturing a
-- record of something that did not happen, which is worse than the gap.
--
-- What to do about them is a business decision, not a SQL one. The options are
-- to leave them (fine for a handful of accounts that are mostly yours), or to
-- ask them to accept on next sign-in. Do not quietly pretend they did.

SELECT
  count(*) FILTER (WHERE terms_accepted_at IS NULL) AS never_accepted,
  count(*) FILTER (WHERE terms_accepted_at IS NOT NULL) AS accepted,
  count(*)                                           AS total
FROM public.profiles;

-- Who they are, if you want to write to them. profiles has no created_at of
-- its own, so the signup date comes from auth.users.
SELECT p.id, p.email, u.created_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.terms_accepted_at IS NULL
ORDER BY u.created_at;
