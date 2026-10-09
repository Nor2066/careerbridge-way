'use client';

// app/university/UniversityDashboard.tsx
//
// Totals for one university's students. Everything shown comes from
// /api/university/summary, which already withholds any group too small to
// be anonymous — this component only lays it out.

import { useEffect, useState } from 'react';
import { useI18n } from '@/components/I18nProvider';
import { INTL_LOCALE } from '@/lib/i18n/config';
import type { InstitutionSummary } from '@/lib/institution-rules';

type SummaryResponse = {
  institution: { id: string; name: string; country: string | null };
  licence: {
    start: string;
    end: string;
    status: 'active' | 'paused' | 'not_started' | 'expired';
    attemptsPerStudent: number;
    followupIncluded: boolean;
  } | null;
  domains: string[];
  summary: InstitutionSummary;
  generatedAt: string;
};

const STATUS_KEYS = {
  active: 'uni.licence.status.active',
  paused: 'uni.licence.status.paused',
  not_started: 'uni.licence.status.not_started',
  expired: 'uni.licence.status.expired',
} as const;

const STATUS_STYLE: Record<keyof typeof STATUS_KEYS, string> = {
  active: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
  paused: 'border-gray-400/40 bg-gray-400/10 text-gray-300',
  not_started: 'border-sky-400/40 bg-sky-400/10 text-sky-200',
  expired: 'border-amber-400/40 bg-amber-400/10 text-amber-200',
};

/** The summary for one university, or null if it could not be loaded. */
async function fetchSummary(institutionId: string): Promise<SummaryResponse | null> {
  try {
    const res = await fetch(`/api/university/summary?institutionId=${encodeURIComponent(institutionId)}`, {
      credentials: 'include',
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    return (await res.json()) as SummaryResponse;
  } catch (err) {
    console.error('University dashboard load failed:', err);
    return null;
  }
}

function Stat({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{value}</p>
      {note && <p className="mt-1 text-xs text-gray-500">{note}</p>}
    </div>
  );
}

export default function UniversityDashboard({ institutions }: { institutions: { id: string; name: string }[] }) {
  const { t, tCluster, locale } = useI18n();
  const [selected, setSelected] = useState(institutions[0]?.id ?? '');
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // Bumped by the Refresh button to fetch again.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    fetchSummary(selected).then((result) => {
      if (cancelled) return;
      if (result) setData(result);
      setError(!result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [selected, reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((n) => n + 1);
  };

  const formatDate = (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString(INTL_LOCALE[locale], {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });

  const formatMonth = (yyyyMm: string) =>
    new Date(`${yyyyMm}-01T00:00:00Z`).toLocaleDateString(INTL_LOCALE[locale], {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });

  const s = data?.summary;
  const k = s?.minGroupSize ?? 5;
  const maxArea = s?.topCareerAreas?.reduce((m, a) => Math.max(m, a.students), 0) ?? 0;

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-indigo-300">{t('uni.title')}</p>
            <h1 className="mt-1 text-3xl font-bold text-white">{data?.institution.name ?? institutions[0]?.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            {institutions.length > 1 && (
              <label className="text-sm text-gray-300">
                <span className="sr-only">{t('uni.choose')}</span>
                <select
                  value={selected}
                  onChange={(e) => {
                    setLoading(true);
                    setSelected(e.target.value);
                  }}
                  className="rounded border border-white/15 bg-slate-900 px-3 py-1.5 text-sm text-gray-100"
                >
                  {institutions.map((i) => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              </label>
            )}
            <button onClick={reload} disabled={loading} className="btn-secondary text-sm disabled:opacity-50">
              {t('uni.refresh')}
            </button>
          </div>
        </div>

        <p className="mt-4 rounded-lg border border-indigo-400/30 bg-indigo-400/5 px-4 py-3 text-sm leading-relaxed text-indigo-100">
          {t('uni.privacy', { k })}
        </p>

        {error && (
          <p className="mt-6 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{t('uni.error')}</p>
        )}

        {loading && !data && <p className="mt-8 text-gray-400">{t('common.loading')}</p>}

        {data && s && (
          <>
            {/* Licence */}
            {data.licence && (
              <section className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">{t('uni.licence.title')}</h2>
                  <span className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLE[data.licence.status]}`}>
                    {t(STATUS_KEYS[data.licence.status])}
                  </span>
                </div>
                <p className="mt-2 text-white">
                  {t('uni.licence.dates', { start: formatDate(data.licence.start), end: formatDate(data.licence.end) })}
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  {t('uni.licence.attempts', { count: data.licence.attemptsPerStudent })} ·{' '}
                  {data.licence.followupIncluded ? t('uni.licence.followupYes') : t('uni.licence.followupNo')}
                </p>
                {data.domains.length > 0 && (
                  <p className="mt-3 text-sm text-gray-300">
                    {t('uni.licence.howToJoin', { domains: data.domains.map((d) => `@${d}`).join(', ') })}
                  </p>
                )}
              </section>
            )}

            {/* Headline numbers */}
            <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
              <Stat label={t('uni.stats.joined')} value={s.membersJoined} />
              <Stat label={t('uni.stats.withReport')} value={s.studentsWithResults} />
              <Stat label={t('uni.stats.reports')} value={s.reportsGenerated} />
              <Stat label={t('uni.stats.roadmaps')} value={s.roadmapsGenerated} />
              <Stat
                label={t('uni.stats.rating')}
                value={s.averageRating ?? '—'}
                note={
                  s.averageRating != null
                    ? t('uni.stats.ratingOf', { count: s.ratingsCount })
                    : t('uni.stats.ratingHidden', { k })
                }
              />
            </section>

            {/* Career areas */}
            <section className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">{t('uni.areas.title')}</h2>
              <p className="mt-1 text-sm text-gray-400">{t('uni.areas.subtitle')}</p>
              {s.topCareerAreas ? (
                <ul className="mt-5 flex flex-col gap-4">
                  {s.topCareerAreas.map((a) => (
                    <li key={a.cluster}>
                      <div className="flex items-baseline justify-between gap-4 text-sm">
                        <span className="font-medium text-white">{tCluster(a.cluster)}</span>
                        <span className="tabular-nums text-indigo-200">{t('uni.areas.students', { count: a.students })}</span>
                      </div>
                      <div className="mt-2 h-2.5 w-full rounded-full bg-white/10">
                        <div
                          className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                          style={{ width: `${maxArea ? (a.students / maxArea) * 100 : 0}%` }}
                        />
                      </div>
                    </li>
                  ))}
                  {s.otherCareerAreasStudents > 0 && (
                    <li className="flex items-baseline justify-between gap-4 text-sm text-gray-400">
                      <span>{t('uni.areas.other', { k })}</span>
                      <span className="tabular-nums">{t('uni.areas.students', { count: s.otherCareerAreasStudents })}</span>
                    </li>
                  )}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-gray-400">{t('uni.areas.notEnough', { k })}</p>
              )}
            </section>

            {/* Months */}
            <section className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">{t('uni.months.title')}</h2>
              {s.reportsByMonth.length === 0 ? (
                <p className="mt-3 text-sm text-gray-400">{t('uni.months.none')}</p>
              ) : (
                <table className="mt-4 w-full text-sm">
                  <tbody>
                    {s.reportsByMonth.map((m) => (
                      <tr key={m.month} className="border-t border-white/5">
                        <td className="py-2 capitalize text-gray-300">{formatMonth(m.month)}</td>
                        <td className="py-2 text-right tabular-nums text-white">
                          {m.reports ?? <span className="text-gray-500">{t('uni.months.hidden', { k })}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <p className="mt-6 text-xs text-gray-500">
              {t('uni.updated', {
                time: new Date(data.generatedAt).toLocaleString(INTL_LOCALE[locale]),
              })}
            </p>
          </>
        )}
      </div>
    </main>
  );
}
