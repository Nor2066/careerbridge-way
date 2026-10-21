// lib/plans.ts
// Central configuration for all pricing/plan logic.
// Both the checkout route and webhook route import from here so the
// pricing rules live in exactly one place.

import { BRAND_FULL } from '@/lib/site';
import { PRICES_CENTS } from '@/lib/prices';
import type { Locale } from '@/lib/i18n/config';

export type ProductType = 'basic' | 'full' | 'followup_unlock' | 'topup';

export const STRIPE_PRICE_IDS: Record<ProductType, string> = {
  basic: process.env.STRIPE_PRICE_BASIC!,
  full: process.env.STRIPE_PRICE_FULL!,
  followup_unlock: process.env.STRIPE_PRICE_FOLLOWUP!,
  topup: process.env.STRIPE_PRICE_TOPUP!,
};

// FALLBACK ONLY. The amount written to payments.amount_cents comes from the
// Stripe session's amount_total; these values are used solely when Stripe
// gives us nothing to record. They are not the source of truth for what a
// customer is charged — the Price object in the Dashboard is — so a mismatch
// here does not affect billing, only a fallback record.
// The same numbers the site displays, so they live in lib/prices.ts.
// followup_unlock was 150 — now ONE purchase that unlocks BOTH followups.
// topup was 100 — now a 3-pack of full attempts (main + followup).
export const PRODUCT_AMOUNTS_CENTS: Record<ProductType, number> = PRICES_CENTS;

// How many main-questionnaire attempts each product grants
export const ATTEMPTS_GRANTED: Record<ProductType, number> = {
  basic: 2,
  full: 3,
  followup_unlock: 0, // doesn't grant a main attempt directly — grants followup
                       // access account-wide + an immediate bonus attempt
                       // (handled in the webhook, replacing the old "2 unlocks
                       // = bonus attempt" logic)
  topup: 3,            // was 1 — now grants 3 full attempts (main + followup
                        // each) per purchase
};

// ─── Stripe Checkout presentation ────────────────────────────────────
// Shown directly under the Pay button. At that moment the customer is
// asking exactly one question — "what do I actually get?" — so each
// product answers it in its own words. Counts are interpolated from
// ATTEMPTS_GRANTED so the copy can never drift from what is granted.
// In the language the customer chose on the site: Stripe's own labels follow
// the session's `locale`, but these sentences are ours.
export const CHECKOUT_SUBMIT_MESSAGE: Record<Locale, Record<ProductType, string>> = {
  en: {
    basic: `Your ${ATTEMPTS_GRANTED.basic} assessment attempts are added to your account the moment payment completes.`,
    full: `All ${ATTEMPTS_GRANTED.full} complete attempts — main and followup questionnaire each — are added the moment payment completes.`,
    followup_unlock:
      'Unlocks the followup questionnaire for every attempt on your account, and adds a bonus attempt straight away.',
    topup: `Adds ${ATTEMPTS_GRANTED.topup} complete attempts — main and followup for each — to your existing plan.`,
  },
  es: {
    basic: `Tus ${ATTEMPTS_GRANTED.basic} intentos de evaluación se añaden a tu cuenta en cuanto se completa el pago.`,
    full: `Los ${ATTEMPTS_GRANTED.full} intentos completos (cuestionario principal y de seguimiento en cada uno) se añaden en cuanto se completa el pago.`,
    followup_unlock:
      'Desbloquea el cuestionario de seguimiento en todos los intentos de tu cuenta y añade un intento extra al momento.',
    topup: `Añade ${ATTEMPTS_GRANTED.topup} intentos completos (principal y seguimiento en cada uno) a tu plan actual.`,
  },
};

// Brand colours mirror --btn-primary-bg-start and --card-bg in globals.css.
// display_name carries the descriptor: the checkout header is where someone
// paying needs to recognise who they are paying, and the name alone does not
// say what we sell.
// Stripe takes solid colours only, so the indigo end of the site's gradient
// stands in for it. font_family 'inter' is the closest supported match to
// the Tailwind default sans stack the rest of the site uses.
export const CHECKOUT_BRANDING = {
  display_name: BRAND_FULL,
  button_color: '#4f46e5',
  background_color: '#ffffff',
  border_style: 'rounded',
  font_family: 'inter',
} as const;

/**
 * The consumer-rights sentence that has to be seen BEFORE payment.
 *
 * Under the EU Consumer Rights Directive (in Hungary, Govt Decree 45/2014) a
 * buyer has 14 days to change their mind — except for digital content they agreed to receive
 * immediately, having been told they lose that right by doing so. The refund
 * policy leans on this, and it only holds if the customer was actually shown
 * it at the point of payment rather than only on a policy page they never
 * opened.
 *
 * Kept short on purpose. A paragraph of legalese under a Pay button is read by
 * nobody, which defeats the point of showing it.
 */
export const IMMEDIATE_DELIVERY_NOTICE: Record<Locale, string> = {
  en: 'Your purchase is available straight away, so your 14-day right to cancel ends once you generate a report with it. Anything you have not used stays refundable for 14 days.',
  es: 'Tu compra está disponible al momento, así que tu derecho a desistir en 14 días termina cuando generes un informe con ella. Lo que no hayas usado sigue siendo reembolsable durante 14 días.',
};

/**
 * The wording beside the tickbox at checkout.
 *
 * Article 16(m) of the Consumer Rights Directive (in Hungary, 29. § (1) m) of
 * Govt Decree 45/2014) takes away the 14-day cancellation right for digital content only where the consumer gave
 * EXPRESS CONSENT to supply starting early AND ACKNOWLEDGED that they lose the
 * right by doing so. A sentence displayed under the pay button — which is all
 * IMMEDIATE_DELIVERY_NOTICE was — is arguably neither: nothing records that
 * the person did anything, and an unread notice is not an affirmative act.
 *
 * So the same three things now hang off a box the customer has to tick:
 * agreement to the terms, the request for immediate supply, and the
 * acknowledgement. Stripe renders this next to its terms-of-service checkbox,
 * and reports back on the session whether it was ticked — which is the part
 * that turns this from wording into evidence.
 *
 * Deliberately short. This has to be read in the three seconds before someone
 * clicks pay, and a paragraph of statute references would not be.
 *
 * Requires STRIPE_REQUIRE_TOS=true and a terms-of-service URL set in the
 * Stripe Dashboard. Without the flag the box is not shown at all and the
 * refund policy is resting on the weaker position — see the warning in
 * app/api/checkout/route.ts.
 */
export const TERMS_ACCEPTANCE_MESSAGE: Record<Locale, string> = {
  en:
    'I agree to the Terms of Service. I ask for my purchase to be made available immediately, ' +
    'and I understand that once I generate a report with it I lose my 14-day right to cancel ' +
    'that part. Anything I have not used stays refundable for 14 days.',
  // Spanish wording for the lawyer to confirm, alongside the English one.
  es:
    'Acepto los Términos del servicio. Pido que mi compra esté disponible de inmediato ' +
    'y entiendo que, cuando genere un informe con ella, pierdo mi derecho a desistir en 14 días ' +
    'respecto de esa parte. Lo que no haya usado sigue siendo reembolsable durante 14 días.',
};

// Which plan a purchase sets the user to (only basic/full change the plan)
export const PLAN_FOR_PRODUCT: Record<ProductType, 'basic' | 'full' | null> = {
  basic: 'basic',
  full: 'full',
  followup_unlock: null,
  topup: null,
};

// followup_unlock is now an account-wide bundle purchase (unlocks all
// followups on the Basic plan) — it is no longer tied to a specific
// result_id, so nothing requires one anymore.
export function requiresResultId(productType: ProductType): boolean {
  return false;
}