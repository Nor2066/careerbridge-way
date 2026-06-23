'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        return;
      }
      // Full navigation instead of router.push + router.refresh() —
      // ensures the auth cookie is fully set before the server component
      // runs its auth check, preventing the redirect loop.
      window.location.href = '/admin';
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-xl border border-gray-800 shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-6">Admin Login</h1>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-3 bg-gray-800 border border-gray-700 text-gray-200 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
        />
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-3 bg-gray-800 border border-gray-700 text-gray-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
        />
        {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </div>
  );
}