// app/auth/callback/page.tsx
// Replaces the old app/auth/callback/route.ts — delete that file, since a
// route.ts and page.tsx cannot coexist at the same path in Next.js.
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const completeSignIn = async () => {
      try {
        const code = searchParams.get('code');

        // ── Google OAuth (and PKCE-style magic links) ──────────────────
        // Google's flow delivers a ?code= query param, which this client
        // page can read directly from searchParams.
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          router.push('/');
          return;
        }

        // ── Magic link (hash-fragment style) ────────────────────────────
        // Supabase's email magic link delivers the session as
        // #access_token=...&refresh_token=... in the URL fragment. Only
        // the browser can ever see this — a server route redirect happens
        // before any client JS runs, so the fragment is silently lost.
        // This is why the callback must be a page, not a route handler.
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