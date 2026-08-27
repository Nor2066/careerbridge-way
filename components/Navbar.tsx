'use client';

import { useAuth } from '@/lib/AuthContext';
import { getSubscriptionStatus } from '@/lib/subscription-client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [inProgress, setInProgress] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!user) {
      setInProgress(false);
      return;
    }
    const fetchStatus = async () => {
      try {
        // Shared with whatever page component also wants this — see
        // lib/subscription-client.ts. The Navbar renders on every page, so
        // this used to double every page's request count on its own.
        const data = await getSubscriptionStatus();
        if (!data) return;
        if (isMounted) setInProgress(data.currentAttemptStatus === 'in_progress');
      } catch {
        // Non-critical — worst case the link just says "Full Assessment"
      }
    };
    fetchStatus();
    return () => { isMounted = false; };
  }, [user]);

  return (
    <nav className="bg-gray-900/70 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        <Link href="/" className="text-xl font-bold text-white">CareerBridge Way</Link>
        <div className="flex items-center gap-6">
          <Link href="/assess" className="text-gray-300 hover:text-white transition text-sm font-medium">
            {inProgress ? 'Continue Assessment' : 'Full Assessment'}
          </Link>
          {user ? (
            <>
              <Link href="/history" className="text-gray-300 hover:text-white transition text-sm font-medium">
                History
              </Link>
              {/* Was: the email address itself, linked to /account. Nobody
                  found it — a grey email in a navbar reads as a label, not a
                  control, and "delete my account" is not something anyone
                  should have to guess the location of. A word that says what
                  it does, styled like the other nav items. */}
              <Link
                href="/account"
                className="text-gray-300 hover:text-white transition text-sm font-medium"
              >
                Account
              </Link>
              {/* Kept, but demoted to what it always was: a reminder of who is
                  signed in. Hidden on narrow screens where the nav is tight. */}
              <span className="hidden lg:inline text-sm text-gray-500" title={user.email ?? ''}>
                {user.email}
              </span>
              <button onClick={() => signOut()} className="btn-secondary text-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-300 hover:text-white transition text-sm font-medium">
                Login
              </Link>
              <Link href="/signup" className="btn-primary text-sm py-2 px-4">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}