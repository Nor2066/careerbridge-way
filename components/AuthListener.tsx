'use client';

// components/AuthListener.tsx
//
// Bounces the admin area back to the login page once the session is gone.
//
// This used to hang off the browser SDK's onAuthStateChange, which no longer
// sees anything: the session is an httpOnly cookie the SDK can't read. It now
// asks the server instead, when the tab regains focus and on a slow poll, so
// an admin whose session was revoked doesn't sit on a dead dashboard.

import { useEffect } from 'react';

const POLL_INTERVAL_MS = 60_000;

export default function AuthListener() {
  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && !data.user) {
          window.location.href = '/admin/login';
        }
      } catch {
        // Offline or a transient failure — don't sign anyone out over it.
      }
    };

    const onFocus = () => { void check(); };
    window.addEventListener('focus', onFocus);
    const timer = setInterval(check, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      clearInterval(timer);
    };
  }, []);

  return null;
}
