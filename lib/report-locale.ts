// lib/report-locale.ts
//
// What the report routes need to write in the reader's language and point
// them at help in the right country. Server-only in practice (it reads request
// headers), but has no server imports so it can be tested.

import type { Locale } from '@/lib/i18n/config';
import { translateCluster } from '@/lib/i18n/translate';

const LANGUAGE_NAMES: Record<Locale, string> = {
  en: 'English',
  es: 'Spanish (as written in Spain, addressing the reader as "tú")',
};

/** Country names the prompt can use. Anything else is passed as its code. */
const COUNTRY_NAMES: Record<string, string> = {
  ES: 'Spain',
  GB: 'the United Kingdom',
  IE: 'Ireland',
  PT: 'Portugal',
  FR: 'France',
  DE: 'Germany',
  IT: 'Italy',
  NL: 'the Netherlands',
  MX: 'Mexico',
  AR: 'Argentina',
  CO: 'Colombia',
  CL: 'Chile',
  PE: 'Peru',
  US: 'the United States',
};

/**
 * Appended to the system prompt. English with no known country adds nothing,
 * so the existing behaviour for everyone else is unchanged.
 *
 * `country` should only be passed when it is known reliably (the university
 * the student came through), not guessed from an IP address: a wrong country
 * here would skew the whole report.
 */
export function reportContextInstruction(locale: Locale, country?: string | null): string {
  const parts: string[] = [];
  if (locale !== 'en') {
    parts.push(
      `- Write the entire report in ${LANGUAGE_NAMES[locale]}, including headings. The assessment data may be in English or another language; the report must still be in ${LANGUAGE_NAMES[locale].split(' (')[0]}.`,
      '- Use the career cluster names exactly as they are given in the data.'
    );
  }
  if (country) {
    const name = COUNTRY_NAMES[country.toUpperCase()] ?? country.toUpperCase();
    parts.push(
      `- The reader studies in ${name}. Where you mention qualifications, courses, job titles, or how people enter a field, prefer what is real and usual in ${name}.`
    );
  }
  return parts.length ? `\n\nLANGUAGE AND LOCATION:\n${parts.join('\n')}` : '';
}

/** A cluster key as the reader should see it, e.g. SocialImpact → "Impacto social". */
export function clusterForPrompt(locale: Locale, cluster: string): string {
  return translateCluster(locale, cluster);
}

/**
 * Which country's helplines to show: the university's country first (it is
 * known for certain), then where the request came from (Vercel's geolocation
 * header), then a guess from the language. Null means "unknown", which gets
 * the international directory rather than another country's numbers.
 */
export function supportCountry(
  request: Request,
  { institutionCountry, locale }: { institutionCountry?: string | null; locale: Locale }
): string | null {
  if (institutionCountry) return institutionCountry.toUpperCase();
  const geo = request.headers.get('x-vercel-ip-country');
  if (geo && /^[A-Za-z]{2}$/.test(geo)) return geo.toUpperCase();
  if (locale === 'es') return 'ES';
  return null;
}
