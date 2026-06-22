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
  currentAttemptStatus: string;
  currentAttemptResultId: string | null;
};

export default function HistoryClient({ userId }: { userId: string }) {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [subStatus, setSubStatus] = useState<SubStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, { first: boolean; second: boolean }>>({});
  const [unlockModalResultId, setUnlockModalResultId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, subRes] = await Promise.all([
          fetch('/api/user-history', { credentials: 'include' }),
          fetch('/api/subscription-status', { credentials: 'include' }),
        ]);
        if (historyRes.ok) setHistory(await historyRes.json());
        if (subRes.ok) setSubStatus(await subRes.json());
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
  const followupsPaidCount = subStatus?.followupsPaidCount ?? 0;
  const mainAttemptsRemaining = subStatus?.mainAttemptsRemaining ?? 0;
  const bonusAttemptGranted = subStatus?.bonusAttemptGranted ?? false;

  // ── Shared page wrapper with background image ──────────────────────
  const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/images/bg-history.jpg')" }}
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

  return (
    <PageWrapper>
      {/* Unlock modal overlay */}
      {unlockModalResultId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setUnlockModalResultId(null)}
          />
          <div className="relative z-10 w-full max-w-md">
            <div className="glass-card">
              <PricingContent
                compact
                currentPlan={plan}
                followupResultId={unlockModalResultId}
                followupsPaidCount={followupsPaidCount}
                mainAttemptsRemaining={mainAttemptsRemaining}
                bonusAttemptGranted={bonusAttemptGranted}
                onClose={() => setUnlockModalResultId(null)}
              />
              <p className="text-center text-xs text-gray-400 mt-3">
                After payment you'll be brought back here automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white drop-shadow-lg">Your Assessment History</h1>
        {mainAttemptsRemaining > 0 && (
          <button onClick={() => router.push('/assess')} className="btn-primary">
            Start New Assessment
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
                {' · '}Followups unlocked: {followupsPaidCount}/2
                {followupsPaidCount < 2 && ' (unlock both for a bonus attempt)'}
              </span>
            )}
          </p>
        </div>
      )}

      {/* History cards */}
      <div className="space-y-6">
        {history.map((item) => {
          const hasRoadmap = !!item.detailedRoadmap;
          const followupUnlocked = item.followupUnlocked;
          const hasFirstReport = !!item.firstAIReport;

          const showStartFollowup =
            hasFirstReport && !hasRoadmap && (plan === 'full' || followupUnlocked);
          const showUnlockButton =
            hasFirstReport && !hasRoadmap && plan === 'basic' && !followupUnlocked;

          return (
            <div key={item.id} className="glass-card">
              {/* Date */}
              <p className="text-sm text-gray-300 mb-4">
                {new Date(item.createdAt).toLocaleDateString()} at{' '}
                {new Date(item.createdAt).toLocaleTimeString()}
              </p>

              {/* Top clusters */}
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

              {/* First AI Report */}
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
                    {item.firstAIReport || (
                      <em className="text-gray-400">No AI report was generated for this assessment.</em>
                    )}
                  </div>
                )}
              </div>

              {/* Detailed Roadmap */}
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
                    {item.detailedRoadmap || (
                      <em className="text-gray-400">No detailed roadmap yet.</em>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  {showStartFollowup && (
                    <button onClick={() => handleStartFollowup(item)} className="btn-primary">
                      📋 Start Followup Questionnaire
                    </button>
                  )}
                  {showUnlockButton && (
                    <button onClick={() => setUnlockModalResultId(item.id)} className="btn-primary">
                      🔓 Unlock Followup — €1.50
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