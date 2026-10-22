// lib/i18n/server.ts
//
// The current language inside server components. Reads the cookie the
// language switcher writes, falling back to the browser's Accept-Language.

import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { LOCALE_COOKIE, negotiateLocale, type Locale } from '@/lib/i18n/config';
import type { MessageKey } from '@/lib/i18n/messages';
import { createTranslator, type Translator } from '@/lib/i18n/translate';

export async function getLocale(): Promise<Locale> {
  const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);
  return negotiateLocale(cookieStore.get(LOCALE_COOKIE)?.value, headerList.get('accept-language'));
}

export async function getTranslator(): Promise<Translator> {
  return createTranslator(await getLocale());
}

/**
 * A page's tab title in the reader's language; the root layout adds
 * "| ADAQNO". Kept out of search results unless `index` is set, since most
 * pages using this belong to a signed-in student.
 */
export async function pageMetadata(titleKey: MessageKey, { index = false } = {}): Promise<Metadata> {
  const { t } = await getTranslator();
  return index ? { title: t(titleKey) } : { title: t(titleKey), robots: { index: false, follow: false } };
}
