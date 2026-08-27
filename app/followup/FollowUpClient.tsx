'use client';

// app/followup/FollowUpClient.tsx
// Auth is verified in the parent server component (page.tsx).
// Key security fixes:
//   - userId is NEVER sent in request bodies — API routes read it from the session
//   - assessmentId is read from sessionStorage (set by the main flow or history page)
//     and sent to the API, which verifies ownership server-side
//   - mainAnswers and topClusters are fetched from the DB by the API using the
//     assessmentId — the client never needs to store or resend them

import { useState, useEffect } from 'react';
import { getSubscriptionStatus } from '@/lib/subscription-client';
import { track } from '@/lib/analytics';
import SupportNotice, { type SupportNoticeData } from '@/components/SupportNotice';
import { useRouter } from 'next/navigation';
import { clusterQuestions } from '@/lib/followup-questions';


function parseOptions(questionText: string): { letter: string; text: string }[] {
  const lines = questionText.split('\n');
  const options: { letter: string; text: string }[] = [];
  for (const line of lines) {
    const match = line.match(/^\(([a-z])\)\s+(.*)$/);
    if (match) options.push({ letter: match[1], text: match[2] });
  }
  return options;
}

function getQuestionStem(questionText: string): string {
  const firstOptionIndex = questionText.search(/\n\([a-z]\)/);
  if (firstOptionIndex === -1) return questionText;
  return questionText.substring(0, firstOptionIndex).trim();
}

const clusterNameMap: Record<string, string> = {
  Analytical: 'Analytical', Engineering: 'Engineering', IT: 'IT',
  Healthcare: 'Healthcare', Research: 'Research', Business: 'Business',
  Entrepreneurship: 'Entrepreneurship', SocialImpact: 'Social Impact',
  Education: 'Education', Creative: 'Creative', SkilledTrades: 'Skilled Trades',
  Operations: 'Operations', Legal: 'Legal & Justice', Sales: 'Sales & Marketing',
  Hospitality: 'Hospitality & Tourism',
};

export default function FollowUpClient() {
  const router = useRouter();
  const [clusters, setClusters] = useState<string[]>([]);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);
  const [clusterIndex, setClusterIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Record<number, string>>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [followupReport, setFollowupReport] = useState('');
  // See lib/crisis.ts — in memory only, never stored.
  const [support, setSupport] = useState<SupportNoticeData | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);

  // Which attempt we're answering for, and its clusters, normally come from
  // sessionStorage. That is not always available: a customer who paid for the
  // followup bundle and came back from Stripe may land in a fresh tab (some
  // in-app browsers do exactly this), and a fresh tab has empty sessionStorage.
  // Bouncing them to the homepage right after they paid is the worst possible
  // outcome, so when the keys are missing we rebuild them from the account.
  useEffect(() => {
    let cancelled = false;

    const readStored = () => {
      try {
        return {
          storedClusters: sessionStorage.getItem('topClusters'),
          storedAssessmentId: sessionStorage.getItem('lastAssessmentId'),
        };
      } catch {
        return { storedClusters: null, storedAssessmentId: null };
      }
    };

    const applyClusters = (raw: string[]) => {
      setClusters(raw.map((c: string) => clusterNameMap[c] || c));
    };

    const { storedClusters, storedAssessmentId } = readStored();

    if (storedClusters && storedAssessmentId) {
      try {
        applyClusters(JSON.parse(storedClusters));
        setAssessmentId(storedAssessmentId);
        setBooting(false);
        return;
      } catch {
        /* corrupt value — fall through to server recovery */
      }
    }

    const recover = async () => {
      try {
        const [sub, histRes] = await Promise.all([
          getSubscriptionStatus(),
          fetch('/api/user-history', { credentials: 'include' }),
        ]);

        if (!histRes.ok) throw new Error('history unavailable');

        const history: {
          id: string;
          topClusters: { cluster: string; percentage: number }[];
          firstAIReport: string | null;
          detailedRoadmap: string | null;
          followupUnlocked: boolean;
        }[] = await histRes.json();

        let pendingId: string | null = null;
        let planUnlocksFollowups = false;
        // Null means the status request failed. Falling through leaves
        // planUnlocksFollowups false and pendingId null, which is the cautious
        // reading — the recovery below then relies on the history alone.
        if (sub) {
          planUnlocksFollowups = sub.plan === 'full' || !!sub.followupBundlePurchased;
          if (sub.currentAttemptStatus === 'awaiting_followup_decision') {
            pendingId = sub.currentAttemptResultId ?? null;
          }
        }

        // Prefer the attempt the account says is mid-flight; otherwise the
        // most recent attempt that has a first report but no roadmap yet.
        const target =
          (pendingId && history.find((h) => h.id === pendingId)) ||
          history.find((h) => !!h.firstAIReport && !h.detailedRoadmap) ||
          null;

        if (cancelled) return;

        if (!target || !target.topClusters?.length) {
          router.push('/history');
          return;
        }

        // Never drop someone into 20+ questions they aren't allowed to save.
        // The history page is where the unlock lives, so send them there.
        if (!planUnlocksFollowups && !target.followupUnlocked) {
          router.push('/history');
          return;
        }

        const clusterNames = target.topClusters.map((c) => c.cluster);
        try {
          sessionStorage.setItem('topClusters', JSON.stringify(clusterNames));
          sessionStorage.setItem('lastAssessmentId', target.id);
        } catch {
          /* private mode — component state is enough for this session */
        }
        applyClusters(clusterNames);
        setAssessmentId(target.id);
        setBooting(false);
      } catch {
        if (!cancelled) router.push('/history');
      }
    };

    recover();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (booting || !clusters.length) return <div className="p-6 text-center">Loading...</div>;

  const currentCluster = clusters[clusterIndex];
  const questions = clusterQuestions[currentCluster];
  if (!questions) {
    return <div className="p-6 text-center">Error: No questions found for {currentCluster}.</div>;
  }

  const totalClusters = clusters.length;
  const totalQuestionsInCluster = questions.length;
  const currentQ = questions[questionIndex];
  const options = parseOptions(currentQ);
  const currentAnswer = answers[currentCluster]?.[questionIndex] || '';

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentCluster]: { ...(prev[currentCluster] || {}), [questionIndex]: answer },
    }));
  };

  const goToPrevious = () => {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
    } else if (clusterIndex > 0) {
      const prevCluster = clusters[clusterIndex - 1];
      const prevQuestions = clusterQuestions[prevCluster];
      if (prevQuestions) {
        setClusterIndex(clusterIndex - 1);
        setQuestionIndex(prevQuestions.length - 1);
      }
    }
  };

  const goToNext = () => {
    if (questionIndex + 1 < totalQuestionsInCluster) {
      setQuestionIndex(questionIndex + 1);
    } else if (clusterIndex + 1 < totalClusters) {
      setClusterIndex(clusterIndex + 1);
      setQuestionIndex(0);
    } else {
      submitAnswers();
    }
  };

  const submitAnswers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/save-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        // Send the attempt these answers belong to. Without it the server
        // fell back to the "current" attempt, which is wrong (and a 403)
        // for a followup started from the history page.
        body: JSON.stringify({ answers, ...(assessmentId ? { assessmentId } : {}) }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        if (data.code === 'FOLLOWUP_LOCKED') {
          alert(
            'Your followup access for this attempt is not unlocked. Unlock it from your history page — your answers will still be here.'
          );
          router.push('/history');
          return;
        }
        alert('Failed to save answers: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateFollowupReport = async () => {
    track('followup_complete');
    if (!assessmentId) {
      alert('Assessment ID not found. Please return to history and try again.');
      router.push('/history');
      return;
    }
    setLoadingReport(true);
    try {
      const res = await fetch('/api/generate-followup-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          assessmentId,
          followupAnswers: answers,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        track('report_view', { kind: 'followup' });
        setFollowupReport(data.report);
        setSupport(data.support ?? null);
        setReportGenerated(true);
        sessionStorage.removeItem('topClusters');
        sessionStorage.removeItem('lastAssessmentId');
        setTimeout(() => setShowFeedbackPopup(true), 1500);
      } else {
        alert('Failed to generate report: ' + (data.error || 'Unknown server error'));
      }
    } catch (err) {
      alert('Network error. Please check your connection and try again.');
    } finally {
      setLoadingReport(false);
    }
  };

  let answeredCount = 0;
  for (const cluster of clusters) {
    const clusterAnswers = answers[cluster];
    if (clusterAnswers) answeredCount += Object.keys(clusterAnswers).length;
  }
  const totalQuestionsAll = clusters.reduce((sum, c) => sum + (clusterQuestions[c]?.length || 0), 0);
  const progressPercent = totalQuestionsAll ? (answeredCount / totalQuestionsAll) * 100 : 0;

  if (submitted) {
    const FeedbackPopup = () => {
      const [feedbackRating, setFeedbackRating] = useState(0);
      const [feedbackComment, setFeedbackComment] = useState('');
      const [saved, setSaved] = useState(false);
      const [saving, setSaving] = useState(false);
      const [expanded, setExpanded] = useState(true);

      const saveFeedback = async () => {
        if (feedbackRating === 0) { alert('Please rate your experience'); return; }
        setSaving(true);
        try {
          // Only feedbackRating/feedbackComment are sent — topClusters/rawScores/
          // answers are now optional on the backend (see save-results route fix),
          // since this popup has no access to the original assessment data.
          const res = await fetch('/api/save-results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ feedbackRating, feedbackComment }),
          });
          if (res.ok) setSaved(true);
          else alert('Something went wrong. Please try again.');
        } catch {
          alert('Network error. Please try again.');
        } finally {
          setSaving(false);
        }
      };

      if (!showFeedbackPopup) return null;

      return (
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-stretch">
          <button
            onClick={() => setExpanded(e => !e)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-2 py-6 rounded-l-lg shadow-lg transition-colors"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            aria-label="Toggle feedback"
          >
            {expanded ? '✕ Close' : '💬 Feedback'}
          </button>
          {expanded && (
            <div className="w-72 bg-gray-900/95 backdrop-blur-sm border-l border-t border-b border-white/20 rounded-l-xl shadow-2xl p-5 flex flex-col gap-4">
              {saved ? (
                <div className="text-center py-4">
                  <div className="text-3xl mb-2">🎉</div>
                  <p className="text-green-400 font-semibold">Thank you for your feedback!</p>
                  <button onClick={() => setShowFeedbackPopup(false)} className="mt-4 text-xs text-gray-400 hover:text-white">Close</button>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-white font-bold text-sm mb-1">Help us improve</h3>
                    <p className="text-gray-400 text-xs">How useful was your career roadmap?</p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map(r => (
                      <button key={r} onClick={() => setFeedbackRating(r)}
                        className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${feedbackRating === r ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg scale-110' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                  <textarea value={feedbackComment} onChange={e => setFeedbackComment(e.target.value)}
                    rows={3} placeholder="Any comments? (optional)"
                    className="w-full p-2 text-sm border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                  <button onClick={saveFeedback} disabled={saving || feedbackRating === 0}
                    className="btn-primary w-full text-sm py-2 disabled:opacity-50">
                    {saving ? 'Saving...' : 'Submit Feedback'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4"
           style={{ backgroundImage: "url('/images/bg-assess.webp')" }}>
        <div className="absolute inset-0 bg-black/30 z-0" />
        <FeedbackPopup />
        <div className="relative z-10 max-w-2xl w-full mx-auto">
          <div className="glass-card text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Thank you!</h1>
            <p className="text-gray-200 mb-4">Your detailed answers have been saved.</p>
            {!reportGenerated ? (
              <div>
                <button onClick={generateFollowupReport} disabled={loadingReport} className="btn-primary mt-2">
                  {loadingReport ? 'Generating your personalized roadmap...' : '🚀 Get Your Career Roadmap'}
                </button>
                {loadingReport && (
                  <p className="text-sm text-gray-300 mt-2">
                    We are processing your information. This may take a few seconds.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-4">
                {support && <SupportNotice data={support} />}
                <div className="p-4 bg-white/20 rounded-lg">
                  <h2 className="text-xl font-bold text-white mb-2">Your Personalized Career Roadmap</h2>
                  <p className="text-gray-200 whitespace-pre-wrap">{followupReport}</p>
                  <button onClick={() => router.push('/history')} className="btn-primary mt-4">
                    Go to History
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4"
         style={{ backgroundImage: "url('/images/bg-assess.webp')" }}>
      <div className="absolute inset-0 bg-black/30 z-0" />
      <div className="relative z-10 w-full max-w-2xl mx-auto">
        <div className="glass-card">
          <div className="mb-4 text-sm text-gray-300">
            Cluster {clusterIndex + 1} of {clusters.length}: {currentCluster}
          </div>
          <div className="mb-4 text-sm text-gray-300">
            Question {questionIndex + 1} of {totalQuestionsInCluster}
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2 mb-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                 style={{ width: `${progressPercent}%` }} />
          </div>
          <h2 className="text-xl font-semibold text-white mb-6">{getQuestionStem(currentQ)}</h2>
          <div className="space-y-3">
            {options.map(opt => {
              const isChecked = currentAnswer === opt.letter;
              return (
                <label key={opt.letter}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 backdrop-blur-sm ${
                    isChecked
                      ? 'border-indigo-400 bg-indigo-900/40 shadow-md shadow-indigo-500/30'
                      : 'border-gray-300 bg-black/20 hover:border-indigo-400 hover:bg-indigo-800/30'
                  }`}>
                  <input type="radio" name="question" value={opt.letter}
                    className="hidden" checked={isChecked}
                    onChange={() => handleAnswer(opt.letter)} />
                  <span className="text-white font-medium">{opt.text}</span>
                </label>
              );
            })}
            {options.length === 0 && (
              <input type="text"
                className="w-full p-3 border border-gray-300 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Type your answer"
                value={currentAnswer}
                onChange={(e) => handleAnswer(e.target.value)} />
            )}
          </div>
          <div className="mt-8 flex justify-between">
            <button onClick={goToPrevious}
              disabled={clusterIndex === 0 && questionIndex === 0}
              className="btn-secondary">← Previous</button>
            <button onClick={goToNext} disabled={loading} className="btn-primary">
              {clusterIndex === clusters.length - 1 && questionIndex === totalQuestionsInCluster - 1
                ? 'Submit' : 'Next →'}
            </button>
          </div>
          {loading && <div className="mt-4 text-center text-gray-300">Saving...</div>}
        </div>
      </div>
    </div>
  );
}