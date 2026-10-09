// lib/i18n/config.ts
//
// Which languages the site speaks and how one is chosen. Safe to import from
// both server and client code — nothing here touches cookies or headers
// directly.
//
// The choice is a cookie, not a URL prefix (/es/...). Moving every page under
// app/[lang] would change every URL, including the OAuth callback that has to
// match the allow-lists in Supabase and Google exactly. A cookie changes none
// of that. The cost is that a page cannot be cached per language, which this
// site does not do anyway.

export const LOCALES = ['en', 'es'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/** Remembers the visitor's choice for a year. Not a tracking cookie. */
export const LOCALE_COOKIE = 'adaqno_locale';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Each language named in itself, which is how a switcher should show it. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
};

/** For Intl date and number formatting. */
export const INTL_LOCALE: Record<Locale, string> = {
  en: 'en-GB',
  es: 'es-ES',
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/**
 * The visitor's language: their explicit choice if they made one, otherwise
 * the first supported language their browser asks for, otherwise English.
 */
export function negotiateLocale(cookieValue?: string | null, acceptLanguage?: string | null): Locale {
  if (isLocale(cookieValue)) return cookieValue;

  if (acceptLanguage) {
    const preferred = acceptLanguage
      .split(',')
      .map((part) => {
        const [tag, q] = part.trim().split(';q=');
        return { lang: tag.toLowerCase().split('-')[0], q: q ? Number(q) : 1 };
      })
      .filter((p) => p.lang && !Number.isNaN(p.q))
      .sort((a, b) => b.q - a.q);
    for (const p of preferred) {
      if (isLocale(p.lang)) return p.lang;
    }
  }

  return DEFAULT_LOCALE;
}

/** Reads the locale cookie out of a raw Cookie header (for route handlers). */
export function localeFromCookieHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === LOCALE_COOKIE) return decodeURIComponent(rest.join('='));
  }
  return null;
}

/** The language of an API request, from the same cookie and header. */
export function localeFromRequest(request: Request): Locale {
  return negotiateLocale(
    localeFromCookieHeader(request.headers.get('cookie')),
    request.headers.get('accept-language')
  );
}
