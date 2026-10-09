// lib/assessment-options.ts
//
// The answer options of the main questionnaire. These English strings are the
// VALUES: lib/scoring.ts keys its weights off them and they are what gets
// saved, so they must not be edited casually. The Spanish (and any future)
// wording lives in lib/i18n/options.ts and only changes what is displayed.
//
// Moved out of app/HomeContent.tsx so a test can check every option has a
// translation.

export const SUBJECTS = [
  'Mathematics',
  'Sciences',
  'Technology / Computing',
  'Business / Economics',
  'Social Sciences (psychology, sociology, politics)',
  'Arts / Humanities (history, literature, art)',
  'Creative Fields (art, design, writing)',
  'Languages',
];

export const ACTIVITIES = [
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
  'Advocating / Raising awareness (speaking up for a cause, e.g. climate change, bullying)',
];

export const SKILL_NAMES = [
  { id: 'logicalReasoning', label: 'Logical Reasoning (solving puzzles, finding patterns)' },
  { id: 'creativity', label: 'Creativity (coming up with new ideas)' },
  { id: 'communication', label: 'Communication (talking, writing, presenting)' },
  { id: 'workingWithData', label: 'Working with Data (using numbers, charts, spreadsheets)' },
  { id: 'manualSkills', label: 'Manual Skills (fixing things, using tools, crafts)' },
  { id: 'teamwork', label: 'Teamwork (working well with others)' },
  { id: 'criticalThinking', label: 'Critical Thinking (thinking carefully before deciding)' },
  { id: 'timeManagement', label: 'Time Management (planning your time, meeting deadlines)' },
  { id: 'uncertaintyComfort', label: "Uncertainty Comfort (being okay when you don't know the answer)" },
  { id: 'financialRiskComfort', label: 'Financial Risk Comfort (being okay with money risks, like investing)' },
  { id: 'pressureTolerance', label: 'Pressure Tolerance (handling stress and tight deadlines)' },
  { id: 'empathy', label: 'Empathy / Emotional Intelligence (understanding how others feel)' },
  { id: 'artistic', label: 'Artistic / Visual Thinking (thinking in pictures, design)' },
  { id: 'mechanical', label: 'Mechanical / Spatial Reasoning (understanding how things fit together, like puzzles or building)' },
  { id: 'organization', label: 'Organization / Attention to Detail (keeping things tidy, noticing small things)' },
  { id: 'adaptability', label: 'Adaptability / Flexibility (adjusting to change easily)' },
  { id: 'physicalStamina', label: 'Physical Stamina / Endurance (staying active for long periods)' },
];

export const THINKING_STYLES = [
  'I like clear answers that are either right or wrong (like math problems)',
  'I like open‑ended questions with many possible answers (like creative writing)',
  'A mix of both',
];

export const LEARNING_STYLES = [
  'Hands-on',
  'Reading & Theory (learning from books, not hands‑on)',
  'Visual / Creative',
  'Group Discussion',
  'Independent Study',
];

export const MOTIVATIONS = [
  'High Earning',
  'Helping / Impact',
  'Creativity',
  'Stability',
  'Research',
  'Working with Tech',
  'Leadership',
  'Personal growth and becoming the best version of yourself',
  'Creating things (art, buildings, inventions, ideas)',
];

export const WHAT_MATTERS = [
  'Work-Life Balance',
  'Career Growth (opportunities to move up and earn more)',
  'Meaningful Impact (making a difference in the world)',
  'Financial Independence (having enough money to not rely on others)',
  'Autonomy (freedom to make your own decisions)',
];

export const SOCIAL_PREFERENCES = [
  'Being around many people (I feel energized)',
  'Small groups',
  'One-on-one conversations',
  'Working alone / being by myself',
];

export const WORK_ENVIRONMENTS = [
  'Structured (clear rules and schedules)',
  'Fast-Paced',
  'Independent',
  'Collaborative (working closely with a team)',
  'Competitive',
  'Calm',
];

export const JOB_TYPES = [
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
  'Hospitality / Tourism',
];

export const YES_NO = ['YES', 'NO'];

export const ACADEMIC_LEVEL_LABELS = [
  '1 = High school diploma',
  '2 = Some college / trade school',
  "3 = Bachelor's degree",
  "4 = Master's degree",
  '5 = Doctorate / professional degree (MD, PhD, JD)',
];

/** Display label → stored profile key. */
export const PROFILE_OPTIONS: { label: string; value: string }[] = [
  { label: 'High school student', value: 'high_school' },
  { label: 'University student / graduate', value: 'university' },
  { label: 'Trade school or vocational training', value: 'specialized_training' },
  { label: 'Employed', value: 'employed' },
  { label: 'Unemployed', value: 'unemployed' },
];

/**
 * The three profile-specific questions. `field` is where the answer is stored
 * in careerContext.subAnswers; `title` is the English question text, also used
 * as the key for its translation.
 */
export type ProfileQuestion = { field: string; title: string; options: string[] };

export const PROFILE_FOLLOWUPS: Record<string, [ProfileQuestion, ProfileQuestion, ProfileQuestion]> = {
  high_school: [
    {
      field: 'highSchoolTiming',
      title: 'How soon do you plan to start thinking seriously about your career path?',
      options: ['Within the next year', 'Before I graduate high school', 'After graduation', "I'm already thinking about it"],
    },
    {
      field: 'highSchoolStage',
      title: 'Which best describes your current career planning stage?',
      options: ['No idea yet', 'A few broad interests', 'A specific career in mind', 'Already taking related courses/activities'],
    },
    {
      field: 'highSchoolHelp',
      title: 'What would help you most right now with career choices?',
      options: ['Career quizzes / self‑assessments', 'Talking to professionals', 'Internship or job shadowing opportunities', 'Advice from school counselors'],
    },
  ],
  university: [
    {
      field: 'universityStatus',
      title: 'What is your current status regarding a career?',
      options: ['Still exploring majors/careers', 'Chosen a career path but not yet specialized', 'Actively preparing for a specific job field', 'Graduated and job searching'],
    },
    {
      field: 'universityChallenge',
      title: 'The biggest challenge you face in choosing a career is:',
      options: ['Too many options', "Not knowing what I'll enjoy long‑term", 'Worry about job market/salary', 'Lack of real‑world experience'],
    },
    {
      field: 'universitySupport',
      title: 'What career support do you need most right now?',
      options: ['Resume/interview prep', 'Finding internships or entry‑level roles', 'Mentorship in my field', 'Understanding career progression paths'],
    },
  ],
  specialized_training: [
    {
      field: 'trainingStatus',
      title: 'Are you currently in training for a specific career?',
      options: ["Yes, and I'm committed to it", 'Yes, but still considering other options', 'No, just exploring', 'Finished training, now choosing job'],
    },
    {
      field: 'trainingPriority',
      title: 'What matters most to you in a career after training?',
      options: ['Job stability', 'High salary immediately', 'Ability to advance without another degree', 'Work‑life balance'],
    },
    {
      field: 'trainingSwitch',
      title: 'Which factor would make you switch career paths despite training?',
      options: ['Better pay elsewhere', 'Burnout risk in trained field', 'Lack of jobs in trained field', 'Discovering a new passion'],
    },
  ],
  employed: [
    {
      field: 'employedReason',
      title: 'Why are you looking at career choice questions if already employed?',
      options: ['Considering a career change', 'Unsatisfied with current career', 'Want to advance in same field', 'Just curious about options'],
    },
    {
      field: 'employedIssue',
      title: 'What is the main issue with your current career?',
      options: ['Low pay', 'No growth opportunities', 'Poor fit with my personality/interests', 'Stress or burnout'],
    },
    {
      field: 'employedHelp',
      title: 'What would most help you choose a different career?',
      options: ['Skills assessment', 'Understanding transferable skills', 'Learning about new industries', 'Part‑time training while working'],
    },
  ],
  unemployed: [
    {
      field: 'unemployedStatus',
      title: 'Is your unemployment...',
      options: ['Recently unemployed, actively looking', 'Long‑term unemployed', 'Choosing first career after studies', 'Re‑entering workforce after break'],
    },
    {
      field: 'unemployedBarrier',
      title: 'What is the biggest barrier to choosing a career right now?',
      options: ['Lack of skills / qualifications', 'No clear interests', 'Health or personal issues', 'Few jobs available locally'],
    },
    {
      field: 'unemployedHelp',
      title: 'Which would help you most with career choice today?',
      options: ['Free career counseling', 'Short training programs', 'Help with job search strategy', 'Assessment of my strengths'],
    },
  ],
};

export const SALARY_AIMS = [
  "Comfortable living – I don't need much",
  'Good average salary – like most people in my job',
  'Above average – better than most',
  'High income – top earner level',
  'Wealthy – millionaire or more',
];

export const RELOCATION = ['Not willing (stay in my city)', 'Willing within my region', 'Willing anywhere in my country', 'Willing to move abroad'];

export const REMOTE_WORK = ['Must be fully remote', 'Prefer hybrid (2–3 days in office)', 'Prefer fully in‑office', 'No preference'];

export const WORK_SCHEDULES = ['Standard 9–5', 'Flexible hours (core hours only)', 'Shift work (evenings/nights/weekends)', 'Compressed workweek (4x10h)', 'No preference'];

export const JOB_SECURITY = ['Extremely important (stable industry, government, etc.)', 'Somewhat important', 'Not important (willing to take risks)'];

export const TRAVEL = ['Never travel', 'Occasional (a few times a year)', 'Frequent (weekly)', 'Love it, open to 50%+ travel'];

export const TEAM_ENVIRONMENTS = ['I work best alone', 'Small, tight‑knit team', 'Large, collaborative team', 'I like leading a team'];

export const CRITICISM = ['Use it to improve', 'Find it difficult but accept it', 'Prefer positive feedback only', 'Not sure', "I can't stand it"];

/** Every option string the main questionnaire can display. */
export function allMainQuestionnaireOptions(): string[] {
  return [
    ...SUBJECTS,
    ...ACTIVITIES,
    ...SKILL_NAMES.map((s) => s.label),
    ...THINKING_STYLES,
    ...LEARNING_STYLES,
    ...MOTIVATIONS,
    ...WHAT_MATTERS,
    ...SOCIAL_PREFERENCES,
    ...WORK_ENVIRONMENTS,
    ...JOB_TYPES,
    ...YES_NO,
    ...ACADEMIC_LEVEL_LABELS,
    ...PROFILE_OPTIONS.map((p) => p.label),
    ...Object.values(PROFILE_FOLLOWUPS).flatMap((qs) => qs.flatMap((q) => [q.title, ...q.options])),
    ...SALARY_AIMS,
    ...RELOCATION,
    ...REMOTE_WORK,
    ...WORK_SCHEDULES,
    ...JOB_SECURITY,
    ...TRAVEL,
    ...TEAM_ENVIRONMENTS,
    ...CRITICISM,
  ];
}
