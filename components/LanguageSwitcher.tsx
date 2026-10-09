'use client';

// components/LanguageSwitcher.tsx
//
// EN | ES in the navbar. Each language is named in itself, and the current
// one is marked for screen readers as well as visually.

import { LOCALES, LOCALE_NAMES } from '@/lib/i18n/config';
import { useI18n } from '@/components/I18nProvider';

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div role="group" aria-label={t('nav.language')} className={`flex items-center rounded-full border border-white/15 bg-white/5 p-0.5 text-xs ${className}`}>
      {LOCALES.map((l) => {
        const current = l === locale;
        return (
          <button
            key={l}
            type="button"
            lang={l}
            onClick={() => !current && setLocale(l)}
            aria-pressed={current}
            title={LOCALE_NAMES[l]}
            className={`rounded-full px-2.5 py-1 font-semibold uppercase tracking-wide transition ${
              current ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
