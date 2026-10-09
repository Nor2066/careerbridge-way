'use client';

import { Suspense, useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { MINIMUM_AGE } from '@/lib/legal';
import { useI18n } from '@/components/I18nProvider';
import type { MessageKey } from '@/lib/i18n/messages';

// Each code names a different failure, so the message can actually tell the
// person something useful — and so the code in the address bar says which
// branch of the callback failed.
const OAUTH_ERROR_MESSAGES: Record<string, MessageKey> = {
  oauth_init_failed: 'auth.oauth.init',
  oauth_provider: 'auth.oauth.provider',
  oauth_no_code: 'auth.oauth.incomplete',
  oauth_no_verifier: 'auth.oauth.cookie',
  oauth_exchange: 'auth.oauth.exchange',
  oauth_no_session: 'auth.oauth.session',
  // Kept so links from the previous build still show something sensible.
  oauth_failed: 'auth.oauth.incomplete',
  missing_code: 'auth.oauth.incomplete',
};

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const { t, locale } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Only same-site paths. Without this check, /login?returnTo=https://evil.com
  // turned this page into an open redirect that an attacker could use to make
  // a phishing link look like it came from us.
  const rawReturnTo = searchParams.get('returnTo');
  const returnTo =
    rawReturnTo && rawReturnTo.startsWith('/') && !rawReturnTo.startsWith('//')
      ? rawReturnTo
      : '/';

  // Surface errors from the server-side OAuth routes (e.g. /api/auth/google,
  // /api/auth/callback-exchange), which redirect back here with ?error=...
  // on failure since they can't show inline UI themselves.
  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) {
      setError(t(OAUTH_ERROR_MESSAGES[oauthError] ?? 'auth.login.failed'));
    }
  }, [searchParams, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await signIn(email, password);
      router.push(returnTo);
      router.refresh();
    } catch (err) {
      // The server words its errors in English. The common one has a
      // translation; anything else is shown as-is in English, or as a general
      // failure in other languages.
      const message = err instanceof Error ? err.message : '';
      setError(
        !message || message === 'Invalid email or password'
          ? t('auth.login.invalid')
          : locale === 'en' ? message : t('auth.login.failed')
      );
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError(t('auth.login.enterEmail')); return; }
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setMessage(t('auth.login.magicSent'));
      } else {
        const data = await res.json();
        setError(locale === 'en' && data.error ? data.error : t('auth.login.magicFailed'));
      }
    } catch {
      setError(t('common.error.network'));
    } finally {
      setLoading(false);
    }
  };

  // Guarded against firing twice. Each call to /api/auth/google mints a fresh
  // PKCE verifier and overwrites the cookie, so two clicks in quick succession
  // can leave the browser carrying attempt #2's verifier while Google was sent
  // attempt #1's challenge — and the exchange then fails on a mismatch.
  const handleGoogleSignIn = () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    setError('');
    // `true` because Google sign-in creates an account when there isn't one,
    // so this button is an account-creation route even on the login page, and
    // the wording it is recording sits directly beneath it. The signup form
    // uses a real tickbox; here a returning user should not be made to tick
    // something on every visit, so the notice carries it instead.
    signInWithGoogle(returnTo, true).catch(() => {
      setGoogleLoading(false);
      setError(t('auth.login.googleFailed'));
    });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/bg-assess.webp')" }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">{t('auth.login.title')}</h1>
          <p className="-mt-3 mb-5 text-center text-xs leading-relaxed text-indigo-200/80">{t('auth.university.hint')}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              id="email"
              name="email"
              placeholder={t('auth.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="password"
              id="password"
              name="password"
              placeholder={t('auth.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            {/* Sits directly under the password field, where someone who has
                just failed to remember it is already looking. */}
            <div className="flex flex-wrap justify-between gap-2 -mt-2">
              {/* Sign-in says "invalid email or password" for every failure,
                  including an unconfirmed address, so that it cannot be used
                  to test which emails are registered. This is the door out for
                  the person whose confirmation email never arrived. */}
              <a
                href="/resend-confirmation"
                className="text-sm text-gray-400 hover:text-gray-200"
              >
                {t('auth.login.noConfirmation')}
              </a>
              <a
                href="/forgot-password"
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                {t('auth.login.forgot')}
              </a>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {message && <p className="text-green-400 text-sm">{message}</p>}
            <button type="submit" className="btn-primary w-full">
              {t('auth.login.submit')}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-transparent text-gray-400" style={{ backgroundColor: 'rgba(17, 24, 39, 0.6)' }}>{t('auth.or')}</span>
            </div>
          </div>

          <button
            onClick={handleMagicLink}
            disabled={loading}
            className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? t('auth.sending') : t('auth.login.magic')}
          </button>

          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full p-3 mt-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {googleLoading ? t('auth.login.googleRedirecting') : t('auth.login.google')}
          </button>

          {/* Google sign-in creates an account if there isn't one, so this
              button can make the contract. The wording has to be next to it,
              not only on the signup page a new Google user never visits. */}
          <p className="mt-3 text-center text-xs leading-relaxed text-gray-400">
            {t('auth.login.googleNotice', { age: MINIMUM_AGE })}
            <a href="/terms" className="text-indigo-300 underline">{t('auth.login.terms')}</a>.
          </p>

          <p className="mt-6 text-center text-gray-300 text-sm">
            {t('auth.login.noAccount')}{' '}
            <a href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">{t('auth.login.signUp')}</a>
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-300">
      {t('common.loading')}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginForm />
    </Suspense>
  );
}