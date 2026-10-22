// lib/i18n/translate.ts
//
// Looking a string up. Shared by the client provider and server code.

import type { Locale } from '@/lib/i18n/config';
import { MESSAGES, type MessageKey } from '@/lib/i18n/messages';
import { OPTION_LABELS, CLUSTER_LABELS } from '@/lib/i18n/options';

export type Vars = Record<string, string | number>;

/**
 * The string for `key` in `locale`, with {placeholders} filled from `vars`.
 * A placeholder with no value is left visible rather than silently dropped,
 * so a missing variable shows up on screen instead of producing a sentence
 * with a hole in it.
 *
 * {count|one|other} picks a word by number: "one" when count is 1, "other"
 * otherwise. Both English and Spanish need only those two forms, and it
 * replaces the "attempt(s)" that used to be written out.
 */
export function translate(locale: Locale, key: MessageKey, vars?: Vars): string {
  const entry = MESSAGES[key];
  const text: string = entry ? entry[locale] ?? entry.en : key;
  if (!vars) return text;
  const has = (name: string) => Object.prototype.hasOwnProperty.call(vars, name);
  return text
    .replace(/\{(\w+)\|([^|}]*)\|([^}]*)\}/g, (match, name: string, one: string, other: string) =>
      has(name) ? (Number(vars[name]) === 1 ? one : other) : match
    )
    .replace(/\{(\w+)\}/g, (match, name: string) => (has(name) ? String(vars[name]) : match));
}

/**
 * The label to show for a questionnaire option. The VALUE stays English —
 * scoring keys off it, and it is what is saved — and only what is displayed
 * changes. Anything without a translation is shown as-is.
 */
export function translateOption(locale: Locale, value: string): string {
  if (locale === 'en') return value;
  return OPTION_LABELS[value]?.[locale] ?? value;
}

/** A career cluster's display name, from its scoring key ("SocialImpact"). */
export function translateCluster(locale: Locale, cluster: string): string {
  const entry = CLUSTER_LABELS[cluster as keyof typeof CLUSTER_LABELS];
  return entry ? entry[locale] : cluster;
}

export type Translator = {
  locale: Locale;
  t: (key: MessageKey, vars?: Vars) => string;
  tOption: (value: string) => string;
  tCluster: (cluster: string) => string;
};

export function createTranslator(locale: Locale): Translator {
  return {
    locale,
    t: (key, vars) => translate(locale, key, vars),
    tOption: (value) => translateOption(locale, value),
    tCluster: (cluster) => translateCluster(locale, cluster),
  };
}
