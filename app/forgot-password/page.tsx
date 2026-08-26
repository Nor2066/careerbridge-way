'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');

    try {
      const res = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSent(true);
      } else {
        setError(data.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-slate-950 px-5 py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-white">Reset your password</h1>

        {sent ? (
          // Deliberately does not say whether the address had an account —
          // that would turn this form into a way to test which emails are
          // registered. Same wording either way.
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6">
            <p className="text-[15px] leading-relaxed text-gray-300">
              If there is an account for <span className="text-white">{email}</span>, a reset
              link is on its way. It expires in one hour.
            </p>
            <p className="mt-3 text-sm text-gray-500">
              Nothing arriving? Check your spam folder, and make sure you typed the address you
              signed up with.
            </p>
            <Link
              href="/login"
              className="mt-5 inline-block text-sm text-indigo-300 underline underline-offset-4 hover:text-white"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-2 text-[15px] leading-relaxed text-gray-400">
              Enter the address you signed up with and we will send you a link to choose a new
              one.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div>
                <label htmlFor="email" className="block text-sm text-gray-300">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-white placeholder:text-gray-600 focus:border-indigo-400/60 focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>

              {error && <p className="text-sm text-red-300">{error}</p>}

              <button type="submit" disabled={sending} className="btn-primary disabled:opacity-50">
                {sending ? 'Sending…' : 'Send reset link'}
              </button>
            </form>

            <div className="mt-6 flex flex-col gap-2 text-sm">
              <Link
                href="/login"
                className="text-indigo-300 underline underline-offset-4 hover:text-white"
              >
                I remembered it — back to sign in
              </Link>
              <p className="text-gray-500">
                Signed up with Google? You do not have a password here — use the Google button on
                the sign-in page.
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
