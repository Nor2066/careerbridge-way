// app/auth/callback/page.tsx
//
// Handles the magic-link / email-confirmation flow, where Supabase returns the
// tokens in the URL fragment. Google OAuth does not come through here — it
// completes entirely server-side via /api/auth/callback-exchange.
//
// The fragment is only ever visible to client JavaScript, so this page reads
// it and immediately hands the tokens to /api/auth/set-session, which verifies
// them and stores the session in httpOnly cookies. The tokens are then wiped
// from the address bar so they don't linger in history or get leaked by a
// Referer header.
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const failOut = (message: string) => {
      if (cancelled) return;
      setError(message);
      setTimeout(() => { if (!cancelled) router.push('/login'); }, 2500);
    };

    const completeSignIn = async () => {
      try {
        const hash = typeof window !== 'undefined' ? window.location.hash : '';
        if (!hash) {
          failOut('This sign-in link is invalid or has expired. Please try again.');
          return;
        }

        const hashParams = new URLSearchParams(hash.substring(1));
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');

        if (!access_token || !refresh_token) {
          failOut('This sign-in link is invalid or has expired. Please try again.');
          return;
        }

        // Drop the tokens from the URL before doing anything else.
        window.history.replaceState(null, '', window.location.pathname);

        const res = await fetch('/api/auth/set-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ access_token, refresh_token }),
        });

        if (!res.ok) {
          failOut('This sign-in link is invalid or has expired. Please try again.');
          return;
        }

        if (cancelled) return;
        await refresh();
        router.push('/');
      } catch (err) {
        console.error('Auth callback error:', err);
        failOut('Something went wrong signing you in. Please try again.');
      }
    };

    completeSignIn();
    return () => { cancelled = true; };
  }, [router, refresh]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white px-4">
      <div className="text-center">
        <p className="text-lg">{error || 'Signing you in...'}</p>
      </div>
    </div>
  );
}
