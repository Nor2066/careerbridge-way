'use client';

import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">CareerBridge Way</Link>
        <div className="space-x-4">
          {user ? (
            <>
              <span>{user.email}</span>
              <button onClick={() => signOut()} className="bg-red-600 px-3 py-1 rounded">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">Login</Link>
              <Link href="/signup" className="hover:underline">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}