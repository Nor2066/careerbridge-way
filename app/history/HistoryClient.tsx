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
  followupUnlocked: boolean; // whether this attempt's followup has been paid for
};

type SubStatus = {
  plan: 'free' | 'basic' | 'full';
  followupsPaidCount: number;
  mainAttemptsRemaining: number;
  currentAttemptStatus: string;
  currentAttemptResultId: string | null;
};

export default function HistoryClient({ userId }: { userId: string }) {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [subStatus, setSubStatus] = useState<SubStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, { first: boolean; second: boolean }>>({});
  // Which item's unlock modal is open (stores resultId or null)
  const [unlockModalResultId, setUnlockModalResultId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch history and subscription status in parallel
        const [historyRes, subRes] = await Promise.all([
          fetch('/api/user-history', { credentials: 'include' }),
          fetch('/api/subscription-status', { credentials: 'include' }),
        ]);

        if (historyRes.ok) {
          const data = await historyRes.json();
          setHistory(data);
        }

        if (subRes.ok) {
          const sub = await subRes.json();
          setSubStatus(sub);
        }
      } catch (err) {
        console.error('History fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleFirst = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: { ...prev[id], first: !prev[id]?.first } }));
  };
  const toggleSecond = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: { ...prev[id], second: !prev[id]?.second } }));
  };

  const handleStartFollowup = (item: HistoryItem) => {
    // Store the top clusters so the followup page knows which clusters to ask about
    sessionStorage.setItem(
      'topClusters',
      JSON.stringify(item.topClusters.map(c => c.cluster))
    );
    sessionStorage.setItem('lastAssessmentId', item.id);
    router.push('/followup');
  };

  if (loading) return <div className="p-6 text-center text-gray-300">Loading...</div>;

  if (!history.length) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4 text-white">Your History</h1>
        <p className="text-gray-400">No assessments found. Take the full assessment first!</p>
        <button onClick={() => router.push('/assess')} className="mt-4 btn-primary">
          Start Assessment
        </button>
      </div>
    );
  }

  const plan = subStatus?.plan ?? 'free';
  const followupsPaidCount = subStatus?.followupsPaidCount ?? 0;
  const mainAttemptsRemaining = subStatus?.mainAttemptsRemaining ?? 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
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
                onClose={() => setUnlockModalResultId(null)}
              />
              <p className="text-center text-xs text-gray-400 mt-3">
                After payment you'll be brought back here automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Your Assessment History</h1>
        {mainAttemptsRemaining > 0 && (
          <button onClick={() => router.push('/assess')} className="btn-primary">
            Start New Assessment
          </button>
        )}
      </div>

      {/* Subscription status banner */}
      {subStatus && (
        <div className="mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
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

      <div className="space-y-6">
        {history.map((item) => {
          const hasRoadmap = !!item.detailedRoadmap;
          const followupUnlocked = item.followupUnlocked;
          const hasFirstReport = !!item.firstAIReport;

          // Determine what followup action to show for this item
          // Full plan: always can do followup if no roadmap yet
          // Basic plan: needs unlock first
          const showStartFollowup =
            hasFirstReport &&
            !hasRoadmap &&
            (plan === 'full' || followupUnlocked);

          const showUnlockButton =
            hasFirstReport &&
            !hasRoadmap &&
            plan === 'basic' &&
            !followupUnlocked;

          return (
            <div key={item.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <p className="text-sm text-gray-500 mb-2">
                {new Date(item.createdAt).toLocaleDateString()} at{' '}
                {new Date(item.createdAt).toLocaleTimeString()}
              </p>
              <h2 className="text-xl font-semibold mb-4">Your Top 3 Career Clusters</h2>
              <div className="space-y-3 mb-6">
                {item.topClusters.map((cluster) => (
                  <div key={cluster.cluster}>
                    <div className="flex justify-between text-sm font-medium">
                      <span>{cluster.cluster}</span>
                      <span>{cluster.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${cluster.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* First AI Report */}
              <div className="border-t pt-4 mb-4">
                <button
                  onClick={() => toggleFirst(item.id)}
                  className="flex justify-between w-full text-left font-medium text-gray-700 hover:text-indigo-600"
                >
                  <span>📄 First AI Report</span>
                  <span>{expanded[item.id]?.first ? '▲' : '▼'}</span>
                </button>
                {expanded[item.id]?.first && (
                  <div className="mt-2 p-4 bg-gray-50 rounded-md text-gray-700 whitespace-pre-wrap">
                    {item.firstAIReport || (
                      <em className="text-gray-500">No AI report was generated for this assessment.</em>
                    )}
                  </div>
                )}
              </div>

              {/* Detailed Roadmap */}
              <div className="border-t pt-4">
                <button
                  onClick={() => toggleSecond(item.id)}
                  className="flex justify-between w-full text-left font-medium text-gray-700 hover:text-indigo-600"
                >
                  <span>🚀 Detailed Career Roadmap</span>
                  <span>{expanded[item.id]?.second ? '▲' : '▼'}</span>
                </button>
                {expanded[item.id]?.second && (
                  <div className="mt-2 p-4 bg-gray-50 rounded-md text-gray-700 whitespace-pre-wrap">
                    {item.detailedRoadmap || (
                      <em className="text-gray-500">
                        No detailed roadmap yet.
                      </em>
                    )}
                  </div>
                )}

                {/* Action buttons below the roadmap section */}
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  {showStartFollowup && (
                    <button
                      onClick={() => handleStartFollowup(item)}
                      className="btn-primary"
                    >
                      📋 Start Followup Questionnaire
                    </button>
                  )}

                  {showUnlockButton && (
                    <button
                      onClick={() => setUnlockModalResultId(item.id)}
                      className="btn-primary"
                    >
                      🔓 Unlock Followup — €1.50
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}