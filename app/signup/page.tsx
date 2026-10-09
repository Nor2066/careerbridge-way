'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MINIMUM_AGE } from '@/lib/legal';
import { useI18n } from '@/components/I18nProvider';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  // The terms say an account is where the agreement is made, and that you
  // must be at least MINIMUM_AGE. Neither was ever asked, so both sentences
  // described something that did not happen. This is the box that makes them
  // true, and it gates BOTH routes into an account — the form below and the
  // Google button, which creates an account just as readily.
  const [accepted, setAccepted] = useState(false);
  // Set once the account exists but the address is unconfirmed. Keeps the
  // person on this page instead of bouncing them to a sign-in they cannot
  // complete yet.
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendNote, setResendNote] = useState('');
  const { signUp, signInWithGoogle } = useAuth();
  const { t, locale } = useI18n();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!accepted) {
      setError(t('auth.signup.acceptFirst', { age: MINIMUM_AGE }));
      return;
    }
    try {
      const { needsConfirmation } = await signUp(email, password, accepted);
      if (needsConfirmation) {
        // Deliberately no redirect to /login. Supabase refuses to sign in an
        // unconfirmed user, so sending them there would strand them on a form
        // that cannot work, with no way to ask for the email again.
        setAwaitingConfirmation(true);
      } else {
        // Email confirmation is off — Supabase signed them straight in.
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      // Server errors are worded in English; other languages get the general
      // message rather than a sentence in the wrong language.
      setError(locale === 'en' && err instanceof Error ? err.message : t('auth.signup.failed'));
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendNote('');
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      setResendNote(
        res.ok
          ? locale === 'en' && data.message ? data.message : t('auth.resend.sent')
          : locale === 'en' && data.error ? data.error : t('common.error.generic')
      );
    } catch {
      setResendNote(t('auth.networkCheck'));
    } finally {
      setResending(false);
    }
  };

  // Guarded against firing twice — see the matching note on the login page.
  const handleGoogleSignUp = async () => {
    if (googleLoading) return;
    // Same gate as the form. Google sign-up creates an account outright, so
    // letting it through unticked would leave the one route into the product
    // that never showed anyone the terms.
    if (!accepted) {
      setError(t('auth.signup.acceptFirst', { age: MINIMUM_AGE }));
      return;
    }
    setGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle(undefined, accepted);
    } catch {
      setGoogleLoading(false);
      setError(t('auth.signup.googleFailed'));
    }
  };

  return (
    <div className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4"
         style={{ backgroundImage: "url('/images/bg-assess.jpg')" }}>
      <div className="absolute inset-0 bg-black/30 z-0" />
      <div className="relative z-10 max-w-md w-full glass-card">
        {awaitingConfirmation ? (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-white text-center">{t('auth.signup.checkEmail')}</h1>
            <p className="text-gray-200 text-sm leading-relaxed">
              {t('auth.signup.sentTo.before')}<span className="text-white">{email}</span>{t('auth.signup.sentTo.after')}
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('auth.signup.spam')}
            </p>

            <button
              onClick={handleResend}
              disabled={resending}
              className="btn-secondary w-full text-sm disabled:opacity-50"
            >
              {resending ? t('auth.sending') : t('auth.signup.resend')}
            </button>

            {resendNote && <p className="text-gray-300 text-sm">{resendNote}</p>}

            <p className="text-gray-400 text-sm text-center">
              {t('auth.signup.wrongAddress')}{' '}
              <button
                onClick={() => {
                  setAwaitingConfirmation(false);
                  setResendNote('');
                }}
                className="text-indigo-400 hover:text-indigo-300 underline"
              >
                {t('auth.signup.startAgain')}
              </button>
            </p>
          </div>
        ) : (
        <>
        <h1 className="text-2xl font-bold text-white text-center mb-3">{t('auth.signup.title')}</h1>
        <p className="mb-5 text-center text-xs leading-relaxed text-indigo-200/80">{t('auth.university.hint')}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder={t('auth.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="password"
            placeholder={t('auth.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          {/* Ticking this is the moment the contract is made, so it is a real
              checkbox rather than a line of small print under the button.
              The privacy policy is deliberately NOT something you "agree" to
              here — it is a notice about what we do, not a consent, and
              bundling it into one tickbox would misdescribe both. */}
          <div className="flex items-start gap-3 rounded-lg border border-white/15 bg-white/5 p-3">
            <input
              id="accept-terms"
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-indigo-500"
            />
            <label htmlFor="accept-terms" className="text-sm leading-relaxed text-gray-200">
              {t('auth.signup.ageTerms.before', { age: MINIMUM_AGE })}
              <Link href="/terms" target="_blank" className="text-indigo-300 underline">
                {t('auth.signup.terms')}
              </Link>
              {t('auth.signup.ageTerms.and')}
              <Link href="/acceptable-use" target="_blank" className="text-indigo-300 underline">
                {t('auth.signup.aup')}
              </Link>
              .
            </label>
          </div>

          <p className="text-xs leading-relaxed text-gray-400">
            {t('auth.signup.ai.before')}
            <Link href="/ai-notice" target="_blank" className="text-indigo-300 underline">
              {t('auth.signup.ai.notice')}
            </Link>
            {t('auth.signup.ai.middle')}
            <Link href="/privacy" target="_blank" className="text-indigo-300 underline">
              {t('auth.signup.privacy')}
            </Link>
            .
          </p>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {message && <p className="text-green-400 text-sm">{message}</p>}
          <button
            type="submit"
            disabled={!accepted}
            className="w-full btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('auth.signup.submit')}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-500"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-transparent text-gray-300">{t('auth.or')}</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignUp}
          disabled={googleLoading || !accepted}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {googleLoading ? t('auth.login.googleRedirecting') : t('auth.signup.google')}
        </button>

        <p className="mt-4 text-center text-gray-300">
          {t('auth.signup.haveAccount')}{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
            {t('auth.signup.login')}
          </Link>
        </p>
        </>
        )}
      </div>
    </div>
  );
}