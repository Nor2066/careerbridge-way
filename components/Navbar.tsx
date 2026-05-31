'use client';

import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-gray-900/70 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        <Link href="/" className="text-xl font-bold text-white">CareerBridge Way</Link>
        <div className="flex items-center gap-6">
          <Link href="/assess" className="text-gray-300 hover:text-white transition text-sm font-medium">
            Full Assessment
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