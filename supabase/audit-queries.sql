-- supabase/audit-queries.sql
--
-- Read-only checks to run in the Supabase SQL editor. Nothing here changes
-- anything; the fixes are in the FIXES section at the bottom, commented out,
-- so you read the answer before you act on it.
--
-- Run these top to bottom and paste the output back. They cover the things
-- that cannot be seen from the repository: what the database actually enforces.


-- ═══════════════════════════════════════════════════════════════════════
-- 1. ROW LEVEL SECURITY — is it on at all?
-- ═══════════════════════════════════════════════════════════════════════
--
-- Any table here with rls_enabled = false is readable by anyone holding the
-- anon key, which is published in the browser bundle of every visitor. That
-- is the single most common way an app like this leaks its whole user table.

SELECT
  c.relname                        AS table_name,
  c.relrowsecurity                 AS rls_enabled,
  c.relforcerowsecurity            AS rls_forced,
  (SELECT count(*) FROM pg_policies p
    WHERE p.schemaname = 'public' AND p.tablename = c.relname) AS policy_count
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
ORDER BY c.relrowsecurity ASC, c.relname;


-- ═══════════════════════════════════════════════════════════════════════
-- 2. THE POLICIES THEMSELVES
-- ═══════════════════════════════════════════════════════════════════════
--
-- What to look for in the output:
--
--   • A policy for SELECT but none for INSERT/UPDATE is the classic gap:
--     nobody can read your row, but anyone can write to it. That is how
--     someone grants themselves attempts or an admin role.
--
--   • A qual that compares against a value the client supplies, rather than
--     auth.uid(), is not a policy — it is a suggestion.

SELECT
  tablename,
  policyname,
  cmd            AS applies_to,
  roles,
  qual           AS using_expression,
  with_check     AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;


-- ═══════════════════════════════════════════════════════════════════════
-- 3. IDEMPOTENCY — the constraint the whole payment flow rests on
-- ═══════════════════════════════════════════════════════════════════════
--
-- lib/fulfillment.ts relies on a UNIQUE constraint on
-- payments.stripe_session_id: the webhook and the success page's verify call
-- race each other by design, and whoever inserts first owns the grant. If this
-- returns no rows, that race has no referee and a customer can be granted
-- twice for one payment.

SELECT
  conname        AS constraint_name,
  contype        AS type,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.payments'::regclass
ORDER BY contype;


-- ═══════════════════════════════════════════════════════════════════════
-- 4. FOREIGN KEYS — what happens when a user deletes their account
-- ═══════════════════════════════════════════════════════════════════════
--
-- app/api/account/delete/route.ts deletes child rows itself, then detaches
-- payments, then deletes the auth user. That last step fails if any foreign
-- key to auth.users is NO ACTION / RESTRICT and a row still points at it.
--
-- delete_rule tells you which:
--   CASCADE   — child rows go automatically. Fine.
--   SET NULL  — link is dropped, row kept. What payments should be.
--   NO ACTION / RESTRICT — deletion is blocked. Needs fixing.

-- NOTE: an earlier version of this query used information_schema, which
-- returned zero rows on Supabase. Those views only show objects the current
-- role has privileges on, and auth.users is owned by supabase_auth_admin — so
-- the foreign keys pointing at it were invisible rather than absent. Reading
-- pg_catalog directly avoids that.

SELECT
  con.conname                              AS constraint_name,
  src.relname                              AS table_name,
  att.attname                              AS column_name,
  tgt_ns.nspname || '.' || tgt.relname     AS references_table,
  CASE con.confdeltype
    WHEN 'a' THEN 'NO ACTION'
    WHEN 'r' THEN 'RESTRICT'
    WHEN 'c' THEN 'CASCADE'
    WHEN 'n' THEN 'SET NULL'
    WHEN 'd' THEN 'SET DEFAULT'
  END                                      AS delete_rule,
  att.attnotnull                           AS column_is_not_null
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
-- 5. INDEXES — every hot query filters by user_id
-- ═══════════════════════════════════════════════════════════════════════
--
-- Without an index on user_id these are sequential scans that get slower with
-- every signup. Invisible at 50 users, painful at 5,000.

SELECT
  t.relname AS table_name,
  i.relname AS index_name,
  array_to_string(array_agg(a.attname ORDER BY a.attnum), ', ') AS columns
FROM pg_class t
JOIN pg_index ix     ON t.oid = ix.indrelid
JOIN pg_class i      ON i.oid = ix.indexrelid
JOIN pg_attribute a  ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
JOIN pg_namespace n  ON n.oid = t.relnamespace
WHERE n.nspname = 'public'
GROUP BY t.relname, i.relname
ORDER BY t.relname, i.relname;


-- ═══════════════════════════════════════════════════════════════════════
-- 6. STORAGE BUCKETS — public means public
-- ═══════════════════════════════════════════════════════════════════════
--
-- A public bucket is readable by anyone who can guess a URL. The app does not
-- upload anything today, so the expected answer is "no rows" or "none public".

SELECT id, name, public, created_at
FROM storage.buckets
ORDER BY public DESC, name;


-- ═══════════════════════════════════════════════════════════════════════
-- 7. PROVE IT — run this as an ordinary signed-in user, not as the owner
-- ═══════════════════════════════════════════════════════════════════════
--
-- Reading a policy is not the same as testing it. Replace the UUID with a
-- DIFFERENT user's id than the one you are authenticated as, and run this from
-- a client using the ANON key (not the SQL editor, which runs as owner and
-- bypasses RLS entirely).
--
-- Expected result: zero rows for every table. Any row that comes back is a
-- live data leak.
--
--   SELECT * FROM user_results       WHERE user_id = '<OTHER-USER-UUID>';
--   SELECT * FROM ai_main_reports    WHERE user_id = '<OTHER-USER-UUID>';
--   SELECT * FROM subscriptions      WHERE user_id = '<OTHER-USER-UUID>';
--   SELECT * FROM payments           WHERE user_id = '<OTHER-USER-UUID>';
--
-- And the write side, which people forget to test:
--
--   UPDATE subscriptions SET main_attempts_remaining = 999
--     WHERE user_id = '<YOUR-OWN-UUID>';
--   -- Expected: blocked. If this succeeds, attempts are free for everyone.


-- ═══════════════════════════════════════════════════════════════════════
-- FIXES — read the output above first, then uncomment what you need
-- ═══════════════════════════════════════════════════════════════════════

-- ── Turn RLS on for a table that has it off ──────────────────────────
-- Do this for every table from query 1 with rls_enabled = false. Note that
-- enabling RLS with NO policies denies everything to the anon key — which is
-- safe, and is what you want for tables only the server touches.
--
--   ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;

-- ── The standard owner-only policy ───────────────────────────────────
-- Covers read and write. The WITH CHECK half is what stops someone inserting
-- a row that claims to belong to somebody else.
--
--   CREATE POLICY "owner can read"   ON public.<table>
--     FOR SELECT USING (auth.uid() = user_id);
--   CREATE POLICY "owner can insert" ON public.<table>
--     FOR INSERT WITH CHECK (auth.uid() = user_id);
--   CREATE POLICY "owner can update" ON public.<table>
--     FOR UPDATE USING (auth.uid() = user_id)
--                WITH CHECK (auth.uid() = user_id);

-- ── Let account deletion keep the sales record ───────────────────────
-- UK tax law wants six years of sales records; GDPR wants the person gone.
-- Both are satisfied by keeping the transaction and dropping the link.
--
--   ALTER TABLE public.payments ALTER COLUMN user_id DROP NOT NULL;
--   ALTER TABLE public.payments DROP CONSTRAINT payments_user_id_fkey;
--   ALTER TABLE public.payments
--     ADD CONSTRAINT payments_user_id_fkey
--     FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
--
-- Same shape for audit_logs, for the same reason.

-- ── Indexes for the queries the app actually runs ────────────────────
-- IF NOT EXISTS makes these safe to run twice.
--
--   CREATE INDEX IF NOT EXISTS idx_user_results_user_created
--     ON public.user_results (user_id, created_at DESC);
--   CREATE INDEX IF NOT EXISTS idx_user_progress_user
--     ON public.user_progress (user_id);
--   CREATE INDEX IF NOT EXISTS idx_ai_main_reports_user
--     ON public.ai_main_reports (user_id);
--   CREATE INDEX IF NOT EXISTS idx_ai_followup_reports_user
--     ON public.ai_followup_reports (user_id);
--   CREATE INDEX IF NOT EXISTS idx_followup_unlocks_user_result
--     ON public.followup_unlocks (user_id, result_id);
--   CREATE INDEX IF NOT EXISTS idx_payments_user
--     ON public.payments (user_id);

-- ── The idempotency constraint, if query 3 showed it missing ─────────
--   ALTER TABLE public.payments
--     ADD CONSTRAINT payments_stripe_session_id_key UNIQUE (stripe_session_id);
