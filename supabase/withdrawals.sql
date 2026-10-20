-- supabase/withdrawals.sql
--
-- Withdrawal statements sent with the "withdraw from contract here" button
-- (/withdraw). Article 11a of the EU Consumer Rights Directive, applying from
-- 19 June 2026: an EU customer who bought online must be able to withdraw
-- online, and must get an acknowledgement of exactly what they sent and when.
--
-- One row per statement. It is the evidence that someone withdrew, and when,
-- so it is kept like a payment record: deleting the account detaches it
-- (user_id becomes NULL) rather than removing it.
--
-- The founders work through new rows on /admin/withdrawals: refund in Stripe
-- within 14 days of submitted_at, remove the purchase's attempts, then mark
-- the row handled.
--
-- Run the whole file once in the Supabase SQL Editor, BEFORE deploying the
-- code that uses it. It is safe to run again.


BEGIN;

CREATE TABLE IF NOT EXISTS public.withdrawals (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- The account it came from: the signed-in user, or the account matching the
  -- email a signed-out visitor typed. NULL when neither is known.
  user_id                  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  -- The purchase picked from the list. NULL when the customer described it in
  -- their own words (signed out, or "another purchase").
  payment_id               uuid REFERENCES public.payments(id) ON DELETE SET NULL,

  -- The statement itself, as the customer gave it. Article 11a(2): their
  -- name, the contract, and where the confirmation should go.
  consumer_name            text NOT NULL CHECK (char_length(consumer_name) BETWEEN 1 AND 200),
  contract_details         text NOT NULL CHECK (char_length(contract_details) BETWEEN 1 AND 1000),
  confirmation_email       text NOT NULL CHECK (position('@' in confirmation_email) > 1),
  -- The account email: the signed-in user's, or what a signed-out visitor
  -- typed as the address they bought with.
  account_email            text,
  locale                   text NOT NULL DEFAULT 'en',
  submitted_at             timestamptz NOT NULL DEFAULT now(),
  -- When the acknowledgement email was accepted for delivery. NULL means it
  -- was not sent (no mail provider yet, or it failed): reply by hand.
  acknowledgement_sent_at  timestamptz,

  -- Handling, filled in from /admin/withdrawals.
  status                   text NOT NULL DEFAULT 'received'
                           CHECK (status IN ('received', 'refunded', 'partly_refunded', 'not_owed')),
  handled_at               timestamptz,
  handled_by               uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  handled_note             text CHECK (handled_note IS NULL OR char_length(handled_note) <= 2000)
);

-- One withdrawal per purchase. A double click, or a second visit, gets the
-- first statement's confirmation back instead of a second row.
CREATE UNIQUE INDEX IF NOT EXISTS withdrawals_payment_id_key
  ON public.withdrawals (payment_id) WHERE payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS withdrawals_user_id_idx
  ON public.withdrawals (user_id);
CREATE INDEX IF NOT EXISTS withdrawals_submitted_at_idx
  ON public.withdrawals (submitted_at DESC);

COMMENT ON TABLE public.withdrawals IS
  'Withdrawal statements from /withdraw (EU Consumer Rights Directive Art. 11a). Kept like payment records; account deletion detaches them.';

-- Only the server (service_role) reads or writes this. The GRANT is not
-- optional: a table made in the SQL Editor gives service_role no rights, and
-- every insert from the app would then fail.
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.withdrawals FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.withdrawals TO service_role;

COMMIT;


-- ── Check it worked ──────────────────────────────────────────────────────
-- Expect: rls_enabled = true, and service_role listed with all four rights.

SELECT relname AS table_name, relrowsecurity AS rls_enabled
FROM pg_class
WHERE oid = 'public.withdrawals'::regclass;

SELECT grantee, string_agg(privilege_type, ', ' ORDER BY privilege_type) AS rights
FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND table_name = 'withdrawals'
GROUP BY grantee
ORDER BY grantee;


-- ── Fallback: removing attempts by hand ──────────────────────────────────
-- /admin/withdrawals removes them when you mark a withdrawal handled. Use this
-- only if that page says the outcome was saved but the attempts were not.
-- Replace the email and the numbers, then run. GREATEST stops a balance going
-- below zero.
--
-- UPDATE public.subscriptions
--    SET main_attempts_remaining = GREATEST(main_attempts_remaining - 3, 0),
--        topup_followup_credits  = GREATEST(topup_followup_credits - 0, 0),
--        updated_at              = now()
--  WHERE user_id = (SELECT id FROM auth.users WHERE email = 'customer@example.com');
--
-- For the follow-up bundle, also set followup_bundle_purchased = false.
