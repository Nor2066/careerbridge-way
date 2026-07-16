'use client';

import { useAuth } from '@/lib/AuthContext';
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
        const res = await fetch('/api/subscription-status', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
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
              <span className="text-sm text-gray-400">{user.email}</span>
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