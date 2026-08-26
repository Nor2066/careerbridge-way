-- supabase/security-fixes.sql
--
-- Fixes for what the audit found on 2026-08-26. Run these in the Supabase SQL
-- editor, in order. Each block says what it fixes and why, so you can decide
-- rather than paste blindly.
--
-- Overall the database was in good shape: RLS is enabled on all 12 tables,
-- there are no storage buckets to leak, and payments.stripe_session_id already
-- carries the UNIQUE constraint the whole payment flow depends on. What follows
-- is the handful of policies that are wrong.


-- ═══════════════════════════════════════════════════════════════════════
-- 1. CRITICAL — any signed-in user can make themselves an admin
-- ═══════════════════════════════════════════════════════════════════════
--
-- The policy "Users can update own profile" is:
--
--     FOR UPDATE  USING (auth.uid() = id)   -- and no WITH CHECK
--
-- When an UPDATE policy has no WITH CHECK, Postgres reuses the USING
-- expression for the new row. So the only thing checked is that you still own
-- the row afterwards — which stays true while you change any OTHER column.
--
-- lib/roles.ts reads the role from exactly this table. So any authenticated
-- user can run this from their own browser, using the anon key that ships in
-- every page:
--
--     supabase.from('profiles').update({ role: 'superadmin' }).eq('id', myId)
--
-- and then call /api/admin/assessments, which returns every assessment row in
-- the database — every user's email, answers and feedback.
--
-- Nothing in the application updates profiles from the client. The whole app
-- goes through the service role, which bypasses RLS anyway. So the policy has
-- no legitimate user and the fix is simply to remove it.

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Belt and braces: even if an UPDATE policy is added back later without
-- thinking about columns, this stops role being one of the columns a normal
-- user is allowed to write.
REVOKE UPDATE ON public.profiles FROM authenticated, anon;

-- If you later want people to edit their own profile, grant the specific
-- columns rather than the table, and re-add a policy with BOTH halves:
--
--   GRANT UPDATE (display_name) ON public.profiles TO authenticated;
--   CREATE POLICY "Users can update own profile" ON public.profiles
--     FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);


-- ═══════════════════════════════════════════════════════════════════════
-- 2. HIGH — anyone at all can write rows into `assessments`
-- ═══════════════════════════════════════════════════════════════════════
--
-- The policy "Allow anonymous inserts" is FOR INSERT TO anon WITH CHECK (true).
-- `true` means no constraint of any kind: anyone holding the anon key — which
-- is public by design — can insert unlimited rows carrying any email address,
-- any user_id, and any feedback text they like.
--
-- That is a free write channel into your database: junk in the admin
-- dashboard, fabricated feedback attributed to real users, and an unbounded
-- way to grow your table on the free tier.
--
-- /api/save-results writes this table with the service role and sets user_id
-- from the verified session, so the app does not need this policy.

DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.assessments;


-- ═══════════════════════════════════════════════════════════════════════
-- 3. MEDIUM — every authenticated user can list who your admins are
-- ═══════════════════════════════════════════════════════════════════════
--
-- user_roles has "Allow read for authenticated users" with USING (true), which
-- returns the entire table to any signed-in user. It sits alongside "Users can
-- read own role", which is the one that is actually wanted.
--
-- Knowing which accounts are privileged is the first step of targeting them.

DROP POLICY IF EXISTS "Allow read for authenticated users" ON public.user_roles;


-- ═══════════════════════════════════════════════════════════════════════
-- 4. MEDIUM — recursive policy on profiles, and an inconsistent admin test
-- ═══════════════════════════════════════════════════════════════════════
--
-- "Admins can read all profiles" queries `profiles` from inside a policy ON
-- `profiles`. Postgres detects that and raises
--   42P17: infinite recursion detected in policy for relation "profiles"
-- so this policy does not do what it looks like it does, and may be breaking
-- other reads of the table.
--
-- It is also inconsistent with the rest of the app: it tests role = 'admin'
-- only, while lib/roles.ts isAdmin() accepts 'admin' OR 'superadmin', so a
-- superadmin is locked out by it. Two other policies on `assessments` test
-- both roles, so the database disagrees with itself.
--
-- Admin reads all go through the service role, which bypasses RLS. So this
-- policy earns nothing and costs correctness.

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;

-- Same inconsistency on assessments: this one checks only 'admin'.
-- The two SELECT policies beside it already check both roles correctly, and
-- the route enforces the role itself in application code.
DROP POLICY IF EXISTS "Only admins can access assessments" ON public.assessments;


-- ═══════════════════════════════════════════════════════════════════════
-- 5. Account deletion must not destroy your tax records
-- ═══════════════════════════════════════════════════════════════════════
--
-- payments.user_id is currently:
--     FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
--
-- CASCADE means deleting a user deletes their payment rows — and UK tax law
-- requires you to keep a record of every sale for six years. A customer
-- exercising their right to erasure would silently destroy records you are
-- legally required to hold.
--
-- app/api/account/delete/route.ts already sets user_id to NULL before deleting
-- the auth user, which sidesteps the cascade — but only if the column is
-- nullable. Check first:

SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'user_id';

-- If is_nullable = 'NO', or to make the intent explicit either way:
--
--   ALTER TABLE public.payments ALTER COLUMN user_id DROP NOT NULL;
--   ALTER TABLE public.payments DROP CONSTRAINT payments_user_id_fkey;
--   ALTER TABLE public.payments
--     ADD CONSTRAINT payments_user_id_fkey
--     FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
--
-- Do the same for audit_logs if it has a CASCADE to auth.users.


-- ═══════════════════════════════════════════════════════════════════════
-- 6. Indexes — every hot query filters by user_id, none of them are indexed
-- ═══════════════════════════════════════════════════════════════════════
--
-- The index list showed only primary keys plus four incidental unique
-- constraints. subscriptions and user_progress happen to be covered because
-- user_id is their key. Everything else does a sequential scan.
--
-- user_results is the one that matters most: /api/user-history filters by
-- user_id and orders by created_at on every visit to the history page.
--
-- CONCURRENTLY so these do not lock the tables. Run them one at a time —
-- CREATE INDEX CONCURRENTLY cannot run inside a transaction block.

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_results_user_created
  ON public.user_results (user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_main_reports_user
  ON public.ai_main_reports (user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_followup_reports_user
  ON public.ai_followup_reports (user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_followup_answers_user
  ON public.followup_answers (user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_user
  ON public.payments (user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessments_user
  ON public.assessments (user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_created
  ON public.audit_logs (user_id, created_at DESC);


-- ═══════════════════════════════════════════════════════════════════════
-- 7. VERIFY — re-run after applying, and confirm the escalation is closed
-- ═══════════════════════════════════════════════════════════════════════
--
-- Expected: no UPDATE policy on profiles, no anon INSERT on assessments,
-- exactly one SELECT policy on user_roles.

SELECT tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'assessments', 'user_roles')
ORDER BY tablename, cmd;

-- Then prove the escalation is actually dead. From the BROWSER CONSOLE while
-- signed in as an ordinary user (not the SQL editor — that runs as owner and
-- bypasses RLS, so it will always look fine):
--
--   const { data, error } = await supabase
--     .from('profiles')
--     .update({ role: 'superadmin' })
--     .eq('id', (await supabase.auth.getUser()).data.user.id)
--     .select();
--
-- Expected AFTER the fix: an error, or data === [] with zero rows changed.
-- Before the fix this returns the updated row with role: 'superadmin'.
