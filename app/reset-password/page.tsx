'use client';

// Where a recovery link lands, after /auth/callback has turned the tokens in
// the URL fragment into an httpOnly session and a short-lived recovery marker.
//
// The marker is what lets this page set a password without asking for the old
// one. It is set server-side and expires in fifteen minutes, so if someone
// leaves this tab open and comes back tomorrow they are told to start again
// rather than being silently refused.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MIN_PASSWORD_LENGTH } from '@/lib/password';
import { useI18n } from '@/components/I18nProvider';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;
  const tooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError(t('auth.reset.mismatch'));
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        // No currentPassword: forgetting it is why we are here. The server
        // accepts that only because of the recovery marker cookie.
        body: JSON.stringify({ newPassword: password }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setDone(true);
        setTimeout(() => router.push('/'), 2000);
        return;
      }

      if (data.code === 'CURRENT_PASSWORD_REQUIRED') {
        setError(
          t('auth.reset.expired')
        );
        return;
      }

      setError(locale === 'en' && data.error ? data.error : t('auth.reset.failed'));
    } catch {
      setError(t('auth.networkCheck'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-slate-950 px-5 py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-white">{t('auth.reset.title')}</h1>

        {done ? (
          <div className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-6">
            <p className="text-[15px] text-gray-200">
              {t('auth.reset.done')}
            </p>
          </div>
        ) : (
          <>
            <p className="mt-2 text-[15px] leading-relaxed text-gray-400">{t('auth.passwordHint', { min: MIN_PASSWORD_LENGTH })}</p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div>
                <label htmlFor="password" className="block text-sm text-gray-300">
                  {t('auth.reset.new')}
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-white focus:border-indigo-400/60 focus:outline-none"
                />
                {tooShort && (
                  <p className="mt-1 text-xs text-amber-300/80">
                    {t('auth.reset.toGo', { count: MIN_PASSWORD_LENGTH - password.length })}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirm" className="block text-sm text-gray-300">
                  {t('auth.reset.again')}
                </label>
                <input
                  id="confirm"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-white focus:border-indigo-400/60 focus:outline-none"
                />
                {mismatch && (
                  <p className="mt-1 text-xs text-red-300">{t('auth.reset.mismatchLive')}</p>
                )}
              </div>

              {error && <p className="text-sm text-red-300">{error}</p>}

              <button
                type="submit"
                disabled={saving || mismatch || password.length < MIN_PASSWORD_LENGTH}
                className="btn-primary disabled:opacity-50"
              >
                {saving ? t('auth.saving') : t('auth.reset.submit')}
              </button>
            </form>

            <Link
              href="/forgot-password"
              className="mt-6 inline-block text-sm text-indigo-300 underline underline-offset-4 hover:text-white"
            >
              {t('auth.reset.newLink')}
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
