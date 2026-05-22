'use client';

import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          CareerBridge Way
        </Link>
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <span className="text-sm text-gray-300">{user.email}</span>
              <button 
                onClick={() => signOut()} 
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors font-medium"
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
