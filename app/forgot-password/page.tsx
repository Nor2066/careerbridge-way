'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';

export default function ForgotPasswordPage() {
  const { t, locale } = useI18n();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');

    try {
      const res = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSent(true);
      } else {
        setError(locale === 'en' && data.error ? data.error : t('common.error.generic'));
      }
    } catch {
      setError(t('auth.networkCheck'));
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-slate-950 px-5 py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-white">{t('auth.forgot.title')}</h1>

        {sent ? (
          // Deliberately does not say whether the address had an account —
          // that would turn this form into a way to test which emails are
          // registered. Same wording either way.
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6">
            <p className="text-[15px] leading-relaxed text-gray-300">
              {t('auth.forgot.sent.before')}<span className="text-white">{email}</span>{t('auth.forgot.sent.after')}
            </p>
            <p className="mt-3 text-sm text-gray-500">
              {t('auth.forgot.nothing')}
            </p>
            <Link
              href="/login"
              className="mt-5 inline-block text-sm text-indigo-300 underline underline-offset-4 hover:text-white"
            >
              {t('auth.backToSignIn')}
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-2 text-[15px] leading-relaxed text-gray-400">
              {t('auth.forgot.intro')}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div>
                <label htmlFor="email" className="block text-sm text-gray-300">
                  {t('auth.emailAddress')}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-white placeholder:text-gray-600 focus:border-indigo-400/60 focus:outline-none"
                  placeholder={t('auth.emailPlaceholder')}
                />
              </div>

              {error && <p className="text-sm text-red-300">{error}</p>}

              <button type="submit" disabled={sending} className="btn-primary disabled:opacity-50">
                {sending ? t('auth.sending') : t('auth.forgot.submit')}
              </button>
            </form>

            <div className="mt-6 flex flex-col gap-2 text-sm">
              <Link
                href="/login"
                className="text-indigo-300 underline underline-offset-4 hover:text-white"
              >
                {t('auth.forgot.remembered')}
              </Link>
              <p className="text-gray-500">
                {t('auth.forgot.google')}
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
