'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import PricingContent from '@/components/PricingContent';

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
const SUBJECTS = [
  'Mathematics',
  'Sciences',
  'Technology / Computing',
  'Business / Economics',
  'Social Sciences (psychology, sociology, politics)',
  'Arts / Humanities (history, literature, art)',
  'Creative Fields (art, design, writing)',
  'Languages'
];

const ACTIVITIES = [
  'Solving problems',
  'Experiments / Hands-on (like science labs or building things)',
  'Designing / Creating',
  'Reading / Analyzing (reading and thinking deeply)',
  'Helping people',
  'Building / Using tech (computers, phones, apps)',
  'Leading / Organizing (being in charge or planning)',
  'Coding / Programming (writing code for computers or apps)',
  'Making / Building things (woodworking, repairs, crafts)',
  'Teaching / Explaining',
  'Advocating / Raising awareness (speaking up for a cause, e.g. climate change, bullying)'
];

const SKILL_NAMES = [
  { id: 'logicalReasoning', label: 'Logical Reasoning (solving puzzles, finding patterns)' },
  { id: 'creativity', label: 'Creativity (coming up with new ideas)' },
  { id: 'communication', label: 'Communication (talking, writing, presenting)' },
  { id: 'workingWithData', label: 'Working with Data (using numbers, charts, spreadsheets)' },
  { id: 'manualSkills', label: 'Manual Skills (fixing things, using tools, crafts)' },
  { id: 'teamwork', label: 'Teamwork (working well with others)' },
  { id: 'criticalThinking', label: 'Critical Thinking (thinking carefully before deciding)' },
  { id: 'timeManagement', label: 'Time Management (planning your time, meeting deadlines)' },
  { id: 'uncertaintyComfort', label: 'Uncertainty Comfort (being okay when you don’t know the answer)' },
  { id: 'financialRiskComfort', label: 'Financial Risk Comfort (being okay with money risks, like investing)' },
  { id: 'pressureTolerance', label: 'Pressure Tolerance (handling stress and tight deadlines)' },
  { id: 'empathy', label: 'Empathy / Emotional Intelligence (understanding how others feel)' },
  { id: 'artistic', label: 'Artistic / Visual Thinking (thinking in pictures, design)' },
  { id: 'mechanical', label: 'Mechanical / Spatial Reasoning (understanding how things fit together, like puzzles or building)' },
  { id: 'organization', label: 'Organization / Attention to Detail (keeping things tidy, noticing small things)' },
  { id: 'adaptability', label: 'Adaptability / Flexibility (adjusting to change easily)' },
  { id: 'physicalStamina', label: 'Physical Stamina / Endurance (staying active for long periods)' }
];

const THINKING_STYLES = [
  'I like clear answers that are either right or wrong (like math problems)',
  'I like open‑ended questions with many possible answers (like creative writing)',
  'A mix of both'
];

const LEARNING_STYLES = [
  'Hands-on',
  'Reading & Theory (learning from books, not hands‑on)',
  'Visual / Creative',
  'Group Discussion',
  'Independent Study'
];

const MOTIVATIONS = [
  'High Earning',
  'Helping / Impact',
  'Creativity',
  'Stability',
  'Research',
  'Working with Tech',
  'Leadership',
  'Personal growth and becoming the best version of yourself',
  'Creating things (art, buildings, inventions, ideas)'
];

const WHAT_MATTERS = [
  'Work-Life Balance',
  'Career Growth (opportunities to move up and earn more)',
  'Meaningful Impact (making a difference in the world)',
  'Financial Independence (having enough money to not rely on others)',
  'Autonomy (freedom to make your own decisions)'
];

const SOCIAL_PREFERENCES = [
  'Being around many people (I feel energized)',
  'Small groups',
  'One-on-one conversations',
  'Working alone / being by myself'
];

const WORK_ENVIRONMENTS = [
  'Structured (clear rules and schedules)',
  'Fast-Paced',
  'Independent',
  'Collaborative (working closely with a team)',
  'Competitive',
  'Calm'
];

const JOB_TYPES = [
  'Research job',
  'Healthcare job',
  'Entrepreneurial',
  'Hands-on trade',
  'Transport / logistics',
  'Business role',
  'IT role',
  'Engineering role',
  'Education role',
  'Creative role',
  'Social impact role',
  'Analytical/data role',
  'Legal / Justice',
  'Sales / Marketing',
  'Hospitality / Tourism'
];

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

// ---------- Subscription status type ----------
type SubscriptionStatus = {
  plan: 'free' | 'basic' | 'full';
  mainAttemptsRemaining: number;
  followupsPaidCount: number;
  bonusAttemptGranted: boolean;
  currentAttemptStatus: 'none' | 'in_progress' | 'awaiting_followup_decision';
  currentAttemptResultId: string | null;
  canStartAssessment: boolean;
  cannotStartReason: string | null;
};

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [submittedAnswers, setSubmittedAnswers] = useState<any>(null);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [aiReport, setAiReport] = useState('');
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
  // Controls the pricing modal overlay shown at the step-10 gate
  const [showPricingModal, setShowPricingModal] = useState(false);

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
  // Step index 9 = question 10 (0-based). Advancing past here requires
  // a valid plan. Users already in_progress pass through freely.
  const nextStep = () => {
    if (
      step === 9 &&
      subStatus &&
      !subStatus.canStartAssessment &&
      subStatus.currentAttemptStatus !== 'in_progress'
    ) {
      setShowPricingModal(true);
      return;
    }
    // If subscription status is still loading at this step, wait —
    // don't let users advance before we know their status.
    if (step === 9 && subLoading) return;
    setStep(s => clampStep(s + 1));
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
        const res = await fetch('/api/subscription-status', { credentials: 'include' });
        const data = await res.json();
        if (isMounted) {
          setSubStatus(data);
          // If user is mid-followup-decision (e.g. refreshed the page after
          // generating a report), restore that screen
          if (data.currentAttemptStatus === 'awaiting_followup_decision') {
            setAwaitingFollowupDecision(true);
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
      const res = await fetch('/api/subscription-status', { credentials: 'include' });
      const data = await res.json();
      setSubStatus(data);
      return data;
    } catch (err) {
      console.error('Failed to refetch subscription status:', err);
    }
  };

  // ---------- Reset assessment function ----------
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
  useEffect(() => {
    let isMounted = true;
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
        isReadyRef.current = true;
      }
    };
    loadProgress();
    return () => { isMounted = false; };
  }, [user, finalSubmitStep]);

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
        // Step 1: Save to user_results — this is the primary save.
        // Returns the result ID we need for the AI report.
        // Also runs the subscription check and marks attempt as in_progress.
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
            setSaveResultError(errData.error || 'You need to purchase a plan to continue.');
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

        // Step 2: Save feedback/assessment record (fire-and-forget — not critical
        // for the AI report flow, so we don't block on it or show errors to user)
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

        // Refresh subscription status
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
    setLoading(true);
    const payload = {
      ...answers,
      studyHours: answers.studyHours === 'YES',
      academicLevel: Number(answers.academicLevel),
    };
    delete (payload as any).careerContext;
    setSubmittedAnswers(payload);
    sessionStorage.setItem('mainAnswers', JSON.stringify(payload));
    const res = await fetchWithAuth('/api/assess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  const generateAIReport = async () => {
    if (!result) return;
    const assessmentId = sessionStorage.getItem('lastAssessmentId');
    if (!assessmentId) {
      alert('Please wait a moment for the assessment to be saved, then try again.');
      return;
    }
    setLoadingReport(true);
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
        setAiReport(data.report);
        setReportGenerated(true);
        // The attempt has now been consumed — subscription status changes
        // to 'awaiting_followup_decision'. Show the decision UI.
        await refetchSubStatus();
        setAwaitingFollowupDecision(true);
      } else {
        alert('Failed to generate report: ' + (data.error || 'unknown error'));
      }
    } catch (err) {
      alert('Network error. Please try again.');
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
    try {
      const res = await fetch('/api/skip-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (res.ok) {
        router.push('/history');
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setSkipLoading(false);
    }
  };

  // ***** STYLING *****
  const containerClasses = "min-h-[calc(100vh-4rem)] flex items-center justify-center px-4";
  const buttonPrimaryClasses = "btn-primary";
  const buttonSecondaryClasses = "btn-secondary";

  // Helper components with glass-card class
  const StepContainer = ({ title, children, isValid = true }: { title: string; children: React.ReactNode; isValid?: boolean }) => (
    <>
      <PricingModal />
      <div className={containerClasses}>      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-3xl font-bold text-white">CareerBridge Way</h1>
          </div>
          <span className="text-sm font-medium text-gray-300 block mb-4">
            Step {step + 1} of {totalSteps}
          </span>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all" style={{ width: `${((step + 1) / totalSteps) * 100}%` }}></div>
          </div>
        </div>
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">{title}</h2>
          {children}
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            {step > 0 && <button onClick={prevStep} className={buttonSecondaryClasses}>← Back</button>}
            <button onClick={nextStep} disabled={!isValid} className={buttonPrimaryClasses}>Next →</button>
          </div>
        </div>
      </div>
    </div>
    </>
  );

  const CheckboxGroup = ({ options, selected, onChange, maxSelections }: any) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((option: string) => {
        const isChecked = selected.includes(option);
        return (
          <label
            key={option}
            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 backdrop-blur-sm ${
              isChecked
                ? 'border-indigo-400 bg-indigo-900/40 shadow-md shadow-indigo-500/30'
                : 'border-gray-300 bg-black/20 hover:border-indigo-400 hover:bg-indigo-800/30 hover:shadow-md hover:shadow-indigo-500/20'
            }`}
          >
            <input
              type="checkbox"
              className="hidden"
              checked={isChecked}
              onChange={(e) => {
                if (e.target.checked && selected.length < maxSelections) {
                  onChange([...selected, option]);
                } else if (!e.target.checked) {
                  onChange(selected.filter((x: string) => x !== option));
                }
              }}
            />
            <span className="text-white font-medium">{option}</span>
          </label>
        );
      })}
    </div>
  );

  const RadioGroup = ({ options, selected, onChange }: any) => (
    <div className="space-y-3">
      {options.map((option: string) => {
        const isChecked = selected === option;
        return (
          <label
            key={option}
            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 backdrop-blur-sm ${
              isChecked
                ? 'border-indigo-400 bg-indigo-900/40 shadow-md shadow-indigo-500/30'
                : 'border-gray-300 bg-black/20 hover:border-indigo-400 hover:bg-indigo-800/30 hover:shadow-md hover:shadow-indigo-500/20'
            }`}
          >
            <input
              type="radio"
              className="hidden"
              checked={isChecked}
              onChange={() => onChange(option)}
            />
            <span className="text-white font-medium">{option}</span>
          </label>
        );
      })}
    </div>
  );

  const RatingButtons = ({ ratings, selected, onChange }: any) => (
    <div className="flex gap-4 justify-center flex-wrap">
      {ratings.map((r: number) => (
        <button key={r} onClick={() => onChange(r)} className={`w-14 h-14 rounded-full font-bold transition-all ${selected === r ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg scale-110' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>{r}</button>
      ))}
    </div>
  );

  // ---------- PRICING MODAL OVERLAY ----------
  // Shown when user tries to advance past step 9 without a valid plan/attempts.
  // Renders on top of the current step — user stays on step 9 underneath.
  const PricingModal = () => {
    if (!showPricingModal || !subStatus) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowPricingModal(false)}
        />
        {/* Modal panel */}
        <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="glass-card">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Unlock the Full Assessment</h2>
                <p className="text-sm text-gray-300 mt-1">
                  You've answered 10 questions — purchase a plan to see your results and AI report.
                </p>
              </div>
              <button
                onClick={() => setShowPricingModal(false)}
                className="text-gray-400 hover:text-white text-2xl leading-none ml-4 flex-shrink-0"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <PricingContent
              compact
              currentPlan={subStatus.plan}
              onClose={() => setShowPricingModal(false)}
              followupsPaidCount={subStatus.followupsPaidCount}
              mainAttemptsRemaining={subStatus.mainAttemptsRemaining}
            />
            <p className="text-center text-xs text-gray-400 mt-4">
              Your progress is saved. After payment you'll continue exactly where you left off.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ---------- SUBSCRIPTION GATE ----------
  // While we're checking subscription status, show a loading state.
  if (user && subLoading) {
    return (
      <div className={containerClasses}>
        <div className="text-gray-300">Loading...</div>
      </div>
    );
  }

  // ---------- PAYWALL MODAL ----------
  // Shown as an overlay when the user tries to advance past question 10
  // (step index 9 -> 10) without an available attempt. Questions 0-9 are
  // always previewable; this is the actual gate into the real assessment.
  // If save-result returned SUBSCRIPTION_REQUIRED (edge case: ran out of
  // attempts between starting and finishing the questionnaire — shouldn't
  // normally happen since the question-10 gate already checks this, but
  // covers race conditions like two tabs open at once)
  if (saveResultError && subStatus) {
    return (
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/bg-assess.jpg')" }}
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
            followupsPaidCount={subStatus.followupsPaidCount}
            mainAttemptsRemaining={subStatus.mainAttemptsRemaining}
          />
        </div>
      </div>
    );
  }


  // ---------- FOLLOWUP DECISION SCREEN ----------
  // Shown after generate-report succeeds. Report is visible immediately,
  // decision buttons appear below it.
  if (awaitingFollowupDecision && result) {
    const plan = subStatus?.plan ?? 'free';
    const resultId = sessionStorage.getItem('lastAssessmentId') || subStatus?.currentAttemptResultId || undefined;

    return (
      <div className={containerClasses}>
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">CareerBridge Way</h1>
            <p className="text-gray-300">Your personalized career assessment results</p>
          </div>

          <div className="glass-card mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Your Top 3 Career Clusters</h2>
            <ul className="space-y-4">
              {result.top3.map((item: any, idx: number) => (
                <li key={idx} className="bg-white/20 backdrop-blur-sm p-5 rounded-xl">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-white text-lg">{item.cluster}</span>
                    <span className="text-transparent bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text font-bold text-xl">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-3">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all" style={{ width: `${item.percentage}%` }}></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* AI report shown immediately */}
          <div className="glass-card mb-8">
            <h3 className="text-xl font-bold text-white mb-3">Your Personalized Career Report</h3>
            <p className="text-gray-200 whitespace-pre-wrap">{aiReport}</p>
          </div>

          {/* Decision buttons */}
          <div className="glass-card">
            {plan === 'full' ? (
              <>
                <h3 className="text-xl font-bold text-white mb-3 text-center">Ready for your detailed roadmap?</h3>
                <p className="text-gray-300 mb-6 text-center">
                  Your plan includes the followup questionnaire — answer a few more questions
                  for an in-depth career roadmap.
                </p>
                <button onClick={handleGoToFollowup} className={buttonPrimaryClasses + ' w-full'}>
                  📋 Continue to Followup Questionnaire
                </button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-white mb-3 text-center">Want a more detailed roadmap?</h3>
                <p className="text-gray-300 mb-6 text-center">
                  Unlock the followup questionnaire and get a second, more detailed AI report
                  with concrete job titles, courses, and a 3-month action plan — for €1.50.
                </p>
                <div className="flex flex-col gap-3">
                  <PricingContent
                    compact
                    currentPlan={plan}
                    followupResultId={resultId}
                    followupsPaidCount={subStatus?.followupsPaidCount ?? 0}
                    mainAttemptsRemaining={subStatus?.mainAttemptsRemaining ?? 0}
                  />
                  <button
                    onClick={handleSkipFollowup}
                    disabled={skipLoading}
                    className={buttonSecondaryClasses + ' w-full'}
                  >
                    {skipLoading ? 'Please wait...' : 'Not now — go to my history'}
                  </button>
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
    const FeedbackForm = () => {
      const [email, setEmail] = useState('');
      const [feedbackRating, setFeedbackRating] = useState(0);
      const [feedbackComment, setFeedbackComment] = useState('');
      const [saved, setSaved] = useState(false);
      const [saving, setSaving] = useState(false);

      const saveFeedback = async () => {
        const finalEmail = user ? user.email : email;
        if (!finalEmail) { alert('Please enter your email'); return; }
        if (feedbackRating === 0) { alert('Please rate your experience'); return; }
        setSaving(true);
        try {
          const payload = {
            email: finalEmail,
            feedbackRating,
            feedbackComment,
            topClusters: result.top3,
            rawScores: result.rawScores,
            answers: submittedAnswers,
          };
          const res = await fetchWithAuth('/api/save-result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            setSaved(true);
          } else {
            const responseData = await res.json();
            alert(`Something went wrong: ${responseData.error || 'Unknown error'}`);
          }
        } catch (err) { alert('Network error. Please try again.'); }
        finally { setSaving(false); }
      };

      if (saved) {
        return (
          <div className="text-center py-8">
            <div className="inline-block p-3 bg-green-100 dark:bg-green-900 rounded-full mb-4">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-green-600 dark:text-green-400 font-semibold text-lg mb-4">Thank you for your feedback!</p>
          </div>
        );
      }

      return (
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-2 text-center">Help us improve</h3>
          <p className="text-gray-300 mb-6 text-center">Your results have already been saved. Optionally leave a rating and comment.</p>
          <div className="space-y-6">
            {!user && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="you@example.com" required />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3 text-center">How accurate were your results? *</label>
              <div className="flex gap-3 justify-center">
                {[1,2,3,4,5].map(r => (
                  <button key={r} onClick={() => setFeedbackRating(r)} className={`w-12 h-12 rounded-full font-bold transition-all ${feedbackRating === r ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg scale-110' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>{r}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Comments (optional)</label>
              <textarea value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="What did you think? Any suggestions?" />
            </div>
            <button onClick={saveFeedback} disabled={saving} className={buttonPrimaryClasses + " w-full"}>{saving ? 'Saving...' : 'Submit Feedback'}</button>
          </div>
        </div>
      );
    };

    return (
      <div className={containerClasses}>
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">CareerBridge Way</h1>
            <p className="text-gray-300">Your personalized career assessment results</p>
          </div>
          <div className="glass-card mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Your Top 3 Career Clusters</h2>
            <ul className="space-y-4">
              {result.top3.map((item: any, idx: number) => (
                <li key={idx} className="bg-white/20 backdrop-blur-sm p-5 rounded-xl">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-white text-lg">{item.cluster}</span>
                    <span className="text-transparent bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text font-bold text-xl">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-3">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all" style={{ width: `${item.percentage}%` }}></div>
                  </div>
                </li>
              ))}
            </ul>
            {result.warningMessage && (
              <div className="mt-6 p-4 bg-amber-800/50 border border-amber-600 rounded-lg text-amber-100">⚠️ {result.warningMessage}</div>
            )}
          </div>
          <div className="glass-card">
            <FeedbackForm />
          </div>
          <div className="mt-8">
            {!reportGenerated && (
              <div>
                <button onClick={generateAIReport} disabled={loadingReport} className={buttonPrimaryClasses}>
                  {loadingReport ? '✨ Generating your AI report...' : '🤖 Get AI-Powered Career Report'}
                </button>
                {loadingReport && (
                  <p className="text-sm text-gray-400 mt-2">
                    We are processing your information and preparing your result. This may take a few seconds.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------- STEP RENDERING (original steps up to dealbreaker) ----------
  if (step === 0) {
    return (
      <StepContainer title="Which subjects do you enjoy the most? (Pick up to 3)">
        <CheckboxGroup options={SUBJECTS} selected={answers.subjects} onChange={(val: string[]) => update('subjects', val)} maxSelections={3} />
      </StepContainer>
    );
  }
  if (step === 1) {
    return (
      <StepContainer title="Which activities do you prefer? (Pick up to 3)">
        <CheckboxGroup options={ACTIVITIES} selected={answers.activities} onChange={(val: string[]) => update('activities', val)} maxSelections={3} />
      </StepContainer>
    );
  }
  if (step >= 2 && step < 2 + SKILL_NAMES.length) {
    const skillIndex = step - 2;
    const skill = SKILL_NAMES[skillIndex];
    const currentRating = answers.skills[skill.id as keyof Answers['skills']];
    return (
      <StepContainer title={`Rate your ${skill.label} (1-5)`}>
        <div className="text-sm text-gray-300 mb-4 text-center">
          1 = Not confident at all &nbsp;|&nbsp; 3 = Moderate &nbsp;|&nbsp; 5 = Very confident
        </div>
        <RatingButtons ratings={[1,2,3,4,5]} selected={currentRating} onChange={(val: number) => updateSkill(skill.id as keyof Answers['skills'], val)} />
      </StepContainer>
    );
  }

  stepOffset = 2 + SKILL_NAMES.length;
  if (step === stepOffset) return (<StepContainer title="Which describes you better?"><RadioGroup options={THINKING_STYLES} selected={answers.thinkingStyle} onChange={(val: string) => update('thinkingStyle', val)} /></StepContainer>);
  stepOffset++;
  if (step === stepOffset) return (<StepContainer title="How do you learn best?"><RadioGroup options={LEARNING_STYLES} selected={answers.learningStyle} onChange={(val: string) => update('learningStyle', val)} /></StepContainer>);
  stepOffset++;
  if (step === stepOffset) return (<StepContainer title="What motivates you most? (Pick up to 2)"><CheckboxGroup options={MOTIVATIONS} selected={answers.motivations} onChange={(val: string[]) => update('motivations', val)} maxSelections={2} /></StepContainer>);
  stepOffset++;
  if (step === stepOffset) return (<StepContainer title="Which matters more to you?"><RadioGroup options={WHAT_MATTERS} selected={answers.whatMattersMore} onChange={(val: string) => update('whatMattersMore', val)} /></StepContainer>);
  stepOffset++;
  if (step === stepOffset) return (<StepContainer title="Are you willing to study or work for long hours?"><RadioGroup options={['YES', 'NO']} selected={answers.studyHours} onChange={(val: string) => update('studyHours', val)} /></StepContainer>);
  stepOffset++;
  if (step === stepOffset) {
    const levelLabels = [
      '1 = High school diploma',
      '2 = Some college / trade school',
      '3 = Bachelor\'s degree',
      '4 = Master\'s degree',
      '5 = Doctorate / professional degree (MD, PhD, JD)'
    ];
    return (
      <StepContainer title="How far would you like to go academically?">
        <div className="text-sm text-gray-300 mb-4 text-center space-y-1">
          {levelLabels.map(label => <div key={label}>{label}</div>)}
        </div>
        <RatingButtons ratings={[1,2,3,4,5]} selected={answers.academicLevel} onChange={(val: number) => update('academicLevel', val)} />
      </StepContainer>
    );
  }
  stepOffset++;
  if (step === stepOffset) return (<StepContainer title="In social situations, what do you usually prefer?"><RadioGroup options={SOCIAL_PREFERENCES} selected={answers.socialPreference} onChange={(val: string) => update('socialPreference', val)} /></StepContainer>);
  stepOffset++;
  if (step === stepOffset) return (<StepContainer title="Which work environment fits you best? (Pick up to 2)"><CheckboxGroup options={WORK_ENVIRONMENTS} selected={answers.workEnvironment} onChange={(val: string[]) => update('workEnvironment', val)} maxSelections={2} /></StepContainer>);
  stepOffset++;
  if (step === stepOffset) return (<StepContainer title="Which job types interest you? (Choose as many as you want)"><CheckboxGroup options={JOB_TYPES} selected={answers.jobVision} onChange={(val: string[]) => update('jobVision', val)} maxSelections={Infinity} /></StepContainer>);

  // Dealbreaker step
  if (step === dealbreakerStep) {
    return (
      <div className={containerClasses}>
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">CareerBridge Way</h1>
            <span className="text-sm font-medium text-gray-300 block mb-4">Step {step + 1} of {totalSteps}</span>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all" style={{ width: `${((step + 1) / totalSteps) * 100}%` }}></div>
            </div>
          </div>
          <div className="glass-card">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Which job types would you NEVER want to do?</h2>
            <p className="text-sm text-gray-300 mb-4">Now be honest – these will be removed from your recommendations. (Even if you selected them before, choose them here if you would refuse that job.)</p>
            <CheckboxGroup options={JOB_TYPES} selected={answers.dealbreakerJobs} onChange={(val: string[]) => update('dealbreakerJobs', val)} maxSelections={Infinity} />
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={prevStep} className={buttonSecondaryClasses}>← Back</button>
              <button onClick={nextStep} className={buttonPrimaryClasses}>Next →</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Career context steps
  if (step === profileStep) {
    const profileDisplayMap: Record<string, string> = {
      high_school: 'High school student',
      university: 'University student / graduate',
      specialized_training: 'Trade school or vocational training',
      employed: 'Employed',
      unemployed: 'Unemployed'
    };
    return (
      <StepContainer title="Which describes you the best?" isValid={answers.careerContext.profile !== ''}>
        <RadioGroup
          options={['High school student', 'University student / graduate', 'Trade school or vocational training', 'Employed', 'Unemployed']}
          selected={profileDisplayMap[answers.careerContext?.profile] || ''}
          onChange={(val: string) => {
            const profileMap: Record<string, string> = {
              'High school student': 'high_school',
              'University student / graduate': 'university',
              'Trade school or vocational training': 'specialized_training',
              'Employed': 'employed',
              'Unemployed': 'unemployed'
            };
            setAnswers(prev => ({ ...prev, careerContext: { profile: profileMap[val], subAnswers: {} } }));
          }}
        />
      </StepContainer>
    );
  }

  if (step === followUp1Step) {
    if (profile === 'high_school') {
      return (<StepContainer title="How soon do you plan to start thinking seriously about your career path?"><RadioGroup options={['Within the next year', 'Before I graduate high school', 'After graduation', "I'm already thinking about it"]} selected={answers.careerContext?.subAnswers?.highSchoolTiming || ''} onChange={(val: string) => setAnswers(prev => ({ ...prev, careerContext: { ...prev.careerContext, subAnswers: { ...prev.careerContext.subAnswers, highSchoolTiming: val } } }))} /></StepContainer>);
    }
    if (profile === 'university') {
      return (<StepContainer title="What is your current status regarding a career?"><RadioGroup options={['Still exploring majors/careers', 'Chosen a career path but not yet specialized', 'Actively preparing for a specific job field', 'Graduated and job searching']} selected={answers.careerContext?.subAnswers?.universityStatus || ''} onChange={(val: string) => setAnswers(prev => ({ ...prev, careerContext: { ...prev.careerContext, subAnswers: { ...prev.careerContext.subAnswers, universityStatus: val } } }))} /></StepContainer>);
    }
    if (profile === 'specialized_training') {
      return (<StepContainer title="Are you currently in training for a specific career?"><RadioGroup options={["Yes, and I'm committed to it", 'Yes, but still considering other options', 'No, just exploring', 'Finished training, now choosing job']} selected={answers.careerContext?.subAnswers?.trainingStatus || ''} onChange={(val: string) => setAnswers(prev => ({ ...prev, careerContext: { ...prev.careerContext, subAnswers: { ...prev.careerContext.subAnswers, trainingStatus: val } } }))} /></StepContainer>);
    }
    if (profile === 'employed') {
      return (<StepContainer title="Why are you looking at career choice questions if already employed?"><RadioGroup options={['Considering a career change', 'Unsatisfied with current career', 'Want to advance in same field', 'Just curious about options']} selected={answers.careerContext?.subAnswers?.employedReason || ''} onChange={(val: string) => setAnswers(prev => ({ ...prev, careerContext: { ...prev.careerContext, subAnswers: { ...prev.careerContext.subAnswers, employedReason: val } } }))} /></StepContainer>);
    }
    if (profile === 'unemployed') {
      return (<StepContainer title="Is your unemployment..."><RadioGroup options={['Recently unemployed, actively looking', 'Long‑term unemployed', 'Choosing first career after studies', 'Re‑entering workforce after break']} selected={answers.careerContext?.subAnswers?.unemployedStatus || ''} onChange={(val: string) => setAnswers(prev => ({ ...prev, careerContext: { ...prev.careerContext, subAnswers: { ...prev.careerContext.subAnswers, unemployedStatus: val } } }))} /></StepContainer>);
    }
    return <StepContainer title="Error">Please go back and select a profile.</StepContainer>;
  }

  if (step === followUp2Step) {
    if (profile === 'high_school') {
      return (<StepContainer title="Which best describes your current career planning stage?"><RadioGroup options={['No idea yet', 'A few broad interests', 'A specific career in mind', 'Already taking related courses/activities']} selected={answers.careerContext?.subAnswers?.highSchoolStage || ''} onChange={(val: string) => setAnswers(prev => ({ ...prev, careerContext: { ...prev.careerContext, subAnswers: { ...prev.careerContext.subAnswers, highSchoolStage: val } } }))} /></StepContainer>);
    }
    if (profile === 'university') {
      return (<StepContainer title="The biggest challenge you face in choosing a career is:"><RadioGroup options={['Too many options', "Not knowing what I'll enjoy long‑term", 'Worry about job market/salary', 'Lack of real‑world experience']} selected={answers.careerContext?.subAnswers?.universityChallenge || ''} onChange={(val: string) => setAnswers(prev => ({ ...prev, careerContext: { ...prev.careerContext, subAnswers: { ...prev.careerContext.subAnswers, universityChallenge: val } } }))} /></StepContainer>);
    }
    if (profile === 'specialized_training') {
      return (<StepContainer title="What matters most to you in a career after training?"><RadioGroup options={['Job stability', 'High salary immediately', 'Ability to advance without another degree', 'Work‑life balance']} selected={answers.careerContext?.subAnswers?.trainingPriority || ''} onChange={(val: string) => setAnswers(prev => ({ ...prev, careerContext: { ...prev.careerContext, subAnswers: { ...prev.careerContext.subAnswers, trainingPriority: val } } }))} /></StepContainer>);
    }
    if (profile === 'employed') {
      return (<StepContainer title="What is the main issue with your current career?"><RadioGroup options={['Low pay', 'No growth opportunities', 'Poor fit with my personality/interests', 'Stress or burnout']} selected={answers.careerContext?.subAnswers?.employedIssue || ''} onChange={(val: string) => setAnswers(prev => ({ ...prev, careerContext: { ...prev.careerContext, subAnswers: { ...prev.careerContext.subAnswers, employedIssue: val } } }))} /></StepContainer>);
    }
    if (profile === 'unemployed') {
      return (<StepContainer title="What is the biggest barrier to choosing a career right now?"><RadioGroup options={['Lack of skills / qualifications', 'No clear interests', 'Health or personal issues', 'Few jobs available locally']} selected={answers.careerContext?.subAnswers?.unemployedBarrier || ''} onChange={(val: string) => setAnswers(prev => ({ ...prev, careerContext: { ...prev.careerContext, subAnswers: { ...prev.careerContext.subAnswers, unemployedBarrier: val } } }))} /></StepContainer>);
    }
    return <StepContainer title="Error">Please go back and select a profile.</StepContainer>;
  }

  if (step === followUp3Step) {
    if (profile === 'high_school') {
      return (<StepContainer title="What would help you most right now with career choices?"><RadioGroup options={['Career quizzes / self‑assessments', 'Talking to professionals', 'Internship or job shadowing opportunities', 'Advice from school counselors']} selected={answers.careerContext?.subAnswers?.highSchoolHelp || ''} onChange={(val: string) => setAnswers(prev => ({ ...prev, careerContext: { ...prev.careerContext, subAnswers: { ...prev.careerContext.subAnswers, highSchoolHelp: val } } }))} /></StepContainer>);
    }
    if (profile === 'university') {
      return (<StepContainer title="What career support do you need most right now?"><RadioGroup options={['Resume/interview prep', 'Finding internships or entry‑level roles', 'Mentorship in my field', 'Understanding career progression paths']} selected={answers.careerContext?.subAnswers?.universitySupport || ''} onChange={(val: string) => setAnswers(prev => ({ ...prev, careerContext: { ...prev.careerContext, subAnswers: { ...prev.careerContext.subAnswers, universitySupport: val } } }))} /></StepContainer>);
    }
    if (profile === 'specialized_training') {
      return (<StepContainer title="Which factor would make you switch career paths despite training?"><RadioGroup options={['Better pay elsewhere', 'Burnout risk in trained field', 'Lack of jobs in trained field', 'Discovering a new passion']} selected={answers.careerContext?.subAnswers?.trainingSwitch || ''} onChange={(val: string) => setAnswers(prev => ({ ...prev, careerContext: { ...prev.careerContext, subAnswers: { ...prev.careerContext.subAnswers, trainingSwitch: val } } }))} /></StepContainer>);
    }
    if (profile === 'employed') {
      return (<StepContainer title="What would most help you choose a different career?"><RadioGroup options={['Skills assessment', 'Understanding transferable skills', 'Learning about new industries', 'Part‑time training while working']} selected={answers.careerContext?.subAnswers?.employedHelp || ''} onChange={(val: string) => setAnswers(prev => ({ ...prev, careerContext: { ...prev.careerContext, subAnswers: { ...prev.careerContext.subAnswers, employedHelp: val } } }))} /></StepContainer>);
    }
    if (profile === 'unemployed') {
      return (<StepContainer title="Which would help you most with career choice today?"><RadioGroup options={['Free career counseling', 'Short training programs', 'Help with job search strategy', 'Assessment of my strengths']} selected={answers.careerContext?.subAnswers?.unemployedHelp || ''} onChange={(val: string) => setAnswers(prev => ({ ...prev, careerContext: { ...prev.careerContext, subAnswers: { ...prev.careerContext.subAnswers, unemployedHelp: val } } }))} /></StepContainer>);
    }
    return <StepContainer title="Error">Please go back and select a profile.</StepContainer>;
  }

  // ---------- NEW MULTIPLE-CHOICE AND OPEN-ENDED STEPS ----------
  if (step === salaryStep) {
    return (
      <StepContainer title="What level of salary are you aiming for in your career?">
        <RadioGroup
          options={[
            'Comfortable living – I don\'t need much',
            'Good average salary – like most people in my job',
            'Above average – better than most',
            'High income – top earner level',
            'Wealthy – millionaire or more'
          ]}
          selected={answers.salaryAim}
          onChange={(val: string) => update('salaryAim', val)}
        />
      </StepContainer>
    );
  }
  if (step === relocateStep) {
    return (
      <StepContainer title="How willing are you to relocate for a job?">
        <RadioGroup
          options={['Not willing (stay in my city)', 'Willing within my region', 'Willing anywhere in my country', 'Willing to move abroad']}
          selected={answers.relocateWillingness}
          onChange={(val: string) => update('relocateWillingness', val)}
        />
      </StepContainer>
    );
  }
  if (step === remoteStep) {
    return (
      <StepContainer title="How do you feel about remote work?">
        <RadioGroup
          options={['Must be fully remote', 'Prefer hybrid (2–3 days in office)', 'Prefer fully in‑office', 'No preference']}
          selected={answers.remoteWork}
          onChange={(val: string) => update('remoteWork', val)}
        />
      </StepContainer>
    );
  }
  if (step === scheduleStep) {
    return (
      <StepContainer title="What is your preferred work schedule?">
        <RadioGroup
          options={['Standard 9–5', 'Flexible hours (core hours only)', 'Shift work (evenings/nights/weekends)', 'Compressed workweek (4x10h)', 'No preference']}
          selected={answers.workSchedule}
          onChange={(val: string) => update('workSchedule', val)}
        />
      </StepContainer>
    );
  }
  if (step === securityStep) {
    return (
      <StepContainer title="How important is job security to you?">
        <RadioGroup
          options={['Extremely important (stable industry, government, etc.)', 'Somewhat important', 'Not important (willing to take risks)']}
          selected={answers.jobSecurity}
          onChange={(val: string) => update('jobSecurity', val)}
        />
      </StepContainer>
    );
  }
  if (step === travelStep) {
    return (
      <StepContainer title="How do you feel about travel as part of your job?">
        <RadioGroup
          options={['Never travel', 'Occasional (a few times a year)', 'Frequent (weekly)', 'Love it, open to 50%+ travel']}
          selected={answers.travelPreference}
          onChange={(val: string) => update('travelPreference', val)}
        />
      </StepContainer>
    );
  }
  if (step === teamStep) {
    return (
      <StepContainer title="Which of these best describes your ideal team environment?">
        <RadioGroup
          options={['I work best alone', 'Small, tight‑knit team', 'Large, collaborative team', 'I like leading a team']}
          selected={answers.teamEnvironment}
          onChange={(val: string) => update('teamEnvironment', val)}
        />
      </StepContainer>
    );
  }
  if (step === criticismStep) {
    return (
      <StepContainer title="How do you handle criticism?">
        <RadioGroup
          options={['Use it to improve', 'Find it difficult but accept it', 'Prefer positive feedback only', 'Not sure', 'I can\'t stand it']}
          selected={answers.criticismHandling}
          onChange={(val: string) => update('criticismHandling', val)}
        />
      </StepContainer>
    );
  }
  if (step === dreamJobStep) {
    return (
      <StepContainer title="What is your dream job? (Write a short description. If you don't know it exactly, write the most important features your job should or shouldn't have)">
        <textarea
          key="dreamJob"
          defaultValue={answers.dreamJob}
          onBlur={(e) => update('dreamJob', e.target.value)}
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg bg-black/30 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g., 'I want to work with animals and travel', or 'I don't want a desk job, I want to be outdoors'"
        />
      </StepContainer>
    );
  }
  if (step === topValuesStep) {
    return (
      <StepContainer title="What are the top 3 things you value most in a career? (e.g., money, freedom, helping others, creativity)">
        <textarea
          key="topValues"
          defaultValue={answers.topValues}
          onBlur={(e) => update('topValues', e.target.value)}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg bg-black/30 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g., '1. Helping others, 2. Creativity, 3. Job security'"
        />
      </StepContainer>
    );
  }
  if (step === fulfillingStep) {
    return (
      <StepContainer title="Describe a time you felt truly fulfilled in a work or school project">
        <textarea
          key="fulfillingProject"
          defaultValue={answers.fulfillingProject}
          onBlur={(e) => update('fulfillingProject', e.target.value)}
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg bg-black/30 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="What did you do? Why did it feel meaningful?"
        />
      </StepContainer>
    );
  }
  if (step === pastConsiderationsStep) {
    return (
      <StepContainer title="What career(s) have you considered before? Why did you consider them? Why did you get discouraged from them, if you got discouraged?">
        <textarea
          key="pastConsiderations"
          defaultValue={answers.pastConsiderations}
          onBlur={(e) => update('pastConsiderations', e.target.value)}
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg bg-black/30 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g., 'I thought about becoming a doctor because I like helping people, but I'm not good with blood.'"
        />
      </StepContainer>
    );
  }

  if (step === finalSubmitStep) {
    return (
      <div className={containerClasses}>
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <h1 className="text-3xl font-bold text-white">CareerBridge Way</h1>
            </div>
            <span className="text-sm font-medium text-gray-300 block mb-4">Ready to see your results?</span>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
          <div className="glass-card">
            <p className="text-center text-gray-200 mb-6">You've answered all questions.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={prevStep} className={buttonSecondaryClasses}>← Back</button>
              <button onClick={handleSubmit} disabled={loading} className={buttonPrimaryClasses}>
                {loading ? '✨ Calculating...' : '🚀 See My Results'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div>Unknown step: {step}</div>;
}