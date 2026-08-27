'use client';

// A way out of a trap that only appears once "Confirm email" is switched on.
//
// Supabase refuses to sign in an unconfirmed user. Our sign-in route answers
// "Invalid email or password" for every failure, deliberately, so the form
// cannot be used to discover which addresses have accounts — which means an
// unconfirmed person is told their password is wrong and has no idea the real
// problem is an email sitting in their spam folder.
//
// Rather than weaken that message, there is simply a door here. It says the
// same thing whatever the address turns out to be, so it leaks nothing either.

import { useState } from 'react';
import Link from 'next/link';

export default function ResendConfirmationPage() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setNote('');
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      setNote(data.message ?? data.error ?? 'Something went wrong. Please try again.');
    } catch {
      setNote('Network error. Please check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-slate-950 px-5 py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-white">Resend your confirmation email</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-gray-400">
          If you signed up but never confirmed your address, you will not be able to sign in
          yet. Enter your email and we will send the link again.
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
              placeholder="you@example.com"
              className="mt-2 w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-white placeholder:text-gray-600 focus:border-indigo-400/60 focus:outline-none"
            />
          </div>

          <button type="submit" disabled={sending} className="btn-primary disabled:opacity-50">
            {sending ? 'Sending…' : 'Send the link again'}
          </button>
        </form>

        {note && <p className="mt-4 text-sm text-gray-300">{note}</p>}

        <div className="mt-6 flex flex-col gap-2 text-sm">
          <Link
            href="/login"
            className="text-indigo-300 underline underline-offset-4 hover:text-white"
          >
            Back to sign in
          </Link>
          <Link
            href="/forgot-password"
            className="text-indigo-300 underline underline-offset-4 hover:text-white"
          >
            Forgot your password instead?
          </Link>
        </div>
      </div>
    </main>
  );
}
