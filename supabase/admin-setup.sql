-- supabase/admin-setup.sql
--
-- The admin area is built and guarded, but nobody can get into it: every
-- profiles row has role = NULL, which lib/roles.ts reads as 'viewer'. Two
-- accounts, including yours, have no profiles row at all.
--
-- Run block 1 to let yourself in. Block 2 stops the missing-row problem
-- happening again. Block 3 is optional tidying.
--
-- Select a whole numbered block and run it.


-- ═══════════════════════════════════════════════════════════════════════
-- BLOCK 1 of 3  —  make yourself an admin
-- ═══════════════════════════════════════════════════════════════════════
--
-- 'superadmin' rather than 'admin': lib/roles.ts treats both as admin for
-- access purposes, and superadmin is the one isSuperAdmin() checks for if
-- anything is ever restricted further.
--
-- Change the email if you want a different account. Only do this for accounts
-- you control — an admin can read every assessment in the database.

INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'superadmin'
FROM auth.users
WHERE email = 'baknormi@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'superadmin';

-- Check it worked. Expect one row, role = superadmin.
SELECT u.email, p.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'baknormi@gmail.com';


-- ═══════════════════════════════════════════════════════════════════════
-- BLOCK 2 of 3  —  create a profile for every new signup, automatically
-- ═══════════════════════════════════════════════════════════════════════
--
-- Five of your seven accounts have a profiles row and two do not, which means
-- nothing reliably creates one. Nothing breaks today — getUserRole() treats a
-- missing row as 'viewer', which is the safe default — but it means the table
-- cannot be trusted, and anything built on it later will have gaps.
--
-- SECURITY DEFINER because the trigger runs as the signing-up user, who has no
-- rights on public.profiles. search_path is pinned, which is the standard
-- precaution for a definer function: without it, a caller could put a lookalike
-- schema earlier in the path and change what "profiles" resolves to.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill the accounts that never got one. Deliberately does not set a role,
-- so nobody is quietly promoted.
INSERT INTO public.profiles (id, email)
SELECT u.id, u.email
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- Expect: every account has a profile, and only yours has a role.
SELECT u.email, p.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
ORDER BY p.role NULLS LAST, u.email;


-- ═══════════════════════════════════════════════════════════════════════
-- BLOCK 3 of 3  —  optional: drop the column that does nothing
-- ═══════════════════════════════════════════════════════════════════════
--
-- profiles has BOTH is_admin (boolean) and role (text). Nothing in the
-- application reads is_admin — lib/roles.ts reads role, and so does proxy.ts.
--
-- Leaving it is a trap rather than merely untidy: the obvious way to make
-- someone an admin is to tick a column called is_admin, and doing that grants
-- nothing while looking like it worked.
--
-- Only run this once block 1 has been confirmed working.

-- ALTER TABLE public.profiles DROP COLUMN is_admin;
