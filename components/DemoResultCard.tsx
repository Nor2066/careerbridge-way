'use client';

// components/DemoResultCard.tsx
//
// What the homepage demo ends with: a work style, how the answers split, and
// three career areas to look at, then the way into the full assessment. It
// used to end with "Great work!" and a button, which gave nothing back for
// the eight answers. The scoring is in lib/demo-quiz.ts, and the card says
// plainly that this is a taste, not an assessment.

import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';
import { DEMO_STYLES, DEMO_STYLE_AREAS, type DemoResult, type DemoStyle } from '@/lib/demo-quiz';
import { formatPercent } from '@/lib/i18n/format';
import type { MessageKey } from '@/lib/i18n/messages';

const STYLE_KEYS: Record<DemoStyle, { name: MessageKey; trait: MessageKey; body: MessageKey }> = {
  analytical: { name: 'demo.style.analytical.name', trait: 'demo.style.analytical.trait', body: 'demo.style.analytical.body' },
  creative: { name: 'demo.style.creative.name', trait: 'demo.style.creative.trait', body: 'demo.style.creative.body' },
  social: { name: 'demo.style.social.name', trait: 'demo.style.social.trait', body: 'demo.style.social.body' },
  strategic: { name: 'demo.style.strategic.name', trait: 'demo.style.strategic.trait', body: 'demo.style.strategic.body' },
};

type Props = {
  result: DemoResult;
  onStart: () => void;
  onRetake: () => void;
};

export default function DemoResultCard({ result, onStart, onRetake }: Props) {
  const { t, tCluster, locale } = useI18n();
  const top = STYLE_KEYS[result.top];
  const ranked = [...DEMO_STYLES].sort((a, b) => result.shares[b] - result.shares[a]);

  return (
    <section className="glass-card" aria-labelledby="demo-result-title">
      <p className="text-center font-mono text-xs uppercase tracking-widest text-indigo-300">
        {t('demo.result.kicker')}
      </p>
      <h2 id="demo-result-title" className="mt-2 text-center text-3xl font-bold text-white">
        {t(top.name)}
      </h2>
      {/* Left out when every answer pointed the same way. */}
      {result.shares[result.second] > 0 && (
        <p className="mt-1 text-center text-indigo-200">
          {t('demo.result.second', { trait: t(STYLE_KEYS[result.second].trait) })}
        </p>
      )}
      <p className="mt-5 leading-relaxed text-gray-200">{t(top.body)}</p>

      <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-gray-400">{t('demo.result.mix')}</h3>
      <ul className="mt-3 space-y-2">
        {ranked.map((style) => (
          <li key={style}>
            <div className="flex justify-between text-sm text-gray-300">
              <span>{t(STYLE_KEYS[style].name)}</span>
              <span>{formatPercent(result.shares[style], locale)}</span>
            </div>
            <div className="mt-1 h-2 w-full rounded-full bg-gray-700" aria-hidden="true">
              <div
                className={`h-2 rounded-full ${
                  style === result.top ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-indigo-400/50'
                }`}
                style={{ width: `${result.shares[style]}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-gray-400">{t('demo.result.areas')}</h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {DEMO_STYLE_AREAS[result.top].map((area) => (
          <li
            key={area}
            className="rounded-full border border-indigo-400/40 bg-indigo-500/10 px-3 py-1 text-sm text-indigo-100"
          >
            {tCluster(area)}
          </li>
        ))}
      </ul>

      <p className="mt-6 text-xs leading-relaxed text-gray-400">{t('demo.result.disclaimer')}</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          onClick={onStart}
          className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 font-semibold text-white transition-all hover:from-blue-500 hover:to-indigo-500"
        >
          {t('home.demoDone.cta')}
        </button>
        <Link
          href="/sample-report"
          className="rounded-full border border-white/30 bg-white/10 px-8 py-3 text-center font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
        >
          {t('demo.result.sample')}
        </Link>
      </div>
      <button
        onClick={onRetake}
        className="mx-auto mt-4 block text-sm text-gray-400 underline transition hover:text-gray-200"
      >
        {t('demo.result.retake')}
      </button>
    </section>
  );
}
