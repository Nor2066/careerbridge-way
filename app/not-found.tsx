// app/not-found.tsx
//
// Without this, a mistyped URL renders the framework's bare default page —
// no navigation, no branding, and no way back except the browser button.
//
// The links matter more than the copy: someone who lands here is usually
// following a stale link to a report or a history page, so the useful thing
// is a route back to the two places they were probably trying to reach.

import Link from 'next/link';
import { getTranslator } from '@/lib/i18n/server';

export default async function NotFound() {
  const { t } = await getTranslator();
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-950 px-5 py-20 text-center">
      <p className="font-mono text-sm uppercase tracking-widest text-indigo-300">404</p>

      <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
        {t('notFound.title')}
      </h1>

      <p className="mt-4 max-w-md text-gray-400">
        {t('notFound.body')}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn-primary text-sm">
          {t('notFound.home')}
        </Link>
        <Link href="/assess" className="btn-secondary text-sm">
          {t('notFound.assess')}
        </Link>
      </div>

      <Link
        href="/history"
        className="mt-6 text-sm text-indigo-300 underline underline-offset-4 hover:text-white"
      >
        {t('notFound.history')}
      </Link>
    </main>
  );
}
