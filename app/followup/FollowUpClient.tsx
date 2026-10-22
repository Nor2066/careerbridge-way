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
import { clusterQuestionsEs } from '@/lib/i18n/followup-questions-es';
import { useI18n } from '@/components/I18nProvider';
import type { Locale } from '@/lib/i18n/config';
import ReportText from '@/components/ReportText';
import InlineError from '@/components/InlineError';
import { apiErrorMessage } from '@/lib/i18n/api-error';
import FeedbackCard from '@/components/FeedbackCard';
import ChoiceMark from '@/components/ChoiceMark';


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

// The questions to SHOW, in the reader's language. Answers are stored as the
// option letter, so they mean the same thing whichever wording was on screen.
//
// Clusters stay as their scoring keys ("SocialImpact") everywhere in this
// component and only become a display name at render. They used to be renamed
// up front ("Social Impact"), which made the lookup below miss for five
// clusters and showed "No questions found" in the part of the product the
// customer had just unlocked.
function questionsToShow(cluster: string, locale: Locale): string[] | undefined {
  if (locale === 'es') return clusterQuestionsEs[cluster] ?? clusterQuestions[cluster];
  return clusterQuestions[cluster];
}

export default function FollowUpClient() {
  const router = useRouter();
  const { t, tCluster, locale } = useI18n();
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
  // A problem shown under the buttons (these were alert() boxes). toHistory
  // adds a button there for the cases where the fix is on the history page.
  const [error, setError] = useState<{ message: string; toHistory?: boolean } | null>(null);

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
      setClusters(raw);
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
          planUnlocksFollowups =
            sub.plan === 'full' || !!sub.followupBundlePurchased || !!sub.currentAttemptFollowupIncluded;
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

  if (booting || !clusters.length) return <div className="p-6 text-center">{t('common.loading')}</div>;

  const currentCluster = clusters[clusterIndex];
  const questions = questionsToShow(currentCluster, locale);
  if (!questions) {
    return <div className="p-6 text-center">{t('followup.noQuestions', { cluster: tCluster(currentCluster) })}</div>;
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
      const prevQuestions = questionsToShow(prevCluster, locale);
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
    setError(null);
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
          setError({ message: t('followup.locked'), toHistory: true });
          return;
        }
        setError({ message: apiErrorMessage(t, res.status, data) });
      }
    } catch {
      setError({ message: t('common.error.network') });
    } finally {
      setLoading(false);
    }
  };

  const generateFollowupReport = async () => {
    track('followup_complete');
    if (!assessmentId) {
      setError({ message: t('followup.noAssessment'), toHistory: true });
      return;
    }
    setError(null);
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
      } else {
        setError({ message: apiErrorMessage(t, res.status, data) });
      }
    } catch {
      setError({ message: t('followup.networkCheck') });
    } finally {
      setLoadingReport(false);
    }
  };

  const errorBlock = error && (
    <div className="mt-4 flex flex-col items-center gap-3 text-left">
      <InlineError message={error.message} className="w-full" />
      {error.toHistory && (
        <button onClick={() => router.push('/history')} className="btn-secondary text-sm">
          {t('followup.goHistory')}
        </button>
      )}
    </div>
  );

  let answeredCount = 0;
  for (const cluster of clusters) {
    const clusterAnswers = answers[cluster];
    if (clusterAnswers) answeredCount += Object.keys(clusterAnswers).length;
  }
  const totalQuestionsAll = clusters.reduce((sum, c) => sum + (questionsToShow(c, locale)?.length || 0), 0);
  const progressPercent = totalQuestionsAll ? (answeredCount / totalQuestionsAll) * 100 : 0;

  if (submitted) {

    return (
      <div className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4"
           style={{ backgroundImage: "url('/images/bg-assess.webp')" }}>
        <div className="absolute inset-0 bg-black/30 z-0" />
        <div className="relative z-10 max-w-2xl w-full mx-auto">
          <div className="glass-card text-center">
            <h1 className="text-2xl font-bold text-white mb-4">{t('followup.thanks')}</h1>
            <p className="text-gray-200 mb-4">{t('followup.saved')}</p>
            {!reportGenerated ? (
              <div>
                <button onClick={generateFollowupReport} disabled={loadingReport} className="btn-primary mt-2">
                  {loadingReport ? t('followup.generating') : t('followup.generate')}
                </button>
                {loadingReport && (
                  <p className="text-sm text-gray-300 mt-2">
                    {t('followup.processing')}
                  </p>
                )}
                {errorBlock}
              </div>
            ) : (
              <div className="mt-4">
                {support && <SupportNotice data={support} />}
                <div className="p-4 bg-white/20 rounded-lg">
                  <h2 className="text-xl font-bold text-white mb-2">{t('followup.roadmapTitle')}</h2>
                  <ReportText text={followupReport} />
                </div>
                <FeedbackCard questionKey="followup.feedback.question" className="mt-6 text-left" />
                <button onClick={() => router.push('/history')} className="btn-primary mt-6">
                  {t('followup.goHistory')}
                </button>
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
            {t('followup.clusterOf', { current: clusterIndex + 1, total: clusters.length, name: tCluster(currentCluster) })}
          </div>
          <div className="mb-4 text-sm text-gray-300">
            {t('followup.questionOf', { current: questionIndex + 1, total: totalQuestionsInCluster })}
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
                  className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 backdrop-blur-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-indigo-300 ${
                    isChecked
                      ? 'border-indigo-400 bg-indigo-900/40 shadow-md shadow-indigo-500/30'
                      : 'border-gray-300 bg-black/20 hover:border-indigo-400 hover:bg-indigo-800/30'
                  }`}>
                  {/* sr-only, not hidden: a display:none radio cannot be
                      reached with Tab or read by a screen reader. */}
                  <input type="radio" name="question" value={opt.letter}
                    className="sr-only" checked={isChecked}
                    onChange={() => handleAnswer(opt.letter)} />
                  <ChoiceMark checked={isChecked} kind="radio" />
                  <span className="text-white font-medium">{opt.text}</span>
                </label>
              );
            })}
            {options.length === 0 && (
              <input type="text"
                className="w-full p-3 border border-gray-300 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={t('followup.typeAnswer')}
                value={currentAnswer}
                onChange={(e) => handleAnswer(e.target.value)} />
            )}
          </div>
          <div className="mt-8 flex justify-between">
            <button onClick={goToPrevious}
              disabled={clusterIndex === 0 && questionIndex === 0}
              className="btn-secondary">{t('followup.previous')}</button>
            <button onClick={goToNext} disabled={loading} className="btn-primary">
              {clusterIndex === clusters.length - 1 && questionIndex === totalQuestionsInCluster - 1
                ? t('followup.submit') : t('common.next')}
            </button>
          </div>
          {loading && <div className="mt-4 text-center text-gray-300">{t('followup.saving')}</div>}
          {errorBlock}
        </div>
      </div>
    </div>
  );
}