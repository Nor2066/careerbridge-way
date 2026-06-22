'use client';

import { Suspense, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await signIn(email, password);
      router.push(returnTo);
    } catch {
      setError('Invalid email or password');
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email address'); return; }
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setMessage('Check your email for the login link!');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send magic link');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signInWithGoogle().catch(() => setError('Google sign-in failed. Please try again.'));
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-20">
      <h1 className="text-2xl font-bold">Login</h1>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <input type="email" id="email" name="email" placeholder="Email"
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded" required />
        <input type="password" id="password" name="password" placeholder="Password"
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded" required />
        {error && <p className="text-red-500">{error}</p>}
        {message && <p className="text-green-600">{message}</p>}
        <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded">
          Login with Password
        </button>
      </form>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or</span>
        </div>
      </div>
      <button onClick={handleMagicLink} disabled={loading}
        className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
        {loading ? 'Sending...' : 'Send Magic Link'}
      </button>
      <button onClick={handleGoogleSignIn}
        className="w-full p-2 mt-2 bg-red-600 text-white rounded hover:bg-red-700">
        Sign in with Google
      </button>
      <p className="mt-4 text-center">
        Don't have an account? <a href="/signup" className="text-blue-600">Sign up</a>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto p-6 mt-20 text-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}