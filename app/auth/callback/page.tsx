// app/auth/callback/page.tsx
// Now only handles the magic-link hash-fragment flow. Google OAuth no
// longer routes through here at all — it completes entirely server-side
// via /api/auth/callback-exchange, since only a server can read the
// httpOnly PKCE verifier cookie set by /api/auth/google.
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

async function hardenSession(access_token: string, refresh_token: string) {
  try {
    await fetch('/api/auth/sync-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ access_token, refresh_token }),
    });
  } catch (err) {
    console.warn('Session hardening failed (non-critical):', err);
  }
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    // Cancellation guard — prevents a stale error/timeout from an earlier
    // failed attempt firing after a later successful one already
    // navigated away, which was causing "logged in but bounced back to
    // login with an error" on repeat sign-in attempts.
    let cancelled = false;

    const completeSignIn = async () => {
      try {
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
            if (cancelled) return;

            await hardenSession(access_token, refresh_token);
            if (cancelled) return;
            router.push('/');
            return;
          }
        }

        if (!cancelled) {
          setError('This sign-in link is invalid or has expired. Please try again.');
          setTimeout(() => { if (!cancelled) router.push('/login'); }, 2500);
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        if (!cancelled) {
          setError('Something went wrong signing you in. Please try again.');
          setTimeout(() => { if (!cancelled) router.push('/login'); }, 2500);
        }
      }
    };

    completeSignIn();
    return () => { cancelled = true; };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white px-4">
      <div className="text-center">
        <p className="text-lg">{error || 'Signing you in...'}</p>
      </div>
    </div>
  );
}