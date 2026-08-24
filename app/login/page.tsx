'use client';

import { Suspense, useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth_init_failed: 'Could not start Google sign-in. Please try again.',
  oauth_failed: 'Google sign-in did not complete. Please try again.',
  missing_code: 'Google sign-in did not complete. Please try again.',
};

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Only same-site paths. Without this check, /login?returnTo=https://evil.com
  // turned this page into an open redirect that an attacker could use to make
  // a phishing link look like it came from us.
  const rawReturnTo = searchParams.get('returnTo');
  const returnTo =
    rawReturnTo && rawReturnTo.startsWith('/') && !rawReturnTo.startsWith('//')
      ? rawReturnTo
      : '/';

  // Surface errors from the server-side OAuth routes (e.g. /api/auth/google,
  // /api/auth/callback-exchange), which redirect back here with ?error=...
  // on failure since they can't show inline UI themselves.
  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) {
      setError(OAUTH_ERROR_MESSAGES[oauthError] || 'Sign-in failed. Please try again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await signIn(email, password);
      router.push(returnTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
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
    signInWithGoogle(returnTo).catch(() => setError('Google sign-in failed. Please try again.'));
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/bg-assess.webp')" }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Welcome Back</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {message && <p className="text-green-400 text-sm">{message}</p>}
            <button type="submit" className="btn-primary w-full">
              Login with Password
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-transparent text-gray-400" style={{ backgroundColor: 'rgba(17, 24, 39, 0.6)' }}>Or</span>
            </div>
          </div>

          <button
            onClick={handleMagicLink}
            disabled={loading}
            className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>

          <button
            onClick={handleGoogleSignIn}
            className="w-full p-3 mt-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-colors"
          >
            Sign in with Google
          </button>

          <p className="mt-6 text-center text-gray-300 text-sm">
            Don't have an account?{' '}
            <a href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-300">
        Loading...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}