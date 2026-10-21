'use client';

// app/university/sample/SampleDashboard.tsx
//
// The university dashboard filled with invented numbers. Uses the same
// DashboardBody as the real page, so what a careers team sees here is exactly
// what they would get.

import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';
import type { SampleDashboard as SampleData } from '@/lib/institution-sample';
import { DashboardBody } from '../UniversityDashboard';

export default function SampleDashboard({ sample }: { sample: SampleData }) {
  const { t } = useI18n();
  const k = sample.summary.minGroupSize;

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12">
      <div className="mx-auto w-full max-w-4xl">
        <p className="text-xs uppercase tracking-widest text-indigo-300">{t('uni.sample.eyebrow')}</p>
        <h1 className="mt-1 text-3xl font-bold text-white">{t('uni.sample.name')}</h1>

        <p className="mt-4 rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm leading-relaxed text-amber-100">
          {t('uni.sample.banner', { k })}
        </p>
        <p className="mt-3 rounded-lg border border-indigo-400/30 bg-indigo-400/5 px-4 py-3 text-sm leading-relaxed text-indigo-100">
          {t('uni.privacy', { k })}
        </p>

        <DashboardBody
          data={{
            institution: { id: 'sample', name: t('uni.sample.name'), country: null },
            licence: sample.licence,
            domains: [t('uni.sample.domain')],
            summary: sample.summary,
            generatedAt: sample.generatedAt,
          }}
        />

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/sample-report" className="btn-secondary">
            {t('uni.sample.report')}
          </Link>
          <Link href="/" className="btn-secondary">
            {t('uni.sample.home')}
          </Link>
        </div>
      </div>
    </main>
  );
}
