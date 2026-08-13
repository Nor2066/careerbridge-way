// app/auth/callback/page.tsx
// Replaces app/auth/callback/route.ts — delete that file, since a route.ts
// and page.tsx cannot coexist at the same path in Next.js.
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// After establishing a session client-side, hand the tokens to a server
// endpoint that re-writes them as httpOnly cookies. This closes the brief
// window where the session cookie was only readable by client-side JS
// (an unavoidable consequence of completing auth in the browser) back down
// to essentially nothing.
async function hardenSession(access_token: string, refresh_token: string) {
  try {
    await fetch('/api/auth/sync-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ access_token, refresh_token }),
    });
  } catch (err) {
    // Non-critical — the client-side session still works even if this
    // hardening step fails; don't block sign-in on it.
    console.warn('Session hardening failed (non-critical):', err);
  }
}

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const completeSignIn = async () => {
      try {
        const code = searchParams.get('code');

        // ── Google OAuth (PKCE) ─────────────────────────────────────────
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;

          if (data.session) {
            await hardenSession(data.session.access_token, data.session.refresh_token);
          }
          router.push('/');
          return;
        }

        // ── Magic link (hash-fragment style) ────────────────────────────
        if (typeof window !== 'undefined' && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const access_token = hashParams.get('access_token');
          const refresh_token = hashParams.get('refresh_token');

          if (access_token && refresh_token) {
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            if (setSessionError) throw setSessionError;

            await hardenSession(access_token, refresh_token);
            router.push('/');
            return;
          }
        }

        setError('This sign-in link is invalid or has expired. Please try again.');
        setTimeout(() => router.push('/login'), 2500);
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('Something went wrong signing you in. Please try again.');
        setTimeout(() => router.push('/login'), 2500);
      }
    };

    completeSignIn();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white px-4">
      <div className="text-center">
        <p className="text-lg">{error || 'Signing you in...'}</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-300">
        Loading...
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}