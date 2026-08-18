// app/auth/callback/page.tsx
// Handles the magic-link hash-fragment flow. Google OAuth no longer
// routes through here at all — it completes entirely server-side via
// /api/auth/callback-exchange.
//
// This page uses supabase.auth.setSession() via the BROWSER client,
// which writes a normal, client-readable session cookie — exactly what
// AuthContext and the rest of the app expect. There is intentionally no
// "harden to httpOnly" step afterward anymore: that upgrade broke the
// client's ability to ever see its own session again on the next page
// load, since httpOnly cookies are invisible to JavaScript by design.
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
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