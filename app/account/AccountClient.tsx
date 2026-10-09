'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { MIN_PASSWORD_LENGTH } from '@/lib/password';
import { BRAND } from '@/lib/site';
import { useI18n } from '@/components/I18nProvider';
import { getSubscriptionStatus, type SubscriptionStatus } from '@/lib/subscription-client';

export default function AccountClient({
  email,
  emailVerified,
}: {
  email: string;
  emailVerified: boolean;
}) {
  const router = useRouter();
  const { t, locale } = useI18n();

  // Shown so a student knows exactly what their university can and cannot see.
  const [institution, setInstitution] = useState<SubscriptionStatus['institution']>(null);
  useEffect(() => {
    let mounted = true;
    getSubscriptionStatus().then((sub) => {
      if (mounted && sub?.institution) setInstitution(sub.institution);
    });
    return () => { mounted = false; };
  }, []);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordDone, setPasswordDone] = useState(false);

  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [typedEmail, setTypedEmail] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const emailMatches = typedEmail.trim().toLowerCase() === email.trim().toLowerCase();
  const passwordsMatch = newPassword === confirmPassword;
  const passwordLongEnough = newPassword.length >= MIN_PASSWORD_LENGTH;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    setPasswordError(null);
    setPasswordDone(false);

    try {
      const res = await fetchWithAuth('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setPasswordError(locale === 'en' && data.error ? data.error : t('account.password.failed'));
        return;
      }

      setPasswordDone(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setPasswordError(t('account.networkCheck'));
    } finally {
      setChangingPassword(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    setResendMessage(null);
    try {
      const res = await fetchWithAuth('/api/auth/resend-verification', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      setResendMessage(
        res.ok
          ? locale === 'en' && data.message ? data.message : t('account.confirm.sent')
          : locale === 'en' && data.error ? data.error : t('common.error.generic')
      );
    } catch {
      setResendMessage(t('account.networkCheck'));
    } finally {
      setResending(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const res = await fetchWithAuth('/api/account/export');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setExportError(locale === 'en' && data.error ? data.error : t('account.export.failed'));
        return;
      }

      // Turn the response into a file the browser saves, rather than sending
      // the user to a URL — this keeps the request authenticated by cookie and
      // avoids a second round trip.
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${BRAND.name.toLowerCase()}-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      setExportError(t('account.networkCheck'));
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
        setDeleteError(locale === 'en' && data.error ? data.error : t('account.delete.failed'));
        return;
      }

      // Full reload rather than router.push: the auth context is holding a
      // user that no longer exists, and a hard navigation is the simplest way
      // to be sure nothing stale survives.
      window.location.href = '/';
    } catch {
      setDeleteError(t('account.networkCheck'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-14">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-white">{t('account.title')}</h1>
        <p className="mt-2 text-gray-400">
          {t('account.signedInAs')}<span className="text-gray-200">{email}</span>
        </p>

        {/* ── University access ──────────────────────────────────────── */}
        {institution && (
          <section className="mt-8 rounded-xl border border-indigo-400/30 bg-indigo-400/5 p-6">
            <h2 className="text-lg font-semibold text-white">{t('account.university.title')}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-300">
              {t('account.university.body', { university: institution.name })}
            </p>
            <p className="mt-2 text-sm text-gray-400">
              {institution.active && institution.attemptsRemaining > 0
                ? t('account.university.attempts', { count: institution.attemptsRemaining, total: institution.attemptsPerStudent })
                : t('account.university.ended')}
            </p>
          </section>
        )}

        {/* ── Confirm email ──────────────────────────────────────────── */}
        {!emailVerified && (
          <section className="mt-8 rounded-xl border border-amber-400/30 bg-amber-400/5 p-6">
            <h2 className="text-lg font-semibold text-white">{t('account.confirm.title')}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-300">
              {t('account.confirm.body.before')}<span className="text-white">{email}</span>{t('account.confirm.body.after')}
            </p>
            <button
              onClick={handleResendVerification}
              disabled={resending}
              className="btn-secondary mt-4 text-sm disabled:opacity-50"
            >
              {resending ? t('auth.sending') : t('account.confirm.resend')}
            </button>
            {resendMessage && <p className="mt-3 text-sm text-gray-300">{resendMessage}</p>}
          </section>
        )}

        {/* ── Change password ────────────────────────────────────────── */}
        <section className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">{t('account.password.title')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-400">{t('auth.passwordHint', { min: MIN_PASSWORD_LENGTH })}</p>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            {t('account.password.signsOut')}
          </p>

          <form onSubmit={handleChangePassword} className="mt-4 flex flex-col gap-3">
            <input
              type="password"
              autoComplete="current-password"
              placeholder={t('account.password.current')}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-white placeholder:text-gray-600 focus:border-indigo-400/60 focus:outline-none"
            />
            <input
              type="password"
              autoComplete="new-password"
              placeholder={t('account.password.new')}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-white placeholder:text-gray-600 focus:border-indigo-400/60 focus:outline-none"
            />
            <input
              type="password"
              autoComplete="new-password"
              placeholder={t('account.password.again')}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-white placeholder:text-gray-600 focus:border-indigo-400/60 focus:outline-none"
            />

            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-xs text-red-300">{t('account.password.mismatch')}</p>
            )}
            {passwordError && <p className="text-sm text-red-300">{passwordError}</p>}
            {passwordDone && (
              <p className="text-sm text-emerald-300">
                {t('account.password.done')}
              </p>
            )}

            <button
              type="submit"
              disabled={changingPassword || !passwordsMatch || !passwordLongEnough}
              className="btn-secondary self-start text-sm disabled:opacity-50"
            >
              {changingPassword ? t('auth.saving') : t('account.password.submit')}
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-500">
            {t('account.password.google')}
          </p>
        </section>

        {/* ── Export ─────────────────────────────────────────────────── */}
        <section className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">{t('account.export.title')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-400">
            {t('account.export.body')}
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn-secondary mt-4 text-sm disabled:opacity-50"
          >
            {exporting ? t('account.export.preparing') : t('account.export.submit')}
          </button>
          {exportError && <p className="mt-3 text-sm text-red-300">{exportError}</p>}
        </section>

        {/* ── Delete ─────────────────────────────────────────────────── */}
        <section className="mt-6 rounded-xl border border-red-400/30 bg-red-500/5 p-6">
          <h2 className="text-lg font-semibold text-white">{t('account.delete.title')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-400">
            {t('account.delete.body')}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            {t('account.delete.records')}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-amber-200/80">
            {t('account.delete.refund.before')}<Link href="/refunds" className="underline">{t('account.delete.refund.link')}</Link>.
          </p>

          {!confirmOpen ? (
            <button
              onClick={() => setConfirmOpen(true)}
              className="mt-4 rounded-lg border border-red-400/50 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/10"
            >
              {t('account.delete.open')}
            </button>
          ) : (
            <div className="mt-5 border-t border-white/10 pt-5">
              <label htmlFor="confirm-email" className="block text-sm text-gray-300">
                {t('account.delete.type.before')}<span className="font-mono text-white">{email}</span>{t('account.delete.type.after')}
              </label>
              <input
                id="confirm-email"
                type="email"
                autoComplete="off"
                value={typedEmail}
                onChange={(e) => setTypedEmail(e.target.value)}
                placeholder={t('account.delete.placeholder')}
                className="mt-2 w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-white placeholder:text-gray-600 focus:border-red-400/60 focus:outline-none"
              />

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={handleDelete}
                  disabled={!emailMatches || deleting}
                  className="rounded-lg bg-red-500/80 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {deleting ? t('account.delete.deleting') : t('account.delete.confirm')}
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
                  {t('common.cancel')}
                </button>
              </div>

              {deleteError && <p className="mt-3 text-sm text-red-300">{deleteError}</p>}
            </div>
          )}
        </section>

        <p className="mt-8 text-sm text-gray-500">
          {t('account.questions.before')}
          <Link href="/privacy" className="text-indigo-300 underline">
            {t('account.questions.privacy')}
          </Link>
          {t('account.questions.after')}
        </p>

        <button
          onClick={() => router.push('/history')}
          className="mt-6 text-sm text-indigo-300 underline underline-offset-4 hover:text-white"
        >
          {t('account.back')}
        </button>
      </div>
    </main>
  );
}
