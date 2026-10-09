// lib/prices.ts
//
// What each product costs, as the site shows it. Kept apart from lib/plans.ts
// because plans.ts reads server-only environment variables and the pricing
// cards are client components.
//
// These are TOTALS, tax included. The Stripe Prices must be created in GBP
// with "Include tax in price" set, so Stripe takes VAT/sales tax out of the
// amount rather than adding it at checkout. UK consumer law (the DMCC Act's
// drip-pricing ban) and the EU price rules both require the first price a
// consumer sees to be the full amount they pay — showing £3.00 here and
// charging £3.60 at checkout would break that.
//
// Stripe stays the source of truth for what is actually charged. Changing a
// price means a new Price in the Dashboard AND the number here, together.

import { INTL_LOCALE, type Locale } from '@/lib/i18n/config';

export type PricedProduct = 'basic' | 'full' | 'followup_unlock' | 'topup';

export const PRICE_CURRENCY = 'GBP';

export const PRICES_PENCE: Record<PricedProduct, number> = {
  basic: 300,
  full: 450,
  followup_unlock: 300,
  topup: 300,
};

const formatters: Record<Locale, Intl.NumberFormat> = {
  en: new Intl.NumberFormat(INTL_LOCALE.en, { style: 'currency', currency: PRICE_CURRENCY }),
  es: new Intl.NumberFormat(INTL_LOCALE.es, { style: 'currency', currency: PRICE_CURRENCY }),
};

/**
 * "£3.00" — the full amount the customer pays, tax included. The amount and
 * currency never change with the language; only how they are written does
 * ("3,00 £" in Spanish).
 */
export function formatPrice(product: PricedProduct, locale: Locale = 'en'): string {
  return formatters[locale].format(PRICES_PENCE[product] / 100);
}

/** Shown beside a price wherever there is room, so nobody wonders whether
 *  tax is added later. */
export const TAX_NOTE = 'tax included';
export const TAX_NOTES: Record<Locale, string> = { en: TAX_NOTE, es: 'impuestos incluidos' };
