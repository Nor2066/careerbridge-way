// lib/scoring.ts

export const MAX_SCORES = {
  Analytical: 132,
  Engineering: 129,
  IT: 123,
  Healthcare: 153,
  Research: 150,
  Business: 151,
  Entrepreneurship: 144,
  SocialImpact: 125,
  Education: 134,
  Creative: 118,
  SkilledTrades: 117,
  Operations: 138,
} as const;

export type Cluster = keyof typeof MAX_SCORES;

const subjectWeights: Record<string, Partial<Record<Cluster, number>>> = {
  Mathematics: { Analytical: 3, Engineering: 2, IT: 2, Research: 1, Business: 1 },
  Sciences: { Analytical: 1, Engineering: 2, Healthcare: 2, Research: 3, Education: 1 },
  "Technology / Computing": { Analytical: 1, Engineering: 2, IT: 3, Entrepreneurship: 1, Creative: 1 },
  "Business / Economics": { Analytical: 1, Business: 3, Entrepreneurship: 2, Education: 1, Operations: 1 },
  "Social Sciences": { Research: 2, SocialImpact: 2, Education: 2 },
  "Arts / Humanities": { Research: 1, SocialImpact: 1, Education: 2, Creative: 3 },
  "Creative Fields": { Engineering: 1, IT: 1, Entrepreneurship: 1, Creative: 4 },
  Languages: { Business: 1, SocialImpact: 2, Education: 2 },
};

const activityWeights: Record<string, Partial<Record<Cluster, number>>> = {
  "Solving problems": { Analytical: 3, Engineering: 2, IT: 3, Research: 1 },
  "Experiments / Hands-on": { Engineering: 3, IT: 1, Healthcare: 2, Research: 2, SkilledTrades: 4 },
  "Designing / Creating": { Engineering: 2, IT: 1, Entrepreneurship: 1, Creative: 4 },
  "Reading / Analyzing": { Analytical: 2, IT: 1, Research: 3, Business: 1, Education: 2 },
  "Helping people": { Healthcare: 4, SocialImpact: 4, Education: 3, Creative: 1 },
  "Building / Using tech": { Analytical: 1, Engineering: 4, IT: 4, Entrepreneurship: 1, Creative: 1, SkilledTrades: 1, Operations: 1 },
  "Leading / Organizing": { Business: 3, Entrepreneurship: 3, SocialImpact: 1, Education: 1, Operations: 3 },
  "Coding / Programming": { Analytical: 2, Engineering: 2, IT: 5, Research: 1, Entrepreneurship: 1, Creative: 1 },
  "Making / Building things": { Engineering: 3, Creative: 2, SkilledTrades: 5, Operations: 1 },
  "Teaching / Explaining": { Analytical: 1, IT: 1, Healthcare: 1, Research: 1, Business: 1, SocialImpact: 2, Education: 4, Creative: 1 },
  "Advocating / Raising awareness": { Healthcare: 1, Research: 1, Entrepreneurship: 1, SocialImpact: 4, Education: 2, Creative: 1 },
};

const skillMultipliers: Record<string, Partial<Record<Cluster, number>>> = {
  logicalReasoning: { Analytical: 3, Engineering: 2, IT: 2, Healthcare: 1, Research: 2, Business: 1, Entrepreneurship: 1, Operations: 1 },
  creativity: { Analytical: 1, Engineering: 1, IT: 2, Research: 1, Business: 1, Entrepreneurship: 2, SocialImpact: 1, Education: 1, Creative: 4 },
  communication: { Healthcare: 2, Research: 1, Business: 2, Entrepreneurship: 1, SocialImpact: 3, Education: 3, Creative: 1, Operations: 1 },
  workingWithData: { Analytical: 3, Engineering: 1, IT: 2, Research: 2, Business: 2, Operations: 1 },
  manualSkills: { Engineering: 2, Healthcare: 1, Creative: 1, SkilledTrades: 5, Operations: 1 },
  teamwork: { Analytical: 1, Engineering: 1, IT: 1, Healthcare: 2, Research: 1, Business: 2, Entrepreneurship: 1, SocialImpact: 3, Education: 2, SkilledTrades: 2, Operations: 2 },
  criticalThinking: { Analytical: 2, Engineering: 1, IT: 1, Healthcare: 1, Research: 3, Business: 2, Entrepreneurship: 1, SocialImpact: 1, Education: 1, Operations: 1 },
  timeManagement: { Analytical: 1, Engineering: 1, IT: 1, Healthcare: 1, Research: 1, Business: 2, Entrepreneurship: 2, SocialImpact: 1, Education: 1, SkilledTrades: 1, Operations: 3 },
  uncertaintyComfort: { IT: 1, Research: 1, Business: 2, Entrepreneurship: 3, Creative: 1, Operations: 1 },
  financialRiskComfort: { Analytical: 1, Business: 3, Entrepreneurship: 3, Operations: 1 },
  pressureTolerance: { Analytical: 1, Engineering: 1, IT: 1, Healthcare: 3, Research: 2, Business: 2, Entrepreneurship: 2, SocialImpact: 1, Education: 1, SkilledTrades: 2, Operations: 2 },
  empathy: { Healthcare: 3, Research: 1, Business: 1, Entrepreneurship: 1, SocialImpact: 4, Education: 3, Creative: 1, Operations: 1 },
  artistic: { Analytical: 1, Engineering: 1, IT: 1, Research: 1, SocialImpact: 1, Education: 2, Creative: 4 },
  mechanical: { Analytical: 1, Engineering: 3, IT: 1, Healthcare: 1, Research: 1, Creative: 1, SkilledTrades: 4, Operations: 2 },
  organization: { Analytical: 2, Engineering: 2, IT: 2, Healthcare: 2, Research: 2, Business: 1, Entrepreneurship: 1, SocialImpact: 1, Education: 2, Creative: 1, SkilledTrades: 1, Operations: 3 },
  adaptability: { Analytical: 1, Engineering: 1, IT: 2, Healthcare: 2, Research: 1, Business: 2, Entrepreneurship: 3, SocialImpact: 2, Education: 2, Creative: 2, SkilledTrades: 1, Operations: 2 },
  physicalStamina: { Engineering: 1, Healthcare: 2, SkilledTrades: 3, Operations: 1 },
};

const thinkingStyleWeights: Record<string, Partial<Record<Cluster, number>>> = {
  "Right/Wrong": { Analytical: 3, Engineering: 2, IT: 2 },
  "Open-ended": { Research: 2, Entrepreneurship: 1, Creative: 3 },
  Mix: { Business: 2, Operations: 2 },
};

const learningStyleWeights: Record<string, Partial<Record<Cluster, number>>> = {
  "Hands-on": { Engineering: 2, Healthcare: 2, SkilledTrades: 2, Operations: 1 },
  "Reading & Theory": { Analytical: 2, Research: 2, Education: 1 },
  "Visual / Creative": { IT: 1, Creative: 2 },
  "Group Discussion": { Business: 1, SocialImpact: 2, Education: 2, Operations: 1 },
  "Independent Study": { Analytical: 2, IT: 2, Research: 2, Entrepreneurship: 1, Creative: 1 },
};

const motivationWeights: Record<string, Partial<Record<Cluster, number>>> = {
  "High Earning": { Analytical: 1, Business: 3, Entrepreneurship: 3 },
  "Helping / Impact": { Healthcare: 3, SocialImpact: 4, Education: 2 },
  Creativity: { Entrepreneurship: 1, Creative: 5 },
  Stability: { Analytical: 1, Engineering: 1, IT: 1, Healthcare: 2, Research: 1, Education: 1, SkilledTrades: 2, Operations: 2 },
  Research: { Analytical: 1, Research: 4 },
  "Working with Tech": { Engineering: 2, IT: 4, Entrepreneurship: 1, SkilledTrades: 1 },
  Leadership: { Business: 3, Entrepreneurship: 3, Education: 1, Operations: 2 },
  "Self-Realization": { Entrepreneurship: 2, Creative: 2 },
  "Creation (Physical/Mental)": { Engineering: 2, Entrepreneurship: 1, Creative: 3, SkilledTrades: 4 },
};

const whatMattersWeights: Record<string, Partial<Record<Cluster, number>>> = {
  "Work-Life Balance": { SocialImpact: 3, Education: 4, Operations: 2 },
  "Career Growth": { Business: 4, Entrepreneurship: 3 },
  "Meaningful Impact": { Healthcare: 4, SocialImpact: 3, Education: 2 },
  "Financial Independence": { Analytical: 1, Business: 3, Entrepreneurship: 4 },
  Autonomy: { IT: 1, Entrepreneurship: 4, Creative: 2 },
};

const workEnvironmentWeights: Record<string, Partial<Record<Cluster, number>>> = {
  Structured: { Analytical: 3, Healthcare: 2, Education: 1, Operations: 3 },
  "Fast-Paced": { Healthcare: 2, Business: 3, Entrepreneurship: 3, SocialImpact: 1, Operations: 1 },
  Independent: { IT: 4, Research: 3, Entrepreneurship: 3, Creative: 2 },
  Collaborative: { Healthcare: 3, Business: 3, SocialImpact: 4, SkilledTrades: 1, Operations: 2 },
  Competitive: { Analytical: 1, Business: 4, Entrepreneurship: 4 },
  Calm: { Analytical: 2, Research: 3, Education: 3, Creative: 2 },
};

const socialPreferenceWeights: Record<string, Partial<Record<Cluster, number>>> = {
  "Energized by Many People": { Business: 3, Entrepreneurship: 3, SocialImpact: 1, Education: 1 },
  "Small Groups": { Healthcare: 2, SocialImpact: 1, Education: 3 },
  "One-on-One": { Healthcare: 3, SocialImpact: 3, Education: 1 },
  "Working Alone": { Analytical: 3, IT: 3, Research: 3, Creative: 1 },
};

const jobVisionWeights: Record<string, Cluster> = {
  "Research job": "Research",
  "Healthcare job": "Healthcare",
  Entrepreneurial: "Entrepreneurship",
  "Hands-on trade": "SkilledTrades",
  "Transport / logistics": "Operations",
  "Business role": "Business",
  "IT role": "IT",
  "Engineering role": "Engineering",
  "Education role": "Education",
  "Creative role": "Creative",
  "Social impact role": "SocialImpact",
  "Analytical/data role": "Analytical",
};

export const dealbreakerMap: Record<string, Cluster> = {
  "Research job": "Research",
  "Healthcare job": "Healthcare",
  Entrepreneurial: "Entrepreneurship",
  "Hands-on trade": "SkilledTrades",
  "Transport / logistics": "Operations",
  "Business role": "Business",
  "IT role": "IT",
  "Engineering role": "Engineering",
  "Education role": "Education",
  "Creative role": "Creative",
  "Social impact role": "SocialImpact",
  "Analytical/data role": "Analytical",
};

function initScores(): Record<Cluster, number> {
  return {
    Analytical: 0, Engineering: 0, IT: 0, Healthcare: 0,
    Research: 0, Business: 0, Entrepreneurship: 0, SocialImpact: 0,
    Education: 0, Creative: 0, SkilledTrades: 0, Operations: 0,
  };
}

export interface UserAnswers {
  subjects: string[];
  activities: string[];
  skills: Record<string, number>;
  thinkingStyle: string;
  learningStyle: string;
  motivations: string[];
  whatMattersMore: string;
  studyHours: boolean;
  academicLevel: number;
  socialPreference: string;
  workEnvironment: string[];
  jobVision: string[];
  dealbreakerJobs: string[];
}

export function calculateScores(answers: UserAnswers) {
  let scores = initScores();

  for (const s of answers.subjects) {
    const w = subjectWeights[s];
    if (w) for (const [c, v] of Object.entries(w)) scores[c as Cluster] += v;
  }
  for (const a of answers.activities) {
    const w = activityWeights[a];
    if (w) for (const [c, v] of Object.entries(w)) scores[c as Cluster] += v;
  }
  for (const [skill, rating] of Object.entries(answers.skills)) {
    const m = skillMultipliers[skill];
    if (m) for (const [c, mult] of Object.entries(m)) scores[c as Cluster] += rating * mult;
  }
  const ts = thinkingStyleWeights[answers.thinkingStyle];
  if (ts) for (const [c, v] of Object.entries(ts)) scores[c as Cluster] += v;
  const ls = learningStyleWeights[answers.learningStyle];
  if (ls) for (const [c, v] of Object.entries(ls)) scores[c as Cluster] += v;
  for (const m of answers.motivations) {
    const w = motivationWeights[m];
    if (w) for (const [c, v] of Object.entries(w)) scores[c as Cluster] += v;
  }
  const wm = whatMattersWeights[answers.whatMattersMore];
  if (wm) for (const [c, v] of Object.entries(wm)) scores[c as Cluster] += v;
  if (answers.studyHours) {
    scores.Analytical += 1; scores.Engineering += 2; scores.Healthcare += 2; scores.Research += 2;
  }
  const level = answers.academicLevel;
  scores.Analytical += 2 * level; scores.Engineering += 2 * level;
  scores.Healthcare += 3 * level; scores.Research += 3 * level; scores.Education += 2 * level;
  const sp = socialPreferenceWeights[answers.socialPreference];
  if (sp) for (const [c, v] of Object.entries(sp)) scores[c as Cluster] += v;
  for (const e of answers.workEnvironment) {
    const w = workEnvironmentWeights[e];
    if (w) for (const [c, v] of Object.entries(w)) scores[c as Cluster] += v;
  }
  for (const j of answers.jobVision) {
    const cluster = jobVisionWeights[j];
    if (cluster) scores[cluster] += 3;
  }

  const percentages = {} as Record<Cluster, number>;
  for (const c of Object.keys(MAX_SCORES) as Cluster[]) {
    percentages[c] = (scores[c] / MAX_SCORES[c]) * 100;
  }

  let sorted = Object.entries(percentages)
    .sort((a, b) => b[1] - a[1])
    .map(([c, p]) => ({ cluster: c as Cluster, percentage: Math.round(p * 10) / 10 }));

  const dealbreakers = answers.dealbreakerJobs.map(j => dealbreakerMap[j]).filter(Boolean) as Cluster[];
  let recommended = sorted;
  let warning = null;

  if (dealbreakers.length) {
    const safe = sorted.filter(item => !dealbreakers.includes(item.cluster));
    const excluded = sorted.filter(item => dealbreakers.includes(item.cluster));
    if (safe.length >= 3) {
      recommended = safe;
      warning = `You indicated you wouldn't want to work in: ${excluded.map(e => e.cluster).join(", ")}. These were excluded from your top recommendations.`;
    } else if (safe.length > 0 && safe.length < 3) {
      const needed = 3 - safe.length;
      const leastBad = excluded.slice(0, needed);
      recommended = [...safe, ...leastBad];
      warning = `You rejected many fields. Some of your top matches include fields you said you wouldn't want, because we ran out of options.`;
    } else {
      warning = `You indicated you wouldn't want to work in ALL career fields. Showing your top 3 anyway.`;
    }
  }

  const top3 = recommended.slice(0, 3);
  return { rawScores: scores, percentages, top3, excludedClusters: dealbreakers, warningMessage: warning };
}