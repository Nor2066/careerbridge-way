import { describe, it, expect } from 'vitest';
import { negotiateLocale, localeFromCookieHeader, LOCALES } from '@/lib/i18n/config';
import { MESSAGES } from '@/lib/i18n/messages';
import { OPTION_LABELS, CLUSTER_LABELS } from '@/lib/i18n/options';
import { translate, translateOption, translateCluster } from '@/lib/i18n/translate';
import { allMainQuestionnaireOptions } from '@/lib/assessment-options';
import { MAX_SCORES } from '@/lib/scoring';
import { clusterQuestions } from '@/lib/followup-questions';
import { clusterQuestionsEs } from '@/lib/i18n/followup-questions-es';

describe('choosing the language', () => {
  it('prefers the visitor’s explicit choice', () => {
    expect(negotiateLocale('es', 'en-GB,en;q=0.9')).toBe('es');
    expect(negotiateLocale('en', 'es-ES,es;q=0.9')).toBe('en');
  });

  it('falls back to what the browser asks for', () => {
    expect(negotiateLocale(null, 'es-ES,es;q=0.9,en;q=0.8')).toBe('es');
    expect(negotiateLocale(null, 'fr-FR,es;q=0.5')).toBe('es');
    expect(negotiateLocale(null, 'de-DE,fr;q=0.9')).toBe('en');
  });

  it('ignores a cookie it does not recognise', () => {
    expect(negotiateLocale('xx', 'es')).toBe('es');
    expect(negotiateLocale(undefined, undefined)).toBe('en');
  });

  it('reads the cookie out of a raw header', () => {
    expect(localeFromCookieHeader('a=1; adaqno_locale=es; b=2')).toBe('es');
    expect(localeFromCookieHeader('a=1')).toBeNull();
    expect(localeFromCookieHeader(null)).toBeNull();
  });
});

describe('the dictionaries', () => {
  const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

  // A Spanish string missing a {placeholder} the English has would silently
  // drop a number or a name from the sentence.
  it('uses the same placeholders in every language', () => {
    for (const [key, entry] of Object.entries(MESSAGES)) {
      const en = placeholders(entry.en);
      for (const locale of LOCALES) {
        expect(placeholders(entry[locale]), `${key} (${locale})`).toEqual(en);
      }
    }
  });

  it('has no empty translations, except deliberate ones', () => {
    // Shown only in non-English languages; English needs no such note.
    const allowedEmpty = new Set(['footer.legalEnglishOnly:en']);
    for (const [key, entry] of Object.entries(MESSAGES)) {
      for (const locale of LOCALES) {
        if (allowedEmpty.has(`${key}:${locale}`)) continue;
        expect(entry[locale].trim().length, `${key} (${locale})`).toBeGreaterThan(0);
      }
    }
  });

  it('fills placeholders and leaves unknown ones visible', () => {
    expect(translate('es', 'assess.stepOf', { step: 3, total: 46 })).toBe('Paso 3 de 46');
    expect(translate('en', 'assess.stepOf', { step: 3 })).toBe('Step 3 of {total}');
  });
});

describe('questionnaire options', () => {
  // Every option the main questionnaire can show needs a Spanish label, or a
  // Spanish-speaking student meets a question half in English.
  it('has a Spanish label for every option', () => {
    const missing = allMainQuestionnaireOptions().filter((o) => !OPTION_LABELS[o]?.es);
    expect(missing).toEqual([]);
  });

  it('shows English options as they are', () => {
    expect(translateOption('en', 'Mathematics')).toBe('Mathematics');
    expect(translateOption('es', 'Mathematics')).toBe('Matemáticas');
    expect(translateOption('es', 'something new')).toBe('something new');
  });

  it('names every scoring cluster in every language', () => {
    for (const cluster of Object.keys(MAX_SCORES)) {
      expect(CLUSTER_LABELS[cluster as keyof typeof CLUSTER_LABELS], cluster).toBeDefined();
      for (const locale of LOCALES) {
        expect(translateCluster(locale, cluster).length).toBeGreaterThan(0);
      }
    }
    expect(translateCluster('es', 'SocialImpact')).toBe('Impacto social');
  });
});

describe('the Spanish follow-up questions', () => {
  const letters = (q: string) =>
    q.split('\n').map((l) => l.match(/^\(([a-z])\)\s+/)?.[1]).filter(Boolean);

  // Answers are stored as the option letter. If the Spanish wording had a
  // different number of options, a Spanish "(c)" could mean an English "(d)".
  it('lines up with the English questions, option for option', () => {
    expect(Object.keys(clusterQuestionsEs).sort()).toEqual(Object.keys(clusterQuestions).sort());
    for (const [cluster, english] of Object.entries(clusterQuestions)) {
      const spanish = clusterQuestionsEs[cluster];
      expect(spanish.length, cluster).toBe(english.length);
      english.forEach((q, i) => {
        expect(letters(spanish[i]), `${cluster} Q${i + 1}`).toEqual(letters(q));
      });
    }
  });
});
