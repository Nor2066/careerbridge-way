// lib/i18n/format.ts
//
// Numbers written the way the reader writes them. A career score of 53.6 is
// "53.6%" in English and "53,6 %" in Spanish; the raw number with a "%"
// glued on read as a mistake to Spanish students.

import { INTL_LOCALE, type Locale } from '@/lib/i18n/config';

const percent: Record<Locale, Intl.NumberFormat> = {
  en: new Intl.NumberFormat(INTL_LOCALE.en, { style: 'percent', maximumFractionDigits: 1 }),
  es: new Intl.NumberFormat(INTL_LOCALE.es, { style: 'percent', maximumFractionDigits: 1 }),
};

/** `value` is already a percentage (53.6 means 53.6 %). */
export function formatPercent(value: number, locale: Locale): string {
  return percent[locale].format(value / 100);
}
