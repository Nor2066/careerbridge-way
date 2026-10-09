// lib/i18n/server.ts
//
// The current language inside server components. Reads the cookie the
// language switcher writes, falling back to the browser's Accept-Language.

import { cookies, headers } from 'next/headers';
import { LOCALE_COOKIE, negotiateLocale, type Locale } from '@/lib/i18n/config';
import { createTranslator, type Translator } from '@/lib/i18n/translate';

export async function getLocale(): Promise<Locale> {
  const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);
  return negotiateLocale(cookieStore.get(LOCALE_COOKIE)?.value, headerList.get('accept-language'));
}

export async function getTranslator(): Promise<Translator> {
  return createTranslator(await getLocale());
}
