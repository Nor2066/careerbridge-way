'use client';

import { useState, useEffect, useRef, useId } from 'react';
import { getSubscriptionStatus, invalidateSubscriptionStatus } from '@/lib/subscription-client';
import { track } from '@/lib/analytics';
import SupportNotice, { type SupportNoticeData } from '@/components/SupportNotice';
import { useAuth } from '@/lib/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import PricingContent from '@/components/PricingContent';
import { BRAND } from '@/lib/site';
import { formatPrice } from '@/lib/prices';
import { useI18n } from '@/components/I18nProvider';
import type { SubscriptionStatus } from '@/lib/subscription-client';
import {
  SUBJECTS,
  ACTIVITIES,
  SKILL_NAMES,
  THINKING_STYLES,
  LEARNING_STYLES,
  MOTIVATIONS,
  WHAT_MATTERS,
  SOCIAL_PREFERENCES,
  WORK_ENVIRONMENTS,
  JOB_TYPES,
  YES_NO,
  ACADEMIC_LEVEL_LABELS,
  PROFILE_OPTIONS,
  PROFILE_FOLLOWUPS,
  SALARY_AIMS,
  RELOCATION,
  REMOTE_WORK,
  WORK_SCHEDULES,
  JOB_SECURITY,
  TRAVEL,
  TEAM_ENVIRONMENTS,
  CRITICISM,
} from '@/lib/assessment-options';
import ReportText from '@/components/ReportText';
import InlineError from '@/components/InlineError';
import { apiErrorMessage } from '@/lib/i18n/api-error';
import { formatPercent } from '@/lib/i18n/format';
import FeedbackCard from '@/components/FeedbackCard';
import ChoiceMark from '@/components/ChoiceMark';

type Answers = {
  subjects: string[];
  activities: string[];
  skills: {
    logicalReasoning: number;
    creativity: number;
    communication: number;
    workingWithData: number;
    manualSkills: number;
    teamwork: number;
    criticalThinking: number;
    timeManagement: number;
    uncertaintyComfort: number;
    financialRiskComfort: number;
    pressureTolerance: number;
    empathy: number;
    artistic: number;
    mechanical: number;
    organization: number;
    adaptability: number;
    physicalStamina: number;
  };
  thinkingStyle: string;
  learningStyle: string;
  motivations: string[];
  whatMattersMore: string;
  studyHours: string;
  academicLevel: number;
  socialPreference: string;
  workEnvironment: string[];
  jobVision: string[];
  dealbreakerJobs: string[];
  careerContext: {
    profile: string;
    subAnswers: any;
  };
  dreamJob: string;
  topValues: string;
  fulfillingProject: string;
  pastConsiderations: string;
  salaryAim: string;
  relocateWillingness: string;
  remoteWork: string;
  workSchedule: string;
  jobSecurity: string;
  travelPreference: string;
  teamEnvironment: string;
  criticismHandling: string;
};

// ---------- Constants ----------
// The answer options live in lib/assessment-options.ts. Their English text is
// the value scoring keys off; lib/i18n/options.ts holds what other languages
// display instead.

const initialAnswers: Answers = {
  subjects: [],
  activities: [],
  skills: {
    logicalReasoning: 3, creativity: 3, communication: 3, workingWithData: 3,
    manualSkills: 3, teamwork: 3, criticalThinking: 3, timeManagement: 3,
    uncertaintyComfort: 3, financialRiskComfort: 3, pressureTolerance: 3,
    empathy: 3, artistic: 3, mechanical: 3, organization: 3, adaptability: 3,
    physicalStamina: 3
  },
  thinkingStyle: '',
  learningStyle: '',
  motivations: [],
  whatMattersMore: '',
  studyHours: '',
  academicLevel: 3,
  socialPreference: '',
  workEnvironment: [],
  jobVision: [],
  dealbreakerJobs: [],
  careerContext: { profile: '', subAnswers: {} },
  dreamJob: '',
  topValues: '',
  fulfillingProject: '',
  pastConsiderations: '',
  salaryAim: '',
  relocateWillingness: '',
  remoteWork: '',
  workSchedule: '',
  jobSecurity: '',
  travelPreference: '',
  teamEnvironment: '',
  criticismHandling: '',
};

// ***** STYLING *****
const containerClasses = "min-h-[calc(100vh-4rem)] flex items-center justify-center px-4";
const buttonPrimaryClasses = "btn-primary";
const buttonSecondaryClasses = "btn-secondary";

// ---------- Step building blocks ----------
// Declared out here rather than inside Home on purpose. Inside it, every
// render made them new component types, so React rebuilt the question after
// each answer and keyboard focus fell back to the top of the page. The
// open-text steps still save on blur from when that was worked around.

/** One step is on screen at a time, so the answer groups can name the
 *  question by a fixed id. */
const STEP_TITLE_ID = 'step-title';

// relative: keeps the sr-only input inside the card, so focusing it does not
// scroll the page. The ring shows which answer the keyboard is on.
const optionClasses = (isChecked: boolean) =>
  `relative flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 backdrop-blur-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-indigo-300 ${
    isChecked
      ? 'border-indigo-400 bg-indigo-900/40 shadow-md shadow-indigo-500/30'
      : 'border-gray-300 bg-black/20 hover:border-indigo-400 hover:bg-indigo-800/30 hover:shadow-md hover:shadow-indigo-500/20'
  }`;

type StepShellProps = {
  title: string;
  isValid?: boolean;
  stepLabel: string;
  /** 0 to 100. */
  progress: number;
  backLabel: string;
  nextLabel: string;
  /** Left out on the first step, which has nothing to go back to. */
  onBack?: () => void;
  onNext: () => void;
  /** The pricing modal, drawn over the step when the paywall is hit. */
  overlay?: React.ReactNode;
  /** One line under the progress bar, e.g. that a university is paying. */
  notice?: string;
  children: React.ReactNode;
};

function StepShell({ title, isValid = true, stepLabel, progress, backLabel, nextLabel, onBack, onNext, overlay, notice, children }: StepShellProps) {
  return (
    <>
      {overlay}
      <div className={containerClasses}>
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <h1 className="text-3xl font-bold text-white">{BRAND.name}</h1>
            </div>
            <span className="text-sm font-medium text-gray-300 block mb-4">{stepLabel}</span>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
            </div>
            {notice && <p className="mt-3 text-sm text-indigo-200">{notice}</p>}
          </div>
          <div className="glass-card">
            <h2 id={STEP_TITLE_ID} className="text-2xl font-bold text-white mb-6 text-center">{title}</h2>
            {children}
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              {onBack && <button onClick={onBack} className={buttonSecondaryClasses}>{backLabel}</button>}
              <button onClick={onNext} disabled={!isValid} className={buttonPrimaryClasses}>{nextLabel}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

type OptionListProps = {
  options: readonly string[];
  /** The option in the reader's language. The value saved stays English. */
  label: (option: string) => string;
};

function CheckboxGroup({ options, label, selected, onChange, maxSelections }: OptionListProps & {
  selected: string[];
  onChange: (val: string[]) => void;
  maxSelections: number;
}) {
  return (
    <div role="group" aria-labelledby={STEP_TITLE_ID} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((option) => {
        const isChecked = selected.includes(option);
        return (
          <label key={option} className={optionClasses(isChecked)}>
            {/* sr-only, not hidden: a display:none input cannot be reached
                with Tab or read by a screen reader. */}
            <input
              type="checkbox"
              className="sr-only"
              checked={isChecked}
              onChange={(e) => {
                if (e.target.checked && selected.length < maxSelections) {
                  onChange([...selected, option]);
                } else if (!e.target.checked) {
                  onChange(selected.filter((x) => x !== option));
                }
              }}
            />
            <ChoiceMark checked={isChecked} kind="checkbox" />
            <span className="text-white font-medium">{label(option)}</span>
          </label>
        );
      })}
    </div>
  );
}

function RadioGroup({ options, label, selected, onChange }: OptionListProps & {
  selected: string;
  onChange: (val: string) => void;
}) {
  // A shared name makes the answers one group: Tab enters it once and the
  // arrow keys move between them.
  const name = useId();
  return (
    <div role="radiogroup" aria-labelledby={STEP_TITLE_ID} className="space-y-3">
      {options.map((option) => {
        const isChecked = selected === option;
        return (
          <label key={option} className={optionClasses(isChecked)}>
            <input
              type="radio"
              name={name}
              className="sr-only"
              checked={isChecked}
              onChange={() => onChange(option)}
            />
            <ChoiceMark checked={isChecked} kind="radio" />
            <span className="text-white font-medium">{label(option)}</span>
          </label>
        );
      })}
    </div>
  );
}

function RatingButtons({ ratings, selected, onChange }: { ratings: number[]; selected: number; onChange: (val: number) => void }) {
  return (
    <div role="group" aria-labelledby={STEP_TITLE_ID} className="flex gap-4 justify-center flex-wrap">
      {ratings.map((r) => (
        <button key={r} type="button" aria-pressed={selected === r} onClick={() => onChange(r)} className={`w-14 h-14 rounded-full font-bold transition-all ${selected === r ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg scale-110' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>{r}</button>
      ))}
    </div>
  );
}

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { t, tOption, tCluster, locale } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [submittedAnswers, setSubmittedAnswers] = useState<any>(null);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [aiReport, setAiReport] = useState('');
  // Set only when the report response carries a support notice. Held in
  // memory and never persisted, so it is gone on reload — deliberate;
  // see lib/crisis.ts on why none of this is stored.
  const [support, setSupport] = useState<SupportNoticeData | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  // ─── Subscription state ──────────────────────────────────────────────
  const [subStatus, setSubStatus] = useState<SubscriptionStatus | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [saveResultError, setSaveResultError] = useState<string | null>(null);
  // After generate-report succeeds, this controls the decision UI
  // (pay for followup / go to followup / skip)
  const [awaitingFollowupDecision, setAwaitingFollowupDecision] = useState(false);
  const [skipLoading, setSkipLoading] = useState(false);
  // Problems shown on the page next to the button that failed (these were alert() boxes).
  const [reportError, setReportError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  // Controls the pricing modal overlay shown at the step-10 gate
  const [showPricingModal, setShowPricingModal] = useState(false);
  // Shown when the user tries to access /assess with an unfinished
  // attempt (current_attempt_status === 'awaiting_followup_decision')
  // from a previous session — explains why they can't start fresh
  // and offers a direct path to finish it.
  const [showMustFinishModal, setShowMustFinishModal] = useState(false);

  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const loadedRef = useRef(false);
  const isReadyRef = useRef(false);
  const autoSavedRef = useRef(false);
  const resetTriggered = useRef(false);

  // ---------- Step constants ----------
  const originalStepsCount = 2 + SKILL_NAMES.length + 10; // 2+17+10=29
  const newStepsCount = 17;
  const totalSteps = originalStepsCount + newStepsCount;
  let stepOffset = 2 + SKILL_NAMES.length;
  const dealbreakerStep = originalStepsCount - 1;
  const profileStep = dealbreakerStep + 1;
  const followUp1Step = profileStep + 1;
  const followUp2Step = followUp1Step + 1;
  const followUp3Step = followUp2Step + 1;
  const newQuestionsStart = followUp3Step + 1;
  const salaryStep = newQuestionsStart;
  const relocateStep = salaryStep + 1;
  const remoteStep = relocateStep + 1;
  const scheduleStep = remoteStep + 1;
  const securityStep = scheduleStep + 1;
  const travelStep = securityStep + 1;
  const teamStep = travelStep + 1;
  const criticismStep = teamStep + 1;
  const dreamJobStep = criticismStep + 1;
  const topValuesStep = dreamJobStep + 1;
  const fulfillingStep = topValuesStep + 1;
  const pastConsiderationsStep = fulfillingStep + 1;
  const finalSubmitStep = pastConsiderationsStep + 1;

  const clampStep = (s: number) => Math.min(Math.max(s, 0), finalSubmitStep);
  const prevStep = () => setStep(s => clampStep(s - 1));

  // ─── Gated nextStep — paywall fires at step 9 → 10 ───────────────────
  const nextStep = () => {
    if (
      step === 9 &&
      subStatus &&
      !subStatus.canStartAssessment &&
      subStatus.currentAttemptStatus !== 'in_progress'
    ) {
      track('paywall_view', { reason: 'no_attempts' });
      setShowPricingModal(true);
      return;
    }
    if (step === 9 && subLoading) return;
    setStep(s => {
      const next = clampStep(s + 1);
      // Leaving step 0 is the real "started" moment — before that they are
      // still deciding. Every later step records how far they got, which is
      // what turns "people drop out" into "people drop out at question 23".
      if (s === 0) track('quiz_start');
      track('quiz_question', { index: next });
      return next;
    });
  };

  // ---------- Fetch subscription status on mount ----------
  useEffect(() => {
    let isMounted = true;
    const fetchSubStatus = async () => {
      if (!user) {
        setSubLoading(false);
        return;
      }
      try {
        const data = await getSubscriptionStatus();
        if (isMounted && data) {
          setSubStatus(data);
          // Only show the inline "awaiting followup decision" screen if we
          // already have `result` data in memory from THIS session (i.e. we
          // just finished generateAIReport). On a fresh page load there is
          // no `result` state to render the decision screen with. Instead
          // of silently redirecting, show a modal explaining why the user
          // can't start a new assessment, with a button to go finish it.
          if (data.currentAttemptStatus === 'awaiting_followup_decision') {
            if (result) {
              setAwaitingFollowupDecision(true);
            } else {
              setShowMustFinishModal(true);
              setSubLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch subscription status:', err);
      } finally {
        if (isMounted) setSubLoading(false);
      }
    };
    fetchSubStatus();
    return () => { isMounted = false; };
  }, [user]);

  // Refetch subscription status (used after payments / state-changing actions)
  const refetchSubStatus = async () => {
    if (!user) return;
    try {
      // force: this runs after something that changed entitlements, so the
      // cache must not be allowed to answer.
      const data = await getSubscriptionStatus({ force: true });
      if (data) setSubStatus(data);
      return data;
    } catch (err) {
      console.error('Failed to refetch subscription status:', err);
    }
  };

  // ---------- Clear progress from DB and sessionStorage after report ----------
  // Called after generate-report succeeds. Does NOT reset result/aiReport/
  // awaitingFollowupDecision — those are still needed for the decision screen.
  const clearProgressAfterReport = async () => {
    // Clear sessionStorage questionnaire keys
    sessionStorage.removeItem('mainAnswers');
    sessionStorage.removeItem('topClusters');
    // Note: lastAssessmentId is intentionally kept — needed for followup unlock flow

    // Reset questionnaire state so next visit starts fresh
    setStep(0);
    setAnswers(initialAnswers);
    setSubmittedAnswers(null);

    // Reset load refs so progress is not re-loaded from DB on next visit
    loadedRef.current = false;
    isReadyRef.current = false;
    autoSavedRef.current = false;

    // Overwrite DB progress record with a clean slate (step 0, empty answers).
    // Using upsert via the existing save-progress endpoint — this is the
    // simplest approach and avoids needing a new DELETE endpoint.
    if (user) {
      try {
        await fetchWithAuth('/api/save-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ answers: initialAnswers, step: 0 }),
        });
      } catch (err) {
        // Non-critical — worst case user sees a completed questionnaire on
        // next visit but can always reset via the reset param
        console.error('Failed to clear progress after report:', err);
      }
    }
  };

  // ---------- Reset assessment function (full reset including UI) ----------
  const resetAssessment = async () => {
    setStep(0);
    setAnswers(initialAnswers);
    setResult(null);
    setSubmittedAnswers(null);
    setAiReport('');
    setReportGenerated(false);
    setAwaitingFollowupDecision(false);
    sessionStorage.removeItem('topClusters');
    sessionStorage.removeItem('mainAnswers');
    if (user) {
      await fetchWithAuth('/api/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ answers: initialAnswers, step: 0 }),
      });
    }
    loadedRef.current = false;
    isReadyRef.current = false;
    autoSavedRef.current = false;
  };

  // ---------- Reset query parameter handler ----------
  useEffect(() => {
    if (searchParams.get('reset') === 'true' && !resetTriggered.current && user) {
      resetTriggered.current = true;
      resetAssessment();
      router.replace('/', { scroll: false });
    }
  }, [searchParams, user, resetAssessment, router]);

  // ---------- Load saved progress ----------
  // Fixed autosave data-loss bug: previously, if fetchWithAuth failed during
  // a brief auth-initialization window (e.g. right after navigating back
  // from /history), the catch block still marked the questionnaire "ready"
  // to autosave — so the very next interaction would silently overwrite the
  // user's real saved progress in the DB with blank/default state.
  // Fix: wait for authLoading to resolve before attempting the load, and
  // retry a few times on failure before ever allowing autosave to arm.
  const loadRetryCount = useRef(0);
  useEffect(() => {
    let isMounted = true;
    if (authLoading) return; // wait until auth session is confirmed ready
    const loadProgress = async () => {
      if (!user) return;
      if (loadedRef.current) return;
      try {
        const res = await fetchWithAuth('/api/load-progress', {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.answers && data.step !== undefined) {
          let loadedStep = data.step;
          if (loadedStep > finalSubmitStep) loadedStep = 0;
          const mergedAnswers = {
            ...initialAnswers,
            ...data.answers,
            careerContext: data.answers.careerContext || initialAnswers.careerContext,
          };
          setAnswers(mergedAnswers);
          setStep(loadedStep);
          await fetchWithAuth('/api/save-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ answers: mergedAnswers, step: loadedStep }),
          });
        }
        loadedRef.current = true;
        isReadyRef.current = true;
      } catch (err) {
        console.error(err);
        // Retry up to 6 times (increased from 3 — a full external redirect
        // back from Stripe checkout can take longer than expected for the
        // browser's Supabase session to fully rehydrate). Only arm autosave
        // (isReadyRef.current = true) after retries are exhausted, so a
        // transient failure can't wipe existing saved progress.
        if (loadRetryCount.current < 6 && isMounted) {
          loadRetryCount.current += 1;
          setTimeout(() => {
            if (isMounted) loadProgress();
          }, 1000);
          return;
        }
        isReadyRef.current = true;
      }
    };
    loadProgress();
    return () => { isMounted = false; };
  }, [user, authLoading, finalSubmitStep]);

  const autoSave = async (currentAnswers: Answers, currentStep: number) => {
    if (!user) return;
    try {
      await fetchWithAuth('/api/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ answers: currentAnswers, step: currentStep }),
      });
    } catch (err) {}
  };

  useEffect(() => {
    if (!isReadyRef.current) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => autoSave(answers, step), 1000);
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [answers, step, user]);

  useEffect(() => {
    if (!user) {
      loadedRef.current = false;
      isReadyRef.current = false;
    }
  }, [user]);

  // Safety redirect for follow-up steps
  const profile = answers.careerContext?.profile || '';
  useEffect(() => {
    if ((step === followUp1Step || step === followUp2Step || step === followUp3Step) && !profile) {
      setStep(profileStep);
    }
  }, [step, profile, followUp1Step, followUp2Step, followUp3Step, profileStep]);

  // ---------- Auto-save results when they become available ----------
  useEffect(() => {
    const autoSaveResults = async () => {
      if (!user || autoSavedRef.current) return;
      if (!result || !submittedAnswers) return;
      autoSavedRef.current = true;
      setSaveResultError(null);
      try {
        const res = await fetchWithAuth('/api/save-result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            topClusters: result.top3,
            rawScores: result.rawScores,
            answers: submittedAnswers,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          if (errData.code === 'SUBSCRIPTION_REQUIRED') {
            setSaveResultError(t('assess.noAttempts'));
            await refetchSubStatus();
            autoSavedRef.current = false;
            return;
          }
          console.error('save-result failed:', errData);
          autoSavedRef.current = false;
          return;
        }

        const data = await res.json();
        if (data.id) {
          sessionStorage.setItem('lastAssessmentId', data.id);
        }

        fetchWithAuth('/api/save-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            topClusters: result.top3,
            rawScores: result.rawScores,
            answers: submittedAnswers,
          }),
        }).catch(err => console.error('save-results (non-critical) failed:', err));

        await refetchSubStatus();
      } catch (err) {
        console.error('Auto-save failed:', err);
        autoSavedRef.current = false;
      }
    };
    autoSaveResults();
  }, [user, result, submittedAnswers]);

  const update = (field: keyof Answers, value: any) => setAnswers(prev => ({ ...prev, [field]: value }));
  const updateSkill = (skillId: keyof Answers['skills'], value: number) => setAnswers(prev => ({ ...prev, skills: { ...prev.skills, [skillId]: value } }));

  const handleSubmit = async () => {
    track('quiz_complete');
    setLoading(true);
    setSubmitError(null);
    const payload = {
      ...answers,
      studyHours: answers.studyHours === 'YES',
      academicLevel: Number(answers.academicLevel),
    };
    delete (payload as any).careerContext;
    setSubmittedAnswers(payload);
    sessionStorage.setItem('mainAnswers', JSON.stringify(payload));

    // ROOT FIX for "Not authenticated" errors on Calculate:
    // /api/assess is a stateless scoring function that was always designed
    // to need no authentication (only IP rate limiting) — it doesn't save
    // anything or touch user data, that happens separately in save-result.
    // The previous code went through fetchWithAuth anyway, meaning any
    // client-side session hiccup blocked this call before it ever reached
    // the server, even though the server never needed a token at all.
    // Using plain fetch here removes that entire class of failure.
    const attemptSubmit = async (): Promise<any> => {
      const res = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      return res.json();
    };

    // A couple of retries remain as a safety net for genuine transient
    // network issues (not auth-related anymore).
    const delays = [800, 2000];
    let lastErr: unknown = null;
    for (let attempt = 0; attempt <= delays.length; attempt++) {
      try {
        const data = await attemptSubmit();
        setResult(data);
        setLoading(false);
        return;
      } catch (err) {
        lastErr = err;
        if (attempt < delays.length) {
          await new Promise(r => setTimeout(r, delays[attempt]));
        }
      }
    }

    console.error('Failed to calculate results:', lastErr);
    setSubmitError(t('assess.final.error'));
    setLoading(false);
  };

  const generateAIReport = async () => {
    if (!result) return;
    track('report_generate_start');
    setReportError(null);
    setLoadingReport(true);
    // The save starts the moment the results appear, so a quick click can
    // beat it. Wait for it rather than asking the student to try again.
    let assessmentId = sessionStorage.getItem('lastAssessmentId');
    for (let i = 0; i < 20 && !assessmentId; i++) {
      await new Promise(r => setTimeout(r, 500));
      assessmentId = sessionStorage.getItem('lastAssessmentId');
    }
    if (!assessmentId) {
      setLoadingReport(false);
      setReportError(t('assess.results.waitSave'));
      return;
    }
    try {
      const res = await fetchWithAuth('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          answers: submittedAnswers,
          rawScores: result.rawScores,
          topClusters: result.top3,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        track('report_view');
        setAiReport(data.report);
        setSupport(data.support ?? null);
        setReportGenerated(true);

        // ── ISSUE #4 FIX ──────────────────────────────────────────────
        // Clear the saved questionnaire progress from DB and sessionStorage
        // so the next visit to /assess starts fresh instead of reloading
        // the completed questionnaire state.
        await clearProgressAfterReport();
        // ─────────────────────────────────────────────────────────────

        await refetchSubStatus();
        setAwaitingFollowupDecision(true);
      } else {
        track('report_failed', { code: data.code ?? null, status: res.status });
        setReportError(apiErrorMessage(t, res.status, data));
      }
    } catch {
      setReportError(t('common.error.network'));
    } finally {
      setLoadingReport(false);
    }
  };

  // ---------- Followup decision handlers ----------
  const handleGoToFollowup = () => {
    sessionStorage.setItem('topClusters', JSON.stringify(result.top3.map((item: any) => item.cluster)));
    router.push('/followup');
  };

  const handleSkipFollowup = async () => {
    setSkipLoading(true);
    setActionError(null);
    try {
      const res = await fetch('/api/skip-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (res.ok) {
        router.push('/history');
      } else {
        setActionError(apiErrorMessage(t, res.status, await res.json().catch(() => null)));
      }
    } catch {
      setActionError(t('common.error.network'));
    } finally {
      setSkipLoading(false);
    }
  };

  // Escape hatch for the "you must finish your last followup" gate.
  // Without it that gate is a loop: /assess sends the user to /history,
  // and /history's "Start New Assessment" button sends them right back to
  // /assess. Skipping only clears the pending followup decision — the
  // attempt stays in history and can still be completed later.
  const handleSkipFromGate = async () => {
    setSkipLoading(true);
    setActionError(null);
    try {
      const res = await fetch('/api/skip-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (res.ok) {
        setShowMustFinishModal(false);
        await refetchSubStatus();
      } else {
        setActionError(apiErrorMessage(t, res.status, await res.json().catch(() => null)));
      }
    } catch {
      setActionError(t('common.error.network'));
    } finally {
      setSkipLoading(false);
    }
  };

  // The scoring route returns the case as a code; wording it here means the
  // warning follows the language switcher like everything else.
  const warningText = (r: { warningCode?: string | null; warningMessage?: string | null; excludedClusters?: string[] }) => {
    if (r.warningCode === 'EXCLUDED') {
      return t('assess.results.warning.EXCLUDED', { fields: (r.excludedClusters ?? []).map(tCluster).join(', ') });
    }
    if (r.warningCode === 'RAN_OUT') return t('assess.results.warning.RAN_OUT');
    if (r.warningCode === 'ALL_EXCLUDED') return t('assess.results.warning.ALL_EXCLUDED');
    return r.warningMessage ?? '';
  };

  // ---------- AUTH GUARD ----------
  // Wait for AuthContext to finish initializing before rendering anything.
  // Without this, fetchWithAuth calls fire before the session is ready,
  // causing "Not authenticated" errors and broken questionnaire flows.

  if (authLoading) {
    return (
      <div className={containerClasses}>
        <div className="text-gray-300">{t('common.loading')}</div>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login?returnTo=/assess';
    }
    return null;
  }

  // ---------- PRICING MODAL OVERLAY ----------
  // This and the modal below are render functions, not components: declared
  // in here, a component is a new type on every render and gets rebuilt.
  const renderPricingModal = () => {
    if (!showPricingModal || !subStatus) return null;

    // The heading has to match the actual reason the customer is blocked.
    // "Purchase a plan to see your results" is right for a first-timer and
    // plainly wrong for someone on their fourth questionnaire who already
    // paid — they ran out of attempts, which is a different problem with a
    // different answer.
    const outOfAttempts = subStatus.mainAttemptsRemaining <= 0;
    const heading =
      subStatus.plan === 'free'
        ? t('assess.paywall.unlockTitle')
        : outOfAttempts
        ? t('assess.paywall.noAttemptsTitle')
        : t('assess.paywall.oneMoreTitle');
    // A student whose university access has run out is told so, rather than
    // being shown a sales pitch as if they had never had any.
    const subheading = subStatus.institution && !subStatus.institution.attemptsRemaining
      ? t('assess.paywall.universityEnded', { university: subStatus.institution.name })
      : subStatus.plan === 'free'
        ? t('assess.paywall.unlockBody')
        : t('assess.paywall.blockedBody');

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowPricingModal(false)}
        />
        <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="glass-card">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{heading}</h2>
                <p className="text-sm text-gray-300 mt-1">{subheading}</p>
              </div>
              <button
                onClick={() => setShowPricingModal(false)}
                className="text-gray-400 hover:text-white text-2xl leading-none ml-4 flex-shrink-0"
                aria-label={t('common.close')}
              >
                &times;
              </button>
            </div>
            <PricingContent
              compact
              currentPlan={subStatus.plan}
              onClose={() => setShowPricingModal(false)}
              mainAttemptsRemaining={subStatus.mainAttemptsRemaining}
              bonusAttemptGranted={subStatus.bonusAttemptGranted}
              followupBundlePurchased={subStatus.followupBundlePurchased}
              currentAttemptStatus={subStatus.currentAttemptStatus}
              showReasonNotice
              hideHeader
            />
            <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={() => router.push('/history')}
                className="text-sm text-indigo-300 hover:text-white underline"
              >
                {t('assess.paywall.seeAttempts')}
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">
              {t('assess.paywall.progressSaved')}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ---------- MUST FINISH PREVIOUS ASSESSMENT MODAL ----------
  // Shown when the user tries to access /assess while a previous attempt
  // is still awaiting its followup decision. Explains why they can't start
  // fresh and offers a direct path to their history page to finish it.
  const renderMustFinishModal = () => {
    if (!showMustFinishModal) return null;

    const followupsUnlocked =
      subStatus?.plan === 'full' ||
      subStatus?.followupBundlePurchased ||
      subStatus?.bonusAttemptGranted ||
      subStatus?.currentAttemptFollowupIncluded;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/bg-assess.webp')" }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 w-full max-w-md">
          <div className="glass-card text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/20 mb-4">
              <span className="text-3xl">📋</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">{t('assess.mustFinish.title')}</h2>
            <p className="text-gray-300 mb-4 leading-relaxed">
              {t('assess.mustFinish.reason')}
            </p>
            <p className="text-gray-300 mb-8 leading-relaxed">
              {followupsUnlocked ? t('assess.mustFinish.unlocked') : t('assess.mustFinish.locked')}
            </p>
            <button
              onClick={() => router.push('/history')}
              className="btn-primary w-full py-3"
            >
              {t('assess.mustFinish.goHistory')}
            </button>
            <button
              onClick={handleSkipFromGate}
              disabled={skipLoading}
              className="mt-3 w-full text-sm text-gray-300 hover:text-white underline disabled:opacity-50"
            >
              {skipLoading ? t('common.pleaseWait') : t('assess.mustFinish.skip')}
            </button>
            <InlineError message={actionError} className="mt-3" />
          </div>
        </div>
      </div>
    );
  };

  // ---------- SUBSCRIPTION GATE ----------
  if (showMustFinishModal) {
    return renderMustFinishModal();
  }

  if (user && subLoading) {
    return (
      <div className={containerClasses}>
        <div className="text-gray-300">{t('common.loading')}</div>
      </div>
    );
  }

  if (saveResultError && subStatus) {
    return (
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/bg-assess.webp')" }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10">
          <div className="max-w-2xl mx-auto pt-8 px-4">
            <div className="p-4 bg-amber-800/50 border border-amber-600 rounded-lg text-amber-100 text-center">
              {saveResultError}
            </div>
          </div>
          <PricingContent
            currentPlan={subStatus.plan}
            mainAttemptsRemaining={subStatus.mainAttemptsRemaining}
            bonusAttemptGranted={subStatus.bonusAttemptGranted}
            followupBundlePurchased={subStatus.followupBundlePurchased}
            currentAttemptStatus={subStatus.currentAttemptStatus}
            showReasonNotice
          />
        </div>
      </div>
    );
  }

  // ---------- FOLLOWUP DECISION SCREEN ----------
  if (awaitingFollowupDecision && result) {
    const plan = subStatus?.plan ?? 'free';
    const resultId = sessionStorage.getItem('lastAssessmentId') || subStatus?.currentAttemptResultId || undefined;

    return (
      <div className={containerClasses}>
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">{BRAND.name}</h1>
            <p className="text-gray-300">{t('assess.results.subtitle')}</p>
          </div>

          <div className="glass-card mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">{t('assess.results.top3')}</h2>
            <ul className="space-y-4">
              {result.top3.map((item: any, idx: number) => (
                <li key={idx} className="bg-white/20 backdrop-blur-sm p-5 rounded-xl">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-white text-lg">{tCluster(item.cluster)}</span>
                    <span className="text-transparent bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text font-bold text-xl">{formatPercent(item.percentage, locale)}</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-3">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all" style={{ width: `${item.percentage}%` }}></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {support && <SupportNotice data={support} />}

          <div className="glass-card mb-8">
            <h3 className="text-xl font-bold text-white mb-3">{t('assess.results.reportTitle')}</h3>
            <ReportText text={aiReport} />
          </div>

          <FeedbackCard questionKey="assess.feedback.question" className="mb-8" />

          <div className="glass-card">
            {plan === 'full' || subStatus?.followupBundlePurchased || subStatus?.currentAttemptFollowupIncluded ? (
              <>
                <h3 className="text-xl font-bold text-white mb-3 text-center">{t('assess.decision.readyTitle')}</h3>
                <p className="text-gray-300 mb-6 text-center">
                  {subStatus?.currentAttemptFollowupIncluded && subStatus.institution
                    ? t('assess.decision.universityIncludes', { university: subStatus.institution.name })
                    : plan === 'full'
                    ? t('assess.decision.planIncludes')
                    : t('assess.decision.bundleUnlocked')}
                </p>
                <button onClick={handleGoToFollowup} className={buttonPrimaryClasses + ' w-full'}>
                  {t('assess.decision.continue')}
                </button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-white mb-3 text-center">{t('assess.decision.wantTitle')}</h3>
                <p className="text-gray-300 mb-6 text-center">
                  {t('assess.decision.wantBody', { price: formatPrice('followup_unlock', locale) })}
                </p>
                <div className="flex flex-col gap-3">
                  <PricingContent
                    compact
                    currentPlan={plan}
                    mainAttemptsRemaining={subStatus?.mainAttemptsRemaining ?? 0}
                    bonusAttemptGranted={subStatus?.bonusAttemptGranted ?? false}
                    followupBundlePurchased={subStatus?.followupBundlePurchased ?? false}
                    onBeforeCheckout={(productType) => {
                      // Before going to Stripe for a followup unlock, save
                      // topClusters to sessionStorage so the followup page
                      // can load correctly after the payment redirect.
                      // Also explicitly override the default return path
                      // (which would otherwise be the current page) to
                      // /followup, since the user is continuing straight
                      // into the followup questionnaire for THIS attempt.
                      if (productType === 'followup_unlock' && result) {
                        sessionStorage.setItem(
                          'topClusters',
                          JSON.stringify(result.top3.map((item: any) => item.cluster))
                        );
                        sessionStorage.setItem('checkoutReturnPath', '/followup');
                      }
                    }}
                  />
                  <button
                    onClick={handleSkipFollowup}
                    disabled={skipLoading}
                    className={buttonSecondaryClasses + ' w-full'}
                  >
                    {skipLoading ? t('common.pleaseWait') : t('assess.decision.notNow')}
                  </button>
                  <InlineError message={actionError} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------- RESULTS DISPLAY (before AI report generated) ----------
  if (result) {
    return (
      <div className={containerClasses}>
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">{BRAND.name}</h1>
            <p className="text-gray-300">{t('assess.results.subtitle')}</p>
          </div>
          <div className="glass-card mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">{t('assess.results.top3')}</h2>
            <ul className="space-y-4">
              {result.top3.map((item: any, idx: number) => (
                <li key={idx} className="bg-white/20 backdrop-blur-sm p-5 rounded-xl">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-white text-lg">{tCluster(item.cluster)}</span>
                    <span className="text-transparent bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text font-bold text-xl">{formatPercent(item.percentage, locale)}</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-3">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all" style={{ width: `${item.percentage}%` }}></div>
                  </div>
                </li>
              ))}
            </ul>
            {result.warningMessage && (
              <div className="mt-6 p-4 bg-amber-800/50 border border-amber-600 rounded-lg text-amber-100">⚠️ {warningText(result)}</div>
            )}
            {!reportGenerated && (
              <div className="mt-8 text-center">
                <button
                  onClick={generateAIReport}
                  disabled={loadingReport}
                  className="w-full py-4 px-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg hover:shadow-indigo-500/40 transition-all disabled:opacity-60"
                >
                  {loadingReport ? t('assess.results.generating') : t('assess.results.generate')}
                </button>
                {loadingReport && (
                  <p className="text-sm text-gray-400 mt-3">
                    {t('assess.results.processing')}
                  </p>
                )}
                <InlineError message={reportError} className="mt-4 text-left" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------- STEP RENDERING ----------
  // What every question card shares, spread into StepShell.
  const shell = {
    stepLabel: t('assess.stepOf', { step: step + 1, total: totalSteps }),
    progress: ((step + 1) / totalSteps) * 100,
    backLabel: t('common.back'),
    nextLabel: t('common.next'),
    onBack: step > 0 ? prevStep : undefined,
    onNext: nextStep,
    overlay: renderPricingModal(),
    // A university student never meets the paywall; this says why up front,
    // so they are not waiting for one.
    notice: subStatus?.institution?.active && subStatus.institution.attemptsRemaining > 0
      ? t('assess.university.banner', {
          university: subStatus.institution.name,
          count: subStatus.institution.attemptsRemaining,
        })
      : undefined,
  };

  if (step === 0) {
    return (
      <StepShell {...shell}title={t('assess.q.subjects')}>
        <CheckboxGroup label={tOption}options={SUBJECTS} selected={answers.subjects} onChange={(val: string[]) => update('subjects', val)} maxSelections={3} />
      </StepShell>
    );
  }
  if (step === 1) {
    return (
      <StepShell {...shell}title={t('assess.q.activities')}>
        <CheckboxGroup label={tOption}options={ACTIVITIES} selected={answers.activities} onChange={(val: string[]) => update('activities', val)} maxSelections={3} />
      </StepShell>
    );
  }
  if (step >= 2 && step < 2 + SKILL_NAMES.length) {
    const skillIndex = step - 2;
    const skill = SKILL_NAMES[skillIndex];
    const currentRating = answers.skills[skill.id as keyof Answers['skills']];
    return (
      <StepShell {...shell}title={t('assess.q.rateSkill', { skill: tOption(skill.label) })}>
        <div className="text-sm text-gray-300 mb-4 text-center">
          {t('assess.q.rateScale')}
        </div>
        <RatingButtons ratings={[1,2,3,4,5]} selected={currentRating} onChange={(val: number) => updateSkill(skill.id as keyof Answers['skills'], val)} />
      </StepShell>
    );
  }

  stepOffset = 2 + SKILL_NAMES.length;
  if (step === stepOffset) return (<StepShell {...shell}title={t('assess.q.thinking')}><RadioGroup label={tOption} options={THINKING_STYLES} selected={answers.thinkingStyle} onChange={(val: string) => update('thinkingStyle', val)} /></StepShell>);
  stepOffset++;
  if (step === stepOffset) return (<StepShell {...shell}title={t('assess.q.learning')}><RadioGroup label={tOption} options={LEARNING_STYLES} selected={answers.learningStyle} onChange={(val: string) => update('learningStyle', val)} /></StepShell>);
  stepOffset++;
  if (step === stepOffset) return (<StepShell {...shell}title={t('assess.q.motivations')}><CheckboxGroup label={tOption}options={MOTIVATIONS} selected={answers.motivations} onChange={(val: string[]) => update('motivations', val)} maxSelections={2} /></StepShell>);
  stepOffset++;
  if (step === stepOffset) return (<StepShell {...shell}title={t('assess.q.whatMatters')}><RadioGroup label={tOption} options={WHAT_MATTERS} selected={answers.whatMattersMore} onChange={(val: string) => update('whatMattersMore', val)} /></StepShell>);
  stepOffset++;
  if (step === stepOffset) return (<StepShell {...shell}title={t('assess.q.studyHours')}><RadioGroup label={tOption} options={YES_NO} selected={answers.studyHours} onChange={(val: string) => update('studyHours', val)} /></StepShell>);
  stepOffset++;
  if (step === stepOffset) {
    return (
      <StepShell {...shell}title={t('assess.q.academic')}>
        <div className="text-sm text-gray-300 mb-4 text-center space-y-1">
          {ACADEMIC_LEVEL_LABELS.map(label => <div key={label}>{tOption(label)}</div>)}
        </div>
        <RatingButtons ratings={[1,2,3,4,5]} selected={answers.academicLevel} onChange={(val: number) => update('academicLevel', val)} />
      </StepShell>
    );
  }
  stepOffset++;
  if (step === stepOffset) return (<StepShell {...shell}title={t('assess.q.social')}><RadioGroup label={tOption} options={SOCIAL_PREFERENCES} selected={answers.socialPreference} onChange={(val: string) => update('socialPreference', val)} /></StepShell>);
  stepOffset++;
  if (step === stepOffset) return (<StepShell {...shell}title={t('assess.q.environment')}><CheckboxGroup label={tOption}options={WORK_ENVIRONMENTS} selected={answers.workEnvironment} onChange={(val: string[]) => update('workEnvironment', val)} maxSelections={2} /></StepShell>);
  stepOffset++;
  if (step === stepOffset) return (<StepShell {...shell}title={t('assess.q.jobTypes')}><CheckboxGroup label={tOption}options={JOB_TYPES} selected={answers.jobVision} onChange={(val: string[]) => update('jobVision', val)} maxSelections={Infinity} /></StepShell>);

  if (step === dealbreakerStep) {
    return (
      <div className={containerClasses}>
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">{BRAND.name}</h1>
            <span className="text-sm font-medium text-gray-300 block mb-4">{t('assess.stepOf', { step: step + 1, total: totalSteps })}</span>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all" style={{ width: `${((step + 1) / totalSteps) * 100}%` }}></div>
            </div>
          </div>
          <div className="glass-card">
            <h2 id={STEP_TITLE_ID} className="text-2xl font-bold text-white mb-6 text-center">{t('assess.q.dealbreakers')}</h2>
            <p className="text-sm text-gray-300 mb-4">{t('assess.q.dealbreakersHint')}</p>
            <CheckboxGroup label={tOption}options={JOB_TYPES} selected={answers.dealbreakerJobs} onChange={(val: string[]) => update('dealbreakerJobs', val)} maxSelections={Infinity} />
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={prevStep} className={buttonSecondaryClasses}>{t('common.back')}</button>
              <button onClick={nextStep} className={buttonPrimaryClasses}>{t('common.next')}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === profileStep) {
    const currentProfile = PROFILE_OPTIONS.find((p) => p.value === answers.careerContext?.profile);
    return (
      <StepShell {...shell}title={t('assess.q.profile')} isValid={answers.careerContext.profile !== ''}>
        <RadioGroup label={tOption}
          options={PROFILE_OPTIONS.map((p) => p.label)}
          selected={currentProfile?.label || ''}
          onChange={(val: string) => {
            const picked = PROFILE_OPTIONS.find((p) => p.label === val);
            if (!picked) return;
            setAnswers(prev => ({ ...prev, careerContext: { profile: picked.value, subAnswers: {} } }));
          }}
        />
      </StepShell>
    );
  }

  // The three questions that depend on the profile picked above. Same
  // fields, titles and options as before, now read from PROFILE_FOLLOWUPS so
  // they can be translated in one place.
  const profileQuestionIndex =
    step === followUp1Step ? 0 : step === followUp2Step ? 1 : step === followUp3Step ? 2 : -1;
  if (profileQuestionIndex >= 0) {
    const question = PROFILE_FOLLOWUPS[profile]?.[profileQuestionIndex as 0 | 1 | 2];
    if (!question) {
      return <StepShell {...shell}title={t('assess.error')}>{t('assess.selectProfile')}</StepShell>;
    }
    return (
      <StepShell {...shell}title={tOption(question.title)}>
        <RadioGroup label={tOption}
          options={question.options}
          selected={answers.careerContext?.subAnswers?.[question.field] || ''}
          onChange={(val: string) =>
            setAnswers(prev => ({
              ...prev,
              careerContext: {
                ...prev.careerContext,
                subAnswers: { ...prev.careerContext.subAnswers, [question.field]: val },
              },
            }))
          }
        />
      </StepShell>
    );
  }

  // ---------- NEW MULTIPLE-CHOICE AND OPEN-ENDED STEPS ----------
  const preferenceSteps: { step: number; title: string; options: string[]; field: keyof Answers }[] = [
    { step: salaryStep, title: t('assess.q.salary'), options: SALARY_AIMS, field: 'salaryAim' },
    { step: relocateStep, title: t('assess.q.relocate'), options: RELOCATION, field: 'relocateWillingness' },
    { step: remoteStep, title: t('assess.q.remote'), options: REMOTE_WORK, field: 'remoteWork' },
    { step: scheduleStep, title: t('assess.q.schedule'), options: WORK_SCHEDULES, field: 'workSchedule' },
    { step: securityStep, title: t('assess.q.security'), options: JOB_SECURITY, field: 'jobSecurity' },
    { step: travelStep, title: t('assess.q.travel'), options: TRAVEL, field: 'travelPreference' },
    { step: teamStep, title: t('assess.q.team'), options: TEAM_ENVIRONMENTS, field: 'teamEnvironment' },
    { step: criticismStep, title: t('assess.q.criticism'), options: CRITICISM, field: 'criticismHandling' },
  ];
  const preference = preferenceSteps.find((p) => p.step === step);
  if (preference) {
    return (
      <StepShell {...shell}title={preference.title}>
        <RadioGroup label={tOption}
          options={preference.options}
          selected={answers[preference.field] as string}
          onChange={(val: string) => update(preference.field, val)}
        />
      </StepShell>
    );
  }
  if (step === dreamJobStep) {
    return (
      <StepShell {...shell}title={t('assess.q.dreamJob')}>
        <textarea
          key="dreamJob"
          defaultValue={answers.dreamJob}
          onBlur={(e) => update('dreamJob', e.target.value)}
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg bg-black/30 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder={t('assess.q.dreamJob.placeholder')}
        />
      </StepShell>
    );
  }
  if (step === topValuesStep) {
    return (
      <StepShell {...shell}title={t('assess.q.topValues')}>
        <textarea
          key="topValues"
          defaultValue={answers.topValues}
          onBlur={(e) => update('topValues', e.target.value)}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg bg-black/30 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder={t('assess.q.topValues.placeholder')}
        />
      </StepShell>
    );
  }
  if (step === fulfillingStep) {
    return (
      <StepShell {...shell}title={t('assess.q.fulfilling')}>
        <textarea
          key="fulfillingProject"
          defaultValue={answers.fulfillingProject}
          onBlur={(e) => update('fulfillingProject', e.target.value)}
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg bg-black/30 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder={t('assess.q.fulfilling.placeholder')}
        />
      </StepShell>
    );
  }
  if (step === pastConsiderationsStep) {
    return (
      <StepShell {...shell}title={t('assess.q.past')}>
        <textarea
          key="pastConsiderations"
          defaultValue={answers.pastConsiderations}
          onBlur={(e) => update('pastConsiderations', e.target.value)}
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg bg-black/30 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder={t('assess.q.past.placeholder')}
        />
      </StepShell>
    );
  }

  if (step === finalSubmitStep) {
    return (
      <div className={containerClasses}>
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <h1 className="text-3xl font-bold text-white">{BRAND.name}</h1>
            </div>
            <span className="text-sm font-medium text-gray-300 block mb-4">{t('assess.final.ready')}</span>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
          <div className="glass-card">
            <p className="text-center text-gray-200 mb-6">{t('assess.final.allAnswered')}</p>
            {submitError && (
              <div className="mb-6 p-4 bg-amber-800/50 border border-amber-600 rounded-lg text-amber-100 text-center text-sm">
                {submitError}
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={prevStep} className={buttonSecondaryClasses}>{t('common.back')}</button>
              <button onClick={handleSubmit} disabled={loading} className={buttonPrimaryClasses}>
                {loading ? t('assess.final.calculating') : submitError ? t('assess.final.tryAgain') : t('assess.final.see')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div>{t('assess.unknownStep', { step })}</div>;
}