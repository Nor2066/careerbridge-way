-- supabase/checkout-consent.sql
--
-- Columns recording what the customer agreed to at the moment they paid.
--
-- WHY
--
-- The refund policy says the 14-day cancellation right ends for digital
-- content the customer has received. That is only true under regulation 37 of
-- the Consumer Contracts Regulations 2013 where they gave express consent to
-- supply starting immediately AND acknowledged losing the right.
--
-- Until now the checkout displayed a sentence under the pay button. Nothing
-- recorded whether anyone saw it, so the evidence for a refused refund was
-- "the page said so at the time" — which is not evidence, it is an assertion
-- about a page that has since been redeployed.
--
-- Stripe now collects it as a tickbox and reports the result per session.
-- These columns are where it lands.
--
-- Run each numbered block on its own, the same way as the other files here.


-- ═══════════════════════════════════════════════════════════════════════
-- BLOCK 1 of 3  —  the columns
-- ═══════════════════════════════════════════════════════════════════════
--
-- consent_terms_of_service holds Stripe's own value, 'accepted', or the
-- string 'not_collected' when no box was shown. Deliberately not a boolean:
-- "not collected" and "shown and declined" are different facts, and a boolean
-- would flatten them into the same false.

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS consent_terms_of_service text,
  ADD COLUMN IF NOT EXISTS terms_version            text;

COMMENT ON COLUMN public.payments.consent_terms_of_service IS
  'Stripe consent.terms_of_service for the session: ''accepted'', or ''not_collected'' when no tickbox was shown. Evidence for CCR 2013 reg 37.';
COMMENT ON COLUMN public.payments.terms_version IS
  'TERMS_VERSION from lib/legal.ts at the time of the purchase.';


-- ═══════════════════════════════════════════════════════════════════════
-- BLOCK 2 of 3  —  confirm it worked
-- ═══════════════════════════════════════════════════════════════════════

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'payments'
  AND column_name IN ('consent_terms_of_service', 'terms_version')
ORDER BY column_name;


-- ═══════════════════════════════════════════════════════════════════════
-- BLOCK 3 of 3  —  which purchases are actually covered
-- ═══════════════════════════════════════════════════════════════════════
--
-- The query to run before refusing a refund on the "you already received it"
-- ground. A purchase showing 'not_collected' or null has no acknowledgement
-- behind it, so the 14-day right probably still applies to it and the refund
-- should just be paid.
--
-- Expect every row after launch to read 'accepted'. If they do not,
-- STRIPE_REQUIRE_TOS is not set to "true" in the environment, and
-- app/api/checkout/route.ts is logging a warning on every session saying so.

SELECT
  coalesce(consent_terms_of_service, '(null — predates this column)') AS consent,
  count(*)                                                            AS payments,
  min(created_at)                                                     AS earliest,
  max(created_at)                                                     AS latest
FROM public.payments
GROUP BY 1
ORDER BY payments DESC;
