'use client';

// app/history/HistoryClient.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PricingContent from '@/components/PricingContent';

type HistoryItem = {
  id: string;
  createdAt: string;
  topClusters: { cluster: string; percentage: number }[];
  firstAIReport: string | null;
  detailedRoadmap: string | null;
  followupUnlocked: boolean;
};

type SubStatus = {
  plan: 'free' | 'basic' | 'full';
  followupsPaidCount: number;
  mainAttemptsRemaining: number;
  bonusAttemptGranted: boolean;
  followupBundlePurchased: boolean;
  currentAttemptStatus: string;
  currentAttemptResultId: string | null;
};

export default function HistoryClient({ userId }: { userId: string }) {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [subStatus, setSubStatus] = useState<SubStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, { first: boolean; second: boolean }>>({});
  // Account-wide bundle purchase modal — no longer tied to a specific item
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, subRes, progressRes] = await Promise.all([
          fetch('/api/user-history', { credentials: 'include' }),
          fetch('/api/subscription-status', { credentials: 'include' }),
          fetch('/api/load-progress', { credentials: 'include' }),
        ]);
        if (historyRes.ok) setHistory(await historyRes.json());
        if (subRes.ok) setSubStatus(await subRes.json());
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

  const plan = subStatus?.plan ?? 'free';
  const mainAttemptsRemaining = subStatus?.mainAttemptsRemaining ?? 0;
  const bonusAttemptGranted = subStatus?.bonusAttemptGranted ?? false;
  const followupBundlePurchased = subStatus?.followupBundlePurchased ?? false;

  const PageWrapper = ({ children }: { children: React.ReactNode }) => (
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

  if (loading) {
    return (
      <PageWrapper>
        <div className="text-center text-gray-300 pt-20">Loading...</div>
      </PageWrapper>
    );
  }

  if (!history.length) {
    return (
      <PageWrapper>
        <div className="text-center pt-20">
          <h1 className="text-3xl font-bold text-white mb-4">Your History</h1>
          <p className="text-gray-300 mb-6">No assessments found. Take the full assessment first!</p>
          <button onClick={() => router.push('/assess')} className="btn-primary">
            Start Assessment
          </button>
        </div>
      </PageWrapper>
    );
  }

  // Does any item need a followup unlock (has first report, no roadmap yet,
  // Basic plan, bundle not yet purchased)? Only offered here once BOTH
  // main attempts are completed (history.length >= 2) — per design, the
  // followup bundle upsell only appears on the decision screen right after
  // an assessment, or here in history once both attempts are done, not
  // immediately after just the first one.
  const hasItemNeedingBundle =
    history.length >= 2 &&
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
                After payment you'll be brought back here automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white drop-shadow-lg">Your Assessment History</h1>
        {(mainAttemptsRemaining > 0 || hasSavedProgress || subStatus?.currentAttemptStatus === 'in_progress') && (
          <button onClick={() => router.push('/assess')} className="btn-primary">
            {hasSavedProgress || subStatus?.currentAttemptStatus === 'in_progress'
              ? 'Continue Last Attempt'
              : 'Start New Assessment'}
          </button>
        )}
      </div>

      {/* Subscription status banner */}
      {subStatus && (
        <div className="mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
          <p className="text-white text-sm">
            <span className="font-semibold capitalize">{plan}</span> plan
            {' · '}
            <span>{mainAttemptsRemaining} attempt{mainAttemptsRemaining !== 1 ? 's' : ''} remaining</span>
            {plan === 'basic' && (
              <span className="text-gray-300">
                {' · '}Followups: {followupBundlePurchased ? 'unlocked ✓' : 'not yet unlocked'}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Account-wide bundle CTA banner — shown once, not per item */}
      {plan === 'basic' && !followupBundlePurchased && hasItemNeedingBundle && (
        <div className="mb-6 p-5 bg-indigo-900/40 border border-indigo-400/50 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold">Unlock your detailed career roadmaps</p>
            <p className="text-gray-300 text-sm mt-1">
              One purchase unlocks the followup questionnaire for both of your attempts,
              plus an instant bonus attempt.
            </p>
          </div>
          <button onClick={() => setShowBundleModal(true)} className="btn-primary whitespace-nowrap">
            Unlock All Followups — €3.00
          </button>
        </div>
      )}

      {/* History cards */}
      <div className="space-y-6">
        {history.map((item) => {
          const hasRoadmap = !!item.detailedRoadmap;
          const hasFirstReport = !!item.firstAIReport;

          const showStartFollowup =
            hasFirstReport && !hasRoadmap && (plan === 'full' || followupBundlePurchased);

          return (
            <div key={item.id} className="glass-card">
              <p className="text-sm text-gray-300 mb-4">
                {new Date(item.createdAt).toLocaleDateString()} at{' '}
                {new Date(item.createdAt).toLocaleTimeString()}
              </p>
              <h2 className="text-lg font-bold text-white mb-4">Your Top 3 Career Clusters</h2>
              <div className="space-y-3 mb-6">
                {item.topClusters.map((cluster) => (
                  <div key={cluster.cluster}>
                    <div className="flex justify-between text-sm font-semibold text-white mb-1">
                      <span>{cluster.cluster}</span>
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
                  <span>📄 First AI Report</span>
                  <span>{expanded[item.id]?.first ? '▲' : '▼'}</span>
                </button>
                {expanded[item.id]?.first && (
                  <div className="mt-3 p-4 bg-black/30 rounded-xl text-gray-200 whitespace-pre-wrap text-sm leading-relaxed">
                    {item.firstAIReport || <em className="text-gray-400">No AI report was generated for this assessment.</em>}
                  </div>
                )}
              </div>

              <div className="border-t border-white/20 pt-4">
                <button
                  onClick={() => toggleSecond(item.id)}
                  className="flex justify-between w-full text-left font-medium text-gray-200 hover:text-white transition-colors"
                >
                  <span>🚀 Detailed Career Roadmap</span>
                  <span>{expanded[item.id]?.second ? '▲' : '▼'}</span>
                </button>
                {expanded[item.id]?.second && (
                  <div className="mt-3 p-4 bg-black/30 rounded-xl text-gray-200 whitespace-pre-wrap text-sm leading-relaxed">
                    {item.detailedRoadmap || <em className="text-gray-400">No detailed roadmap yet.</em>}
                  </div>
                )}
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  {showStartFollowup && (
                    <button onClick={() => handleStartFollowup(item)} className="btn-primary">
                      📋 Start Followup Questionnaire
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