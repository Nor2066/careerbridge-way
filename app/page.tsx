'use client';

import { useState } from 'react';

type Answers = {
  // Section 1
  subjects: string[];
  activities: string[];
  // Section 2 – Skills (16 items)
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
  studyHours: string;      // "YES" or "NO"
  academicLevel: number;
  socialPreference: string;
  workEnvironment: string[];
  jobVision: string[];
  dealbreakerJobs: string[];
};

// All options – copy exactly from your Google Form
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

  const update = (field: keyof Answers, value: any) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const updateSkill = (skillId: keyof Answers['skills'], value: number) => {
    setAnswers(prev => ({
      ...prev,
      skills: { ...prev.skills, [skillId]: value }
    }));
  };

  const totalSteps = 12; // we'll break into logical sections

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    // Convert studyHours to boolean
    const payload = {
      ...answers,
      studyHours: answers.studyHours === 'YES',
      academicLevel: Number(answers.academicLevel),
    };

    // Save a copy of the payload for later (this is the key addition)
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

if (result) {
  // We'll define the feedback component inside, but it's actually safe because it's a functional component
  const FeedbackForm = () => {
    const [email, setEmail] = useState('');
    const [feedbackRating, setFeedbackRating] = useState(0);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    const saveToSupabase = async () => {
      if (!email) {
        alert('Please enter your email');
        return;
      }
      if (feedbackRating === 0) {
        alert('Please rate your experience');
        return;
      }
      setSaving(true);
      try {
        const res = await fetch('/api/save-result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            feedbackRating,
            feedbackComment,
            topClusters: result.top3,
            rawScores: result.rawScores,
            answers: submittedAnswers,  // 👈 This is the key – we use submittedAnswers
          }),
        });
        if (res.ok) {
          setSaved(true);
        } else {
          alert('Something went wrong. Please try again.');
        }
      } catch (err) {
        alert('Network error. Please try again.');
      } finally {
        setSaving(false);
      }
    };

    if (saved) {
      return (
        <div className="text-center">
          <p className="text-green-600">Thank you for your feedback!</p>
          <button
            onClick={() => setResult(null)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Take Assessment Again
          </button>
        </div>
      );
    }

    return (
      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-semibold">Help us improve</h3>
        <p className="text-sm text-gray-600 mb-4">Leave your email and feedback (it helps us make CareerBridge Way better).</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-2 border rounded"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">How accurate were your results? *</label>
            <div className="flex gap-2 mt-1">
              {[1,2,3,4,5].map(r => (
                <button
                  key={r}
                  onClick={() => setFeedbackRating(r)}
                  className={`w-10 h-10 rounded-full ${
                    feedbackRating === r ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Comments (optional)</label>
            <textarea
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              rows={3}
              className="mt-1 w-full p-2 border rounded"
              placeholder="What did you think? Any suggestions?"
            />
          </div>

          <button
            onClick={saveToSupabase}
            disabled={saving}
            className="w-full px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Submit Feedback & Get Results'}
          </button>
        </div>
      </div>
    );
  };

  // Main results view (without hooks inside)
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold">CareerBridge Way</h1>
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Your Top 3 Career Clusters</h2>
        <ul className="mt-2 space-y-3">
          {result.top3.map((item: any, idx: number) => (
            <li key={idx} className="p-4 border rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                <span className="font-medium">{item.cluster}</span>
                <span className="text-blue-600 font-bold">{item.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${item.percentage}%` }}></div>
              </div>
            </li>
          ))}
        </ul>
        {result.warningMessage && (
          <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded">
            ⚠️ {result.warningMessage}
          </div>
        )}
      </div>
      <FeedbackForm />
    </div>
  );
}
  // ----- Step 0: Subjects -----
  if (step === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-xl font-bold">Which subjects do you enjoy the most? (Pick up to 3)</h2>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {SUBJECTS.map(s => (
            <label key={s} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={answers.subjects.includes(s)}
                onChange={e => {
                  if (e.target.checked && answers.subjects.length < 3) {
                    update('subjects', [...answers.subjects, s]);
                  } else if (!e.target.checked) {
                    update('subjects', answers.subjects.filter(x => x !== s));
                  }
                }}
              />
              <span>{s}</span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={nextStep} className="px-4 py-2 bg-blue-600 text-white rounded">
            Next
          </button>
        </div>
      </div>
    );
  }

  // ----- Step 1: Activities -----
  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-xl font-bold">Which activities do you prefer? (Pick up to 3)</h2>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {ACTIVITIES.map(a => (
            <label key={a} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={answers.activities.includes(a)}
                onChange={e => {
                  if (e.target.checked && answers.activities.length < 3) {
                    update('activities', [...answers.activities, a]);
                  } else if (!e.target.checked) {
                    update('activities', answers.activities.filter(x => x !== a));
                  }
                }}
              />
              <span>{a}</span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          <button onClick={prevStep} className="px-4 py-2 bg-gray-300 rounded">Back</button>
          <button onClick={nextStep} className="px-4 py-2 bg-blue-600 text-white rounded">Next</button>
        </div>
      </div>
    );
  }

  // ----- Steps 2-? Skills (one per step) -----
  if (step >= 2 && step < 2 + SKILL_NAMES.length) {
    const skillIndex = step - 2;
    const skill = SKILL_NAMES[skillIndex];
    const currentRating = answers.skills[skill.id as keyof Answers['skills']];
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-xl font-bold">Rate your confidence: {skill.label} (1-5)</h2>
        <div className="flex gap-4 mt-6 justify-center">
          {[1,2,3,4,5].map(r => (
            <button
              key={r}
              onClick={() => updateSkill(skill.id as keyof Answers['skills'], r)}
              className={`w-12 h-12 rounded-full text-lg font-bold ${
                currentRating === r ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          <button onClick={prevStep} className="px-4 py-2 bg-gray-300 rounded">Back</button>
          <button onClick={nextStep} className="px-4 py-2 bg-blue-600 text-white rounded">
            {skillIndex === SKILL_NAMES.length - 1 ? 'Next' : 'Next'}
          </button>
        </div>
      </div>
    );
  }

  // Step after skills: Thinking Style
  let stepOffset = 2 + SKILL_NAMES.length;
  if (step === stepOffset) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-xl font-bold">Which describes you better?</h2>
        <div className="mt-4 space-y-2">
          {THINKING_STYLES.map(opt => (
            <label key={opt} className="flex items-center space-x-2">
              <input
                type="radio"
                name="thinkingStyle"
                checked={answers.thinkingStyle === opt}
                onChange={() => update('thinkingStyle', opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          <button onClick={prevStep} className="px-4 py-2 bg-gray-300 rounded">Back</button>
          <button onClick={nextStep} className="px-4 py-2 bg-blue-600 text-white rounded">Next</button>
        </div>
      </div>
    );
  }

  stepOffset++;
  if (step === stepOffset) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-xl font-bold">How do you learn best? (Pick 1)</h2>
        <div className="mt-4 space-y-2">
          {LEARNING_STYLES.map(opt => (
            <label key={opt} className="flex items-center space-x-2">
              <input
                type="radio"
                name="learningStyle"
                checked={answers.learningStyle === opt}
                onChange={() => update('learningStyle', opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          <button onClick={prevStep} className="px-4 py-2 bg-gray-300 rounded">Back</button>
          <button onClick={nextStep} className="px-4 py-2 bg-blue-600 text-white rounded">Next</button>
        </div>
      </div>
    );
  }

  stepOffset++;
  if (step === stepOffset) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-xl font-bold">What motivates you most? (Pick up to 2)</h2>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {MOTIVATIONS.map(m => (
            <label key={m} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={answers.motivations.includes(m)}
                onChange={e => {
                  if (e.target.checked && answers.motivations.length < 2) {
                    update('motivations', [...answers.motivations, m]);
                  } else if (!e.target.checked) {
                    update('motivations', answers.motivations.filter(x => x !== m));
                  }
                }}
              />
              <span>{m}</span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          <button onClick={prevStep} className="px-4 py-2 bg-gray-300 rounded">Back</button>
          <button onClick={nextStep} className="px-4 py-2 bg-blue-600 text-white rounded">Next</button>
        </div>
      </div>
    );
  }

  stepOffset++;
  if (step === stepOffset) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-xl font-bold">Which matters more to you? (Pick 1)</h2>
        <div className="mt-4 space-y-2">
          {WHAT_MATTERS.map(opt => (
            <label key={opt} className="flex items-center space-x-2">
              <input
                type="radio"
                name="whatMatters"
                checked={answers.whatMattersMore === opt}
                onChange={() => update('whatMattersMore', opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          <button onClick={prevStep} className="px-4 py-2 bg-gray-300 rounded">Back</button>
          <button onClick={nextStep} className="px-4 py-2 bg-blue-600 text-white rounded">Next</button>
        </div>
      </div>
    );
  }

  stepOffset++;
  if (step === stepOffset) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-xl font-bold">Are you comfortable with studying for long hours?</h2>
        <div className="mt-4 space-y-2">
          <label className="flex items-center space-x-2">
            <input type="radio" name="studyHours" checked={answers.studyHours === 'YES'} onChange={() => update('studyHours', 'YES')} />
            <span>YES</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="radio" name="studyHours" checked={answers.studyHours === 'NO'} onChange={() => update('studyHours', 'NO')} />
            <span>NO</span>
          </label>
        </div>
        <div className="mt-6 flex justify-between">
          <button onClick={prevStep} className="px-4 py-2 bg-gray-300 text-gray-800 rounded">Back</button>
          <button onClick={nextStep} className="px-4 py-2 bg-blue-600 text-white rounded">Next</button>
        </div>
      </div>
    );
  }

  stepOffset++;
  if (step === stepOffset) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-xl font-bold">How far would you like to go academically? (1-5)</h2>
        <div className="flex gap-4 mt-6 justify-center">
          {[1,2,3,4,5].map(r => (
            <button
              key={r}
              onClick={() => update('academicLevel', r)}
              className={`w-12 h-12 rounded-full text-lg font-bold ${
                answers.academicLevel === r ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          <button onClick={prevStep} className="px-4 py-2 bg-gray-300 text-gray-800 rounded">Back</button>
          <button onClick={nextStep} className="px-4 py-2 bg-blue-600 text-white rounded">Next</button>
        </div>
      </div>
    );
  }

  stepOffset++;
  if (step === stepOffset) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-xl font-bold">In social situations, you usually prefer: (Pick 1)</h2>
        <div className="mt-4 space-y-2">
          {SOCIAL_PREFERENCES.map(opt => (
            <label key={opt} className="flex items-center space-x-2">
              <input
                type="radio"
                name="socialPref"
                checked={answers.socialPreference === opt}
                onChange={() => update('socialPreference', opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          <button onClick={prevStep} className="px-4 py-2 bg-gray-300 text-gray-800 rounded">Back</button>
          <button onClick={nextStep} className="px-4 py-2 bg-blue-600 text-white rounded">Next</button>
        </div>
      </div>
    );
  }

  stepOffset++;
  if (step === stepOffset) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-xl font-bold">Which work environment fits you best? (Pick up to 2)</h2>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {WORK_ENVIRONMENTS.map(env => (
            <label key={env} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={answers.workEnvironment.includes(env)}
                onChange={e => {
                  if (e.target.checked && answers.workEnvironment.length < 2) {
                    update('workEnvironment', [...answers.workEnvironment, env]);
                  } else if (!e.target.checked) {
                    update('workEnvironment', answers.workEnvironment.filter(x => x !== env));
                  }
                }}
              />
              <span>{env}</span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          <button onClick={prevStep} className="px-4 py-2 bg-gray-300 text-gray-800 rounded">Back</button>
          <button onClick={nextStep} className="px-4 py-2 bg-blue-600 text-white rounded">Next</button>
        </div>
      </div>
    );
  }

  stepOffset++;
  if (step === stepOffset) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-xl font-bold">Which job types interest you? (Choose as many as you want)</h2>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {JOB_TYPES.map(job => (
            <label key={job} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={answers.jobVision.includes(job)}
                onChange={e => {
                  if (e.target.checked) {
                    update('jobVision', [...answers.jobVision, job]);
                  } else {
                    update('jobVision', answers.jobVision.filter(x => x !== job));
                  }
                }}
              />
              <span>{job}</span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          <button onClick={prevStep} className="px-4 py-2 bg-gray-300 text-gray-800 rounded">Back</button>
          <button onClick={nextStep} className="px-4 py-2 bg-blue-600 text-white rounded">Next</button>
        </div>
      </div>
    );
  }

  stepOffset++;
  // Last step: Dealbreaker jobs
  if (step === stepOffset) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-xl font-bold">What is a job type you wouldn't want to do? (Choose as many as you want)</h2>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {JOB_TYPES.map(job => (
            <label key={job} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={answers.dealbreakerJobs.includes(job)}
                onChange={e => {
                  if (e.target.checked) {
                    update('dealbreakerJobs', [...answers.dealbreakerJobs, job]);
                  } else {
                    update('dealbreakerJobs', answers.dealbreakerJobs.filter(x => x !== job));
                  }
                }}
              />
              <span>{job}</span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          <button onClick={prevStep} className="px-4 py-2 bg-gray-300 text-gray-800 rounded">Back</button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Calculating...' : 'See My Results'}
          </button>
        </div>
      </div>
    );
  }

  return <div>Unknown step</div>;
}