'use client';

// components/I18nProvider.tsx
//
// Gives every client component the current language and a way to change it.
// The root layout reads the language on the server and passes it in, so the
// first render is already in the right language — no flash of English.

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, type Locale } from '@/lib/i18n/config';
import { createTranslator, type Translator } from '@/lib/i18n/translate';

type I18nContextValue = Translator & { setLocale: (locale: Locale) => void };

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const router = useRouter();

  const setLocale = useCallback(
    (next: Locale) => {
      // SameSite=Lax and no Secure flag needed beyond what the browser applies:
      // it holds a language code, nothing private.
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
      document.documentElement.lang = next;
      setLocaleState(next);
      // Server components (the footer, legal notices, metadata) re-render with
      // the new cookie; client state such as half-answered questions is kept.
      router.refresh();
    },
    [router]
  );

  const value = useMemo(() => ({ ...createTranslator(locale), setLocale }), [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
