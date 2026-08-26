'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export default function AccountClient({ email }: { email: string }) {
  const router = useRouter();

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [typedEmail, setTypedEmail] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const emailMatches = typedEmail.trim().toLowerCase() === email.trim().toLowerCase();

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const res = await fetchWithAuth('/api/account/export');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setExportError(data.error ?? 'We could not build your export. Please try again.');
        return;
      }

      // Turn the response into a file the browser saves, rather than sending
      // the user to a URL — this keeps the request authenticated by cookie and
      // avoids a second round trip.
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `careerbridge-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      setExportError('Network error. Please check your connection and try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetchWithAuth('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmEmail: typedEmail }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setDeleteError(data.error ?? 'We could not delete your account. Please try again.');
        return;
      }

      // Full reload rather than router.push: the auth context is holding a
      // user that no longer exists, and a hard navigation is the simplest way
      // to be sure nothing stale survives.
      window.location.href = '/';
    } catch {
      setDeleteError('Network error. Please check your connection and try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-14">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-white">Your account</h1>
        <p className="mt-2 text-gray-400">
          Signed in as <span className="text-gray-200">{email}</span>
        </p>

        {/* ── Export ─────────────────────────────────────────────────── */}
        <section className="mt-10 rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Download your data</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-400">
            A JSON file containing your account details, every assessment you have taken,
            every report we generated, and your purchase history. This is your right under
            UK GDPR &mdash; you do not have to give a reason and we do not ask for one.
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn-secondary mt-4 text-sm disabled:opacity-50"
          >
            {exporting ? 'Preparing your file…' : 'Download my data'}
          </button>
          {exportError && <p className="mt-3 text-sm text-red-300">{exportError}</p>}
        </section>

        {/* ── Delete ─────────────────────────────────────────────────── */}
        <section className="mt-6 rounded-xl border border-red-400/30 bg-red-500/5 p-6">
          <h2 className="text-lg font-semibold text-white">Delete your account</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-400">
            This removes your profile, every assessment answer, every report, and your saved
            progress. It happens immediately and it cannot be undone.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            We keep a record of your purchases with your name and email removed, because UK
            tax law requires us to keep sales records for six years.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-amber-200/80">
            Any attempts you have paid for and not used will be lost. If you want a refund
            for them, ask us <Link href="/refunds" className="underline">first</Link>.
          </p>

          {!confirmOpen ? (
            <button
              onClick={() => setConfirmOpen(true)}
              className="mt-4 rounded-lg border border-red-400/50 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/10"
            >
              Delete my account
            </button>
          ) : (
            <div className="mt-5 border-t border-white/10 pt-5">
              <label htmlFor="confirm-email" className="block text-sm text-gray-300">
                Type <span className="font-mono text-white">{email}</span> to confirm.
              </label>
              <input
                id="confirm-email"
                type="email"
                autoComplete="off"
                value={typedEmail}
                onChange={(e) => setTypedEmail(e.target.value)}
                placeholder="your email address"
                className="mt-2 w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-white placeholder:text-gray-600 focus:border-red-400/60 focus:outline-none"
              />

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={handleDelete}
                  disabled={!emailMatches || deleting}
                  className="rounded-lg bg-red-500/80 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {deleting ? 'Deleting…' : 'Permanently delete my account'}
                </button>
                <button
                  onClick={() => {
                    setConfirmOpen(false);
                    setTypedEmail('');
                    setDeleteError(null);
                  }}
                  disabled={deleting}
                  className="rounded-lg border border-white/15 px-4 py-2 text-sm text-gray-300 transition hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>

              {deleteError && <p className="mt-3 text-sm text-red-300">{deleteError}</p>}
            </div>
          )}
        </section>

        <p className="mt-8 text-sm text-gray-500">
          Questions about your data? Read the{' '}
          <Link href="/privacy" className="text-indigo-300 underline">
            Privacy Policy
          </Link>{' '}
          or email us &mdash; the address is in the footer.
        </p>

        <button
          onClick={() => router.push('/history')}
          className="mt-6 text-sm text-indigo-300 underline underline-offset-4 hover:text-white"
        >
          &larr; Back to your history
        </button>
      </div>
    </main>
  );
}
