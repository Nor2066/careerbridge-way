import type { Locale } from '@/lib/i18n/config';

/** One string in every language. Missing a language is a type error. */
export type Entry = Record<Locale, string>;
