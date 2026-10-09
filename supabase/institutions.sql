-- supabase/institutions.sql
--
-- Universities (and later schools) that buy ADAQNO for their students.
--
-- How it fits together:
--
--   institutions          one row per customer. You create these by hand in
--                         /admin/universities — there is no self-serve signup.
--   institution_domains   the email domains that identify its students, e.g.
--                         alumnos.esic.edu. One domain belongs to exactly one
--                         institution, which the primary key enforces.
--   institution_staff     the people at the university who may open the
--                         /university dashboard, matched by email address.
--   institution_members   a student who signed in with a verified address on one
--                         of the domains. Holds how many of the university's
--                         attempts they have used this licence period.
--
--   user_results.institution_id   set on an attempt the university paid for.
--   assessments.institution_id    set on feedback left by one of its students.
--
-- Those two columns are what keep each university's data separate: the
-- dashboard only ever reads rows carrying its own id, and only in aggregate.
--
-- Run the whole file once in the Supabase SQL Editor. It is safe to run again.


BEGIN;

-- ── Institutions ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.institutions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 200),
  -- ISO 3166-1 alpha-2, e.g. ES. Picks the crisis helplines shown to its
  -- students and the default language of its dashboard.
  country               text CHECK (country IS NULL OR country ~ '^[A-Z]{2}$'),
  licence_starts_at     timestamptz NOT NULL,
  licence_ends_at       timestamptz NOT NULL,
  -- Attempts each student gets per licence period. Renewing the licence (a new
  -- start date) gives every student a fresh allowance.
  attempts_per_student  integer NOT NULL DEFAULT 2 CHECK (attempts_per_student BETWEEN 1 AND 20),
  followup_included     boolean NOT NULL DEFAULT true,
  -- NULL = no cap on how many students can join.
  max_students          integer CHECK (max_students IS NULL OR max_students > 0),
  -- The off switch, separate from the dates: pausing does not lose the dates.
  is_active             boolean NOT NULL DEFAULT true,
  notes                 text CHECK (notes IS NULL OR char_length(notes) <= 2000),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT institutions_licence_dates CHECK (licence_ends_at > licence_starts_at)
);

-- ── Email domains ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.institution_domains (
  domain          text PRIMARY KEY
                  CHECK (domain = lower(domain)
                         AND domain ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$'),
  institution_id  uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS institution_domains_institution_idx
  ON public.institution_domains (institution_id);

-- ── Staff who can see the dashboard ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.institution_staff (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id  uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  email           text NOT NULL CHECK (email = lower(email) AND position('@' in email) > 1),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institution_id, email)
);
CREATE INDEX IF NOT EXISTS institution_staff_email_idx
  ON public.institution_staff (email);

-- ── Students ─────────────────────────────────────────────────────────────
-- One university per student: user_id is the primary key. Deleting the
-- account removes the row (CASCADE), and so does deleting the institution.
CREATE TABLE IF NOT EXISTS public.institution_members (
  user_id               uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id        uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  joined_at             timestamptz NOT NULL DEFAULT now(),
  -- Which licence period attempts_used counts against. When the institution's
  -- licence_starts_at moves on, the app resets the count.
  licence_period_start  timestamptz NOT NULL,
  attempts_used         integer NOT NULL DEFAULT 0 CHECK (attempts_used >= 0)
);
CREATE INDEX IF NOT EXISTS institution_members_institution_idx
  ON public.institution_members (institution_id);

-- ── Tag the attempts and feedback the university paid for ────────────────
ALTER TABLE public.user_results
  ADD COLUMN IF NOT EXISTS institution_id uuid
  REFERENCES public.institutions(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS user_results_institution_idx
  ON public.user_results (institution_id) WHERE institution_id IS NOT NULL;

ALTER TABLE public.assessments
  ADD COLUMN IF NOT EXISTS institution_id uuid
  REFERENCES public.institutions(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS assessments_institution_idx
  ON public.assessments (institution_id) WHERE institution_id IS NOT NULL;

-- ── Access ───────────────────────────────────────────────────────────────
-- Same model as every other table: RLS on with no policies, so the browser
-- keys (anon, authenticated) can read nothing. The server uses service_role,
-- and every route decides who may see what from the verified session.
--
-- The GRANTs are not optional. Tables created from the SQL Editor give
-- service_role no rights at all, and the app then fails silently.
ALTER TABLE public.institutions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_staff   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_members ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.institutions        FROM anon, authenticated;
REVOKE ALL ON public.institution_domains FROM anon, authenticated;
REVOKE ALL ON public.institution_staff   FROM anon, authenticated;
REVOKE ALL ON public.institution_members FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.institutions        TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.institution_domains TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.institution_staff   TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.institution_members TO service_role;

COMMIT;


-- ── Check it worked ──────────────────────────────────────────────────────
-- Expect four rows, each with rls_enabled = true.
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('institutions', 'institution_domains', 'institution_staff', 'institution_members')
ORDER BY 1;

-- Expect SELECT, INSERT, UPDATE and DELETE for service_role on each table,
-- and nothing for anon or authenticated.
SELECT table_name, grantee, string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privileges
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('institutions', 'institution_domains', 'institution_staff', 'institution_members')
GROUP BY table_name, grantee
ORDER BY table_name, grantee;
