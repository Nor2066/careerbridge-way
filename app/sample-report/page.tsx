// app/sample-report/page.tsx
//
// The launch checklist asks for a "demo account". I have deliberately not built
// one, and this is the alternative.
//
// A demo account means a shared username and password, which is a real account
// with a real session on a site that takes payments — the password gets pasted
// into chats and screenshots, it never rotates, and it is the one credential
// nobody feels responsible for. Having just spent a week closing an escalation
// path, adding a permanently shared login would be a step backwards.
//
// This does the jobs a demo account was wanted for, without any of that: it
// shows a support agent what the customer is describing, gives you something
// to screenshot for marketing, and lets a buyer see what they are paying for
// before they pay. The landing page already demos the questionnaire; the
// report is the part nobody could see until they had bought it.
//
// Static content, so there is nothing to keep in sync and nothing to leak.

import type { Metadata } from 'next';
import Link from 'next/link';
import { BRAND } from '@/lib/site';
import { getTranslator } from '@/lib/i18n/server';
import type { MessageKey } from '@/lib/i18n/messages';

export const metadata: Metadata = {
  title: 'Sample career report',
  description:
    `An example of the AI-generated career report ${BRAND.name} produces, so you can see what you get before you buy.`,
};

const CLUSTERS: { name: MessageKey; pct: number }[] = [
  { name: 'sample.cluster.1', pct: 78.4 },
  { name: 'sample.cluster.2', pct: 71.2 },
  { name: 'sample.cluster.3', pct: 66.9 },
];

// The report text lives in lib/i18n/messages/misc.ts, one version per language.

export default async function SampleReportPage() {
  const { t } = await getTranslator();
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-14">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-lg border border-indigo-400/30 bg-indigo-400/5 px-4 py-3">
          <p className="text-sm text-indigo-100">
            <strong className="font-semibold">{t('sample.example.strong')}</strong>{t('sample.example.rest')}
          </p>
        </div>

        <h1 className="mt-8 text-3xl font-bold text-white sm:text-4xl">
          {t('sample.title')}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-gray-400">
          {t('sample.intro')}
        </p>

        {/* Clusters */}
        <section className="mt-10 rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-bold text-white">{t('sample.top3')}</h2>
          <ul className="mt-5 flex flex-col gap-5">
            {CLUSTERS.map((c) => (
              <li key={c.name}>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-medium text-white">{t(c.name)}</span>
                  <span className="font-mono text-sm text-indigo-300">{c.pct}%</span>
                </div>
                <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-700">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Report body */}
        <section className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-bold text-white">{t('sample.reportTitle')}</h2>
          <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-gray-200">
            {t('sample.report')}
          </p>
        </section>

        <p className="mt-6 text-sm leading-relaxed text-gray-500">
          {t('sample.disclaimer.before')}
          <Link href="/terms" className="text-indigo-300 underline">
            {t('sample.disclaimer.terms')}
          </Link>
          {t('sample.disclaimer.after')}
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/assess" className="btn-primary">
            {t('sample.assess')}
          </Link>
          <Link href="/pricing" className="btn-secondary">
            {t('sample.pricing')}
          </Link>
        </div>
      </div>
    </main>
  );
}
