// app/auth/callback/page.tsx
//
// Where every email link lands. Google OAuth does not come through here — it
// completes entirely server-side via /api/auth/callback-exchange.
//
// Our email templates (lib/auth-email-templates.ts) send ?token_hash=&type=.
// Nothing happens until the student presses the button: mail scanners open
// links on arrival, and must not spend the token. See /api/auth/verify-link.
//
// Links sent before those templates bring the session in the URL fragment.
// The fragment is only ever visible to client JavaScript, so this page reads
// it and immediately hands the tokens to /api/auth/set-session, which verifies
// them and stores the session in httpOnly cookies. The tokens are then wiped
// from the address bar so they don't linger in history or get leaked by a
// Referer header.
'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/components/I18nProvider';
import type { MessageKey } from '@/lib/i18n/messages';
import { isLocale } from '@/lib/i18n/config';

type LinkType = 'signup' | 'magiclink' | 'recovery';

const LINK_TEXT: Record<LinkType, { title: MessageKey; body: MessageKey; button: MessageKey }> = {
  signup: { title: 'auth.link.signup.title', body: 'auth.link.signup.body', button: 'auth.link.signup.button' },
  magiclink: { title: 'auth.link.magiclink.title', body: 'auth.link.magiclink.body', button: 'auth.link.magiclink.button' },
  recovery: { title: 'auth.link.recovery.title', body: 'auth.link.recovery.body', button: 'auth.link.recovery.button' },
};

/** The token from one of our email templates, if this is such a link. */
function parseTokenLink(search: string): { tokenHash: string; type: LinkType } | null {
  const params = new URLSearchParams(search);
  const tokenHash = params.get('token_hash');
  const type = params.get('type');
  if (!tokenHash || !type || !(type in LINK_TEXT)) return null;
  return { tokenHash, type: type as LinkType };
}

const noSubscribe = () => () => {};

export default function AuthCallbackPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const { t, locale, setLocale } = useI18n();
  // A code rather than a sentence, so the effect below does not depend on
  // the language and the message follows the switcher at render.
  const [error, setError] = useState<'' | 'invalid' | 'failed' | 'confirmed'>('');
  // The address as the browser sees it. The server has no address to read and
  // renders the plain "signing in" text; React switches over after hydrating.
  const search = useSyncExternalStore(noSubscribe, () => window.location.search, () => '');
  const tokenLink = useMemo(() => parseTokenLink(search), [search]);
  const [verifying, setVerifying] = useState(false);

  const redeem = async () => {
    if (!tokenLink) return;
    setVerifying(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token_hash: tokenLink.tokenHash, type: tokenLink.type }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(res.status === 401 || res.status === 400 ? 'invalid' : 'failed');
        setVerifying(false);
        return;
      }
      // The token is spent; keep it out of history.
      window.history.replaceState(null, '', window.location.pathname);
      await refresh();
      router.push(typeof data.next === 'string' ? data.next : '/');
    } catch {
      setError('failed');
      setVerifying(false);
    }
  };

  useEffect(() => {
    // Our own links wait for the button; see redeem above.
    if (parseTokenLink(window.location.search)) return;

    let cancelled = false;

    const failOut = (message: 'invalid' | 'failed') => {
      if (cancelled) return;
      setError(message);
      setTimeout(() => { if (!cancelled) router.push('/login'); }, 2500);
    };

    const completeSignIn = async () => {
      try {
        const hash = typeof window !== 'undefined' ? window.location.hash : '';
        if (!hash) {
          // A PKCE link (?code=...) rather than a session in the fragment.
          // Sign-up sent these from August to October 2026, so some are still
          // in inboxes. By the time the browser gets here Supabase has already
          // confirmed the address, so say that and offer sign-in, instead of
          // "invalid link". Nothing to exchange: the code needs a verifier
          // cookie that only lived ten minutes, in the browser that signed up.
          if (new URLSearchParams(window.location.search).get('code')) {
            if (!cancelled) setError('confirmed');
            return;
          }
          failOut('invalid');
          return;
        }

        const hashParams = new URLSearchParams(hash.substring(1));
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');
        // 'recovery' means this link came from "forgot password". It travels
        // to the server, which turns it into an httpOnly marker; the value
        // here is only used to decide where to send the browser next.
        const linkType = hashParams.get('type');

        if (!access_token || !refresh_token) {
          failOut('invalid');
          return;
        }

        // Drop the tokens from the URL before doing anything else.
        window.history.replaceState(null, '', window.location.pathname);

        const res = await fetch('/api/auth/set-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ access_token, refresh_token, type: linkType }),
        });

        if (!res.ok) {
          failOut('invalid');
          return;
        }

        if (cancelled) return;
        await refresh();
        // Someone arriving from a recovery link is here to choose a new
        // password, not to browse. Dropping them on the homepage signed in
        // leaves the thing they came to do undone.
        router.push(linkType === 'recovery' ? '/reset-password' : '/');
      } catch (err) {
        console.error('Auth callback error:', err);
        failOut('failed');
      }
    };

    completeSignIn();
    return () => { cancelled = true; };
  }, [router, refresh]);

  // Open in the email's language, once. It also becomes the language
  // verify-link stores for later emails, which should be the one the student
  // chose, not whatever this browser was last set to.
  const langApplied = useRef(false);
  useEffect(() => {
    if (!tokenLink || langApplied.current) return;
    langApplied.current = true;
    const lang = new URLSearchParams(window.location.search).get('lang');
    if (isLocale(lang) && lang !== locale) setLocale(lang);
  }, [tokenLink, locale, setLocale]);

  if (tokenLink) {
    const text = LINK_TEXT[tokenLink.type];
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white px-4">
        <div className="glass-card w-full max-w-md text-center">
          <h1 className="text-2xl font-bold">{t(text.title)}</h1>
          <p className="mt-3 text-gray-300">{t(text.body)}</p>
          {error ? (
            <>
              <p role="alert" className="mt-6 text-amber-200">
                {t(error === 'invalid' ? 'auth.callback.invalid' : 'auth.callback.failed')}
              </p>
              <Link
                href={tokenLink.type === 'recovery' ? '/forgot-password' : '/login'}
                className="btn-primary mt-6 inline-block"
              >
                {t(tokenLink.type === 'recovery' ? 'auth.link.newReset' : 'auth.callback.signIn')}
              </Link>
            </>
          ) : (
            <button onClick={redeem} disabled={verifying} className="btn-primary mt-6 w-full disabled:opacity-60">
              {verifying ? t('common.pleaseWait') : t(text.button)}
            </button>
          )}
          <p className="mt-5 text-xs leading-relaxed text-gray-500">{t('auth.link.why')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white px-4">
      <div className="text-center">
        <p className="text-lg">
          {error === 'invalid'
            ? t('auth.callback.invalid')
            : error === 'failed'
              ? t('auth.callback.failed')
              : error === 'confirmed'
                ? t('auth.callback.confirmed')
                : t('auth.callback.signingIn')}
        </p>
        {error === 'confirmed' && (
          <Link href="/login" className="btn-primary mt-6 inline-block">
            {t('auth.callback.signIn')}
          </Link>
        )}
      </div>
    </div>
  );
}
