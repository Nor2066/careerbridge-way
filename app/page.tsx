'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';

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
};

const SUBJECTS = [
  'Mathematics', 'Sciences', 'Technology / Computing', 'Business / Economics',
  'Social Sciences', 'Arts / Humanities', 'Creative Fields', 'Languages'
];

const ACTIVITIES = [
  'Solving problems', 'Experiments / Hands-on', 'Designing / Creating',
  'Reading / Analyzing', 'Helping people', 'Building / Using tech',
  'Leading / Organizing', 'Coding / Programming', 'Making / Building things',
  'Teaching / Explaining', 'Advocating / Raising awareness'
];

const SKILL_NAMES = [
  { id: 'logicalReasoning', label: 'Logical Reasoning' },
  { id: 'creativity', label: 'Creativity' },
  { id: 'communication', label: 'Communication' },
  { id: 'workingWithData', label: 'Working with Data' },
  { id: 'manualSkills', label: 'Manual Skills' },
  { id: 'teamwork', label: 'Teamwork' },
  { id: 'criticalThinking', label: 'Critical Thinking' },
  { id: 'timeManagement', label: 'Time Management' },
  { id: 'uncertaintyComfort', label: 'Uncertainty Comfort' },
  { id: 'financialRiskComfort', label: 'Financial Risk Comfort' },
  { id: 'pressureTolerance', label: 'Pressure Tolerance' },
  { id: 'empathy', label: 'Empathy / Emotional Intelligence' },
  { id: 'artistic', label: 'Artistic / Visual Thinking' },
  { id: 'mechanical', label: 'Mechanical / Spatial Reasoning' },
  { id: 'organization', label: 'Organization / Attention to Detail' },
  { id: 'adaptability', label: 'Adaptability / Flexibility' },
  { id: 'physicalStamina', label: 'Physical Stamina / Endurance' }
];

const THINKING_STYLES = ['Right/Wrong', 'Open-ended', 'Mix'];
const LEARNING_STYLES = ['Hands-on', 'Reading & Theory', 'Visual / Creative', 'Group Discussion', 'Independent Study'];
const MOTIVATIONS = [
  'High Earning', 'Helping / Impact', 'Creativity', 'Stability', 'Research',
  'Working with Tech', 'Leadership', 'Self-Realization', 'Creation (Physical/Mental)'
];
const WHAT_MATTERS = ['Work-Life Balance', 'Career Growth', 'Meaningful Impact', 'Financial Independence', 'Autonomy'];
const SOCIAL_PREFERENCES = ['Energized by Many People', 'Small Groups', 'One-on-One', 'Working Alone'];
const WORK_ENVIRONMENTS = ['Structured', 'Fast-Paced', 'Independent', 'Collaborative', 'Competitive', 'Calm'];
const JOB_TYPES = [
  'Research job', 'Healthcare job', 'Entrepreneurial', 'Hands-on trade',
  'Transport / logistics', 'Business role', 'IT role', 'Engineering role',
  'Education role', 'Creative role', 'Social impact role', 'Analytical/data role'
];

export default function Home() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [submittedAnswers, setSubmittedAnswers] = useState<any>(null);
  const [answers, setAnswers] = useState<Answers>({
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
    dealbreakerJobs: []
  });

  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Load saved progress when user logs in
  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return;
      try {
        const res = await fetch(`/api/load-progress?userId=${user.id}`);
        const data = await res.json();
        if (data.answers && data.step !== undefined) {
          setAnswers(data.answers);
          setStep(data.step);
        }
      } catch (err) {
        console.error('Failed to load progress:', err);
      }
    };
    loadProgress();
  }, [user]);

  // Auto-save function
  const autoSave = async (currentAnswers: Answers, currentStep: number) => {
    if (!user) return;
    try {
      await fetch('/api/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          answers: currentAnswers,
          step: currentStep,
        }),
      });
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  };

  // Debounced auto-save
  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      autoSave(answers, step);
    }, 1000);
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [answers, step, user]);

  const update = (field: keyof Answers, value: any) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const updateSkill = (skillId: keyof Answers['skills'], value: number) => {
    setAnswers(prev => ({
      ...prev,
      skills: { ...prev.skills, [skillId]: value }
    }));
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    const payload = {
      ...answers,
      studyHours: answers.studyHours === 'YES',
      academicLevel: Number(answers.academicLevel),
    };

    setSubmittedAnswers(payload);

    const res = await fetch('/api/assess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  const containerClasses = "min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4";
  const cardClasses = "bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700";
  const buttonPrimaryClasses = "px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed";
  const buttonSecondaryClasses = "px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all";

  // ----- Result display block (no change needed, keep as is) -----
  if (result) {
    const FeedbackForm = () => {
      const [email, setEmail] = useState('');
      const [feedbackRating, setFeedbackRating] = useState(0);
      const [feedbackComment, setFeedbackComment] = useState('');
      const [saved, setSaved] = useState(false);
      const [saving, setSaving] = useState(false);

      const saveToSupabase = async () => {
        const finalEmail = user ? user.email : email;
        if (!finalEmail) {
          alert('Please enter your email');
          return;
        }
        if (feedbackRating === 0) {
          alert('Please rate your experience');
          return;
        }
        setSaving(true);
        try {
          const payload = {
            email: finalEmail,
            userId: user?.id || null,
            feedbackRating,
            feedbackComment,
            topClusters: result.top3,
            rawScores: result.rawScores,
            answers: submittedAnswers,
          };
          const res = await fetch('/api/save-result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            setSaved(true);
          } else {
            const responseData = await res.json();
            alert(`Something went wrong: ${responseData.error || 'Unknown error'}`);
          }
        } catch (err) {
          alert('Network error. Please try again.');
        } finally {
          setSaving(false);
        }
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
            <button onClick={() => setResult(null)} className={buttonPrimaryClasses}>
              Take Assessment Again
            </button>
          </div>
        );
      }

      return (
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Help us improve</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">Leave your feedback to help us improve CareerBridge Way.</p>

          <div className="space-y-6">
            {!user && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="you@example.com"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">How accurate were your results? *</label>
              <div className="flex gap-3 justify-center">
                {[1, 2, 3, 4, 5].map(r => (
                  <button
                    key={r}
                    onClick={() => setFeedbackRating(r)}
                    className={`w-12 h-12 rounded-full font-bold transition-all ${
                      feedbackRating === r
                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg scale-110'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comments (optional)</label>
              <textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="What did you think? Any suggestions?"
              />
            </div>

            <button onClick={saveToSupabase} disabled={saving} className={buttonPrimaryClasses + " w-full"}>
              {saving ? 'Saving...' : 'Submit Feedback & Get Results'}
            </button>
          </div>
        </div>
      );
    };

    return (
      <div className={containerClasses}>
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              CareerBridge Way
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Your personalized career assessment results</p>
          </div>

          <div className={`${cardClasses} p-8 mb-8`}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Your Top 3 Career Clusters</h2>
            <ul className="space-y-4">
              {result.top3.map((item: any, idx: number) => (
                <li key={idx} className="bg-gray-50 dark:bg-slate-700 p-5 rounded-xl">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-gray-900 dark:text-white text-lg">{item.cluster}</span>
                    <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text font-bold text-xl">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-3">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all" style={{ width: `${item.percentage}%` }}></div>
                  </div>
                </li>
              ))}
            </ul>
            {result.warningMessage && (
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-200">
                ⚠️ {result.warningMessage}
              </div>
            )}
          </div>

          <div className={`${cardClasses} p-8`}>
            <FeedbackForm />
          </div>
        </div>
      </div>
    );
  }

  // ----- Helper components for steps -----
  const StepContainer = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className={containerClasses}>
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">CareerBridge Way</h1>
          </div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-4">
            Step {step + 1} of {2 + SKILL_NAMES.length + 10}
          </span>
          <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all" style={{ width: `${((step + 1) / (2 + SKILL_NAMES.length + 10)) * 100}%` }}></div>
          </div>
        </div>

        <div className={`${cardClasses} p-8`}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">{title}</h2>
          {children}

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            {step > 0 && (
              <button onClick={prevStep} className={buttonSecondaryClasses}>
                ← Back
              </button>
            )}
            <button onClick={nextStep} className={buttonPrimaryClasses}>
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const CheckboxGroup = ({ options, selected, onChange, maxSelections }: any) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((option: string) => (
        <label key={option} className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors bg-gray-50 dark:bg-slate-700">
          <input
            type="checkbox"
            checked={selected.includes(option)}
            onChange={(e) => {
              if (e.target.checked && selected.length < maxSelections) {
                onChange([...selected, option]);
              } else if (!e.target.checked) {
                onChange(selected.filter((x: string) => x !== option));
              }
            }}
            className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
          />
          <span className="ml-3 text-gray-900 dark:text-white font-medium">{option}</span>
        </label>
      ))}
    </div>
  );

  const RadioGroup = ({ options, selected, onChange }: any) => (
    <div className="space-y-3">
      {options.map((option: string) => (
        <label key={option} className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors bg-gray-50 dark:bg-slate-700">
          <input
            type="radio"
            checked={selected === option}
            onChange={() => onChange(option)}
            className="w-5 h-5 text-indigo-600 cursor-pointer"
          />
          <span className="ml-3 text-gray-900 dark:text-white font-medium">{option}</span>
        </label>
      ))}
    </div>
  );

  const RatingButtons = ({ ratings, selected, onChange }: any) => (
    <div className="flex gap-4 justify-center flex-wrap">
      {ratings.map((r: number) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`w-14 h-14 rounded-full font-bold transition-all ${
            selected === r
              ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg scale-110'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );

  // ----- Step rendering -----
  if (step === 0) {
    return (
      <StepContainer title="Which subjects do you enjoy the most? (Pick up to 3)">
        <CheckboxGroup
          options={SUBJECTS}
          selected={answers.subjects}
          onChange={(val: string[]) => update('subjects', val)}
          maxSelections={3}
        />
      </StepContainer>
    );
  }

  if (step === 1) {
    return (
      <StepContainer title="Which activities do you prefer? (Pick up to 3)">
        <CheckboxGroup
          options={ACTIVITIES}
          selected={answers.activities}
          onChange={(val: string[]) => update('activities', val)}
          maxSelections={3}
        />
      </StepContainer>
    );
  }

  if (step >= 2 && step < 2 + SKILL_NAMES.length) {
    const skillIndex = step - 2;
    const skill = SKILL_NAMES[skillIndex];
    const currentRating = answers.skills[skill.id as keyof Answers['skills']];
    return (
      <StepContainer title={`Rate your ${skill.label} (1-5)`}>
        <RatingButtons
          ratings={[1, 2, 3, 4, 5]}
          selected={currentRating}
          onChange={(val: number) => updateSkill(skill.id as keyof Answers['skills'], val)}
        />
      </StepContainer>
    );
  }

  let stepOffset = 2 + SKILL_NAMES.length;

  if (step === stepOffset) {
    return (
      <StepContainer title="Which describes you better?">
        <RadioGroup
          options={THINKING_STYLES}
          selected={answers.thinkingStyle}
          onChange={(val: string) => update('thinkingStyle', val)}
        />
      </StepContainer>
    );
  }

  stepOffset++;
  if (step === stepOffset) {
    return (
      <StepContainer title="How do you learn best?">
        <RadioGroup
          options={LEARNING_STYLES}
          selected={answers.learningStyle}
          onChange={(val: string) => update('learningStyle', val)}
        />
      </StepContainer>
    );
  }

  stepOffset++;
  if (step === stepOffset) {
    return (
      <StepContainer title="What motivates you most? (Pick up to 2)">
        <CheckboxGroup
          options={MOTIVATIONS}
          selected={answers.motivations}
          onChange={(val: string[]) => update('motivations', val)}
          maxSelections={2}
        />
      </StepContainer>
    );
  }

  stepOffset++;
  if (step === stepOffset) {
    return (
      <StepContainer title="Which matters more to you?">
        <RadioGroup
          options={WHAT_MATTERS}
          selected={answers.whatMattersMore}
          onChange={(val: string) => update('whatMattersMore', val)}
        />
      </StepContainer>
    );
  }

  stepOffset++;
  if (step === stepOffset) {
    return (
      <StepContainer title="Are you comfortable with studying for long hours?">
        <RadioGroup
          options={['YES', 'NO']}
          selected={answers.studyHours}
          onChange={(val: string) => update('studyHours', val)}
        />
      </StepContainer>
    );
  }

  stepOffset++;
  if (step === stepOffset) {
    return (
      <StepContainer title="How far would you like to go academically?">
        <RatingButtons
          ratings={[1, 2, 3, 4, 5]}
          selected={answers.academicLevel}
          onChange={(val: number) => update('academicLevel', val)}
        />
      </StepContainer>
    );
  }

  stepOffset++;
  if (step === stepOffset) {
    return (
      <StepContainer title="In social situations, you usually prefer?">
        <RadioGroup
          options={SOCIAL_PREFERENCES}
          selected={answers.socialPreference}
          onChange={(val: string) => update('socialPreference', val)}
        />
      </StepContainer>
    );
  }

  stepOffset++;
  if (step === stepOffset) {
    return (
      <StepContainer title="Which work environment fits you best? (Pick up to 2)">
        <CheckboxGroup
          options={WORK_ENVIRONMENTS}
          selected={answers.workEnvironment}
          onChange={(val: string[]) => update('workEnvironment', val)}
          maxSelections={2}
        />
      </StepContainer>
    );
  }

  stepOffset++;
  if (step === stepOffset) {
    return (
      <StepContainer title="Which job types interest you?">
        <CheckboxGroup
          options={JOB_TYPES}
          selected={answers.jobVision}
          onChange={(val: string[]) => update('jobVision', val)}
          maxSelections={Infinity}
        />
      </StepContainer>
    );
  }

  stepOffset++;
  // Final step: dealbreakers
  return (
    <div className={containerClasses}>
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">CareerBridge Way</h1>
          </div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-4">Final Step</span>
          <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className={`${cardClasses} p-8`}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">What job types would you avoid?</h2>
          <CheckboxGroup
            options={JOB_TYPES}
            selected={answers.dealbreakerJobs}
            onChange={(val: string[]) => update('dealbreakerJobs', val)}
            maxSelections={Infinity}
          />

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={prevStep} className={buttonSecondaryClasses}>
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={buttonPrimaryClasses}
            >
              {loading ? '✨ Calculating...' : '🚀 See My Results'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}