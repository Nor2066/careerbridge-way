'use client';

// app/history/HistoryClient.tsx

import { useEffect, useState } from 'react';
import ProgressChecklist from '@/components/ProgressChecklist';
import { getSubscriptionStatus, type SubscriptionStatus } from '@/lib/subscription-client';
import { useRouter } from 'next/navigation';
import PricingContent from '@/components/PricingContent';
import { formatPrice } from '@/lib/prices';
import { useI18n } from '@/components/I18nProvider';
import { INTL_LOCALE } from '@/lib/i18n/config';

type HistoryItem = {
  id: string;
  createdAt: string;
  topClusters: { cluster: string; percentage: number }[];
  firstAIReport: string | null;
  detailedRoadmap: string | null;
  followupUnlocked: boolean;
};

type SubStatus = SubscriptionStatus;

const PLAN_NAME_KEYS = {
  free: 'pricing.planName.free',
  basic: 'pricing.planName.basic',
  full: 'pricing.planName.full',
} as const;

// Hoisted out of the render body for the same reason as FeedbackPopup in the
// follow-up page: declared inline it was a new component type on every render,
// so React discarded and rebuilt the entire page subtree each time -- losing
// scroll position and any state inside it.
function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
  <div
    className="min-h-screen bg-cover bg-center bg-no-repeat relative"
    style={{ backgroundImage: "url('/images/bg-history.webp')" }}
  >
    <div className="absolute inset-0 bg-black/55" />
    <div className="relative z-10 max-w-4xl mx-auto px-4 py-10">
      {children}
    </div>
  </div>
);
}

export default function HistoryClient({ userId }: { userId: string }) {
  const router = useRouter();
  const { t, tCluster, locale } = useI18n();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [subStatus, setSubStatus] = useState<SubStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, { first: boolean; second: boolean }>>({});
  // Account-wide bundle purchase modal — no longer tied to a specific item
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [skipping, setSkipping] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, sub, progressRes] = await Promise.all([
          fetch('/api/user-history', { credentials: 'include' }),
          getSubscriptionStatus(),
          fetch('/api/load-progress', { credentials: 'include' }),
        ]);
        if (historyRes.ok) setHistory(await historyRes.json());
        if (sub) setSubStatus(sub);
        if (progressRes.ok) {
          const progressData = await progressRes.json();
          setHasSavedProgress(!!(progressData.step && progressData.step > 0));
        }
      } catch (err) {
        console.error('History fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleFirst = (id: string) =>
    setExpanded(prev => ({ ...prev, [id]: { ...prev[id], first: !prev[id]?.first } }));
  const toggleSecond = (id: string) =>
    setExpanded(prev => ({ ...prev, [id]: { ...prev[id], second: !prev[id]?.second } }));

  const handleStartFollowup = (item: HistoryItem) => {
    sessionStorage.setItem('topClusters', JSON.stringify(item.topClusters.map(c => c.cluster)));
    sessionStorage.setItem('lastAssessmentId', item.id);
    router.push('/followup');
  };

  const handleSkipPendingFollowup = async () => {
    setSkipping(true);
    try {
      const res = await fetch('/api/skip-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (res.ok) {
        // Skipping a follow-up frees an attempt, so this must bypass the cache.
        const sub = await getSubscriptionStatus({ force: true });
        if (sub) setSubStatus(sub);
      } else {
        alert(t('common.error.generic'));
      }
    } catch {
      alert(t('common.error.network'));
    } finally {
      setSkipping(false);
    }
  };

  const plan = subStatus?.plan ?? 'free';
  const mainAttemptsRemaining = subStatus?.mainAttemptsRemaining ?? 0;
  const bonusAttemptGranted = subStatus?.bonusAttemptGranted ?? false;
  const followupBundlePurchased = subStatus?.followupBundlePurchased ?? false;


  if (loading) {
    return (
      <PageWrapper>
        <div className="text-center text-gray-300 pt-20">{t('common.loading')}</div>
      </PageWrapper>
    );
  }

  if (!history.length) {
    return (
      <PageWrapper>
        <div className="text-center pt-20">
          <h1 className="text-3xl font-bold text-white mb-4">{t('history.title')}</h1>
          <p className="text-gray-300 mb-6">{t('history.empty')}</p>
          <button onClick={() => router.push('/assess')} className="btn-primary">
            {t('history.start')}
          </button>
        </div>
      </PageWrapper>
    );
  }

  const awaitingFollowup = subStatus?.currentAttemptStatus === 'awaiting_followup_decision';

  // Does any item need a followup unlock (has first report, no roadmap yet,
  // Basic plan, bundle not yet purchased)?
  //
  // Normally the upsell waits until both main attempts are done — per design,
  // it belongs on the decision screen right after an assessment, not straight
  // after the first one. The exception is a customer with an attempt actually
  // parked in 'awaiting_followup_decision': /assess sends them here to finish
  // it, so if this page shows them nothing to act on they are stuck in a loop
  // between the two pages.
  const hasItemNeedingBundle =
    (history.length >= 2 || awaitingFollowup) &&
    history.some(item => !!item.firstAIReport && !item.detailedRoadmap);

  return (
    <PageWrapper>
      {/* Followup bundle purchase modal — account-wide, not tied to one item */}
      {showBundleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowBundleModal(false)}
          />
          <div className="relative z-10 w-full max-w-md">
            <div className="glass-card">
              <PricingContent
                compact
                currentPlan={plan}
                mainAttemptsRemaining={mainAttemptsRemaining}
                bonusAttemptGranted={bonusAttemptGranted}
                followupBundlePurchased={followupBundlePurchased}
                onClose={() => setShowBundleModal(false)}
              />
              <p className="text-center text-xs text-gray-400 mt-3">
                {t('history.afterPayment')}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white drop-shadow-lg">{t('history.heading')}</h1>
        {/* Hidden while an attempt is parked awaiting its followup decision:
            /assess would just bounce them straight back here. */}
        {!awaitingFollowup &&
          (mainAttemptsRemaining > 0 || hasSavedProgress || subStatus?.currentAttemptStatus === 'in_progress') && (
            <button onClick={() => router.push('/assess')} className="btn-primary">
              {hasSavedProgress || subStatus?.currentAttemptStatus === 'in_progress'
                ? t('history.continueLast')
                : t('history.startNew')}
            </button>
          )}
      </div>

      {/* Subscription status banner */}
      {subStatus && (
        <div className="mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
          <p className="text-white text-sm">
            {/* A university student sees who is paying, not a plan they never bought. */}
            {subStatus.institution && plan === 'free' ? (
              <span className="font-semibold">
                {subStatus.institution.active && subStatus.institution.attemptsRemaining > 0
                  ? t('history.banner.university', { university: subStatus.institution.name })
                  : t('history.banner.universityEnded', { university: subStatus.institution.name })}
              </span>
            ) : (
              <span className="font-semibold">{t('history.banner.plan', { plan: t(PLAN_NAME_KEYS[plan]) })}</span>
            )}
            {' · '}
            <span>{t('history.banner.attempts', { count: mainAttemptsRemaining })}</span>
            {plan === 'basic' && (
              <span className="text-gray-300">
                {' · '}{t('history.banner.followups', { state: followupBundlePurchased ? t('history.banner.unlocked') : t('history.banner.locked') })}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Answers "what did I pay for, and what happens next" without anyone
          having to email support. Derived from data this page already has. */}
      <ProgressChecklist sub={subStatus} hasHistory={history.length > 0} className="mb-6" />

      {/* Attempt parked awaiting its followup — say what's holding things up
          and give both ways out, so this page is never a dead end. */}
      {awaitingFollowup && (
        <div className="mb-6 p-5 bg-amber-900/30 border border-amber-400/50 rounded-xl">
          <p className="text-white font-semibold mb-1">{t('history.waiting.title')}</p>
          <p className="text-gray-200 text-sm leading-relaxed">
            {t('history.waiting.body')}
            {plan === 'full' || followupBundlePurchased || subStatus?.currentAttemptFollowupIncluded
              ? t('history.waiting.useButton')
              : t('history.waiting.unlockOrSkip')}
          </p>
          <button
            onClick={handleSkipPendingFollowup}
            disabled={skipping}
            className="mt-3 text-sm text-amber-200 hover:text-white underline disabled:opacity-50"
          >
            {skipping ? t('common.pleaseWait') : t('history.waiting.skip')}
          </button>
        </div>
      )}

      {/* Account-wide bundle CTA banner — shown once, not per item */}
      {plan === 'basic' && !followupBundlePurchased && hasItemNeedingBundle && (
        <div className="mb-6 p-5 bg-indigo-900/40 border border-indigo-400/50 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold">{t('history.bundle.title')}</p>
            <p className="text-gray-300 text-sm mt-1">
              {t('history.bundle.body')}
            </p>
          </div>
          <button onClick={() => setShowBundleModal(true)} className="btn-primary whitespace-nowrap">
            {t('history.bundle.cta', { price: formatPrice('followup_unlock', locale) })}
          </button>
        </div>
      )}

      {/* History cards */}
      <div className="space-y-6">
        {history.map((item) => {
          const hasRoadmap = !!item.detailedRoadmap;
          const hasFirstReport = !!item.firstAIReport;

          // item.followupUnlocked covers accounts that bought a per-attempt
          // unlock under the old pricing, and top-up credits already spent
          // on this attempt — both leave a row in followup_unlocks.
          const showStartFollowup =
            hasFirstReport &&
            !hasRoadmap &&
            (plan === 'full' || followupBundlePurchased || item.followupUnlocked);

          return (
            <div key={item.id} className="glass-card">
              <p className="text-sm text-gray-300 mb-4">
                {t('history.item.when', {
                  date: new Date(item.createdAt).toLocaleDateString(INTL_LOCALE[locale]),
                  time: new Date(item.createdAt).toLocaleTimeString(INTL_LOCALE[locale]),
                })}
              </p>
              <h2 className="text-lg font-bold text-white mb-4">{t('history.item.top3')}</h2>
              <div className="space-y-3 mb-6">
                {item.topClusters.map((cluster) => (
                  <div key={cluster.cluster}>
                    <div className="flex justify-between text-sm font-semibold text-white mb-1">
                      <span>{tCluster(cluster.cluster)}</span>
                      <span className="text-indigo-300">{cluster.percentage}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${cluster.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/20 pt-4 mb-4">
                <button
                  onClick={() => toggleFirst(item.id)}
                  className="flex justify-between w-full text-left font-medium text-gray-200 hover:text-white transition-colors"
                >
                  <span>{t('history.item.firstReport')}</span>
                  <span>{expanded[item.id]?.first ? '▲' : '▼'}</span>
                </button>
                {expanded[item.id]?.first && (
                  <div className="mt-3 p-4 bg-black/30 rounded-xl text-gray-200 whitespace-pre-wrap text-sm leading-relaxed">
                    {item.firstAIReport || <em className="text-gray-400">{t('history.item.noReport')}</em>}
                  </div>
                )}
              </div>

              <div className="border-t border-white/20 pt-4">
                <button
                  onClick={() => toggleSecond(item.id)}
                  className="flex justify-between w-full text-left font-medium text-gray-200 hover:text-white transition-colors"
                >
                  <span>{t('history.item.roadmap')}</span>
                  <span>{expanded[item.id]?.second ? '▲' : '▼'}</span>
                </button>
                {expanded[item.id]?.second && (
                  <div className="mt-3 p-4 bg-black/30 rounded-xl text-gray-200 whitespace-pre-wrap text-sm leading-relaxed">
                    {item.detailedRoadmap || <em className="text-gray-400">{t('history.item.noRoadmap')}</em>}
                  </div>
                )}
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  {showStartFollowup && (
                    <button onClick={() => handleStartFollowup(item)} className="btn-primary">
                      {t('history.item.startFollowup')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PageWrapper>
  );
}