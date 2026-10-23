// lib/demo-quiz.ts
//
// The 8-question demo on the homepage, and the small result it ends with.
//
// This is a hook, not an assessment. Each answer is one vote for one of four
// broad work styles, the votes are added up, and the biggest pile wins. There
// is no psychometrics behind it and the result card says so. The real
// assessment (46 questions, 15 career areas, an AI report) is what it points
// to.
//
// The question and option text is English and doubles as the translation
// key: lib/i18n/options.ts holds the Spanish.

export type DemoStyle = 'analytical' | 'creative' | 'social' | 'strategic';

export const DEMO_STYLES: readonly DemoStyle[] = ['analytical', 'creative', 'social', 'strategic'];

export type DemoQuestion = {
  text: string;
  options: string[];
  /** Which style each option votes for, in the same order as `options`. */
  styles: DemoStyle[];
  /** How many votes an answer here is worth. */
  weight: number;
  hoverImages: string[];
};

export const DEMO_QUESTIONS: DemoQuestion[] = [
  {
    text: "What's your natural energy rhythm throughout the day?",
    options: [
      "Early morning – I'm most productive before noon",
      'Afternoon – I hit my stride after lunch',
      'Evening – I do my best work after 6 PM',
      'Flexible – I adapt to whatever schedule is needed',
    ],
    styles: ['strategic', 'social', 'creative', 'analytical'],
    // Says little about how someone works, so it counts for less.
    weight: 1,
    hoverImages: ['morning.webp', 'afternoon.webp', 'evening.webp', 'flexible.webp'],
  },
  {
    text: 'If you could choose one professional superpower, which would it be?',
    options: [
      'Deep focus – complete complex tasks with precision',
      'Speed – deliver results twice as fast',
      'Perfect recall – never forget important details',
      'Empathy – understand and connect with anyone',
    ],
    styles: ['analytical', 'creative', 'strategic', 'social'],
    weight: 2,
    hoverImages: ['focus.webp', 'speed.webp', 'recall.webp', 'empathy.webp'],
  },
  {
    text: 'What activity do you find most energising on weekends?',
    options: [
      'Learning something new (course, book, workshop)',
      'Creating something (writing, building, designing)',
      'Connecting with friends or family',
      'Exploring outdoors or trying new experiences',
    ],
    styles: ['analytical', 'creative', 'social', 'strategic'],
    weight: 2,
    hoverImages: ['learning.webp', 'creating.webp', 'connecting.webp', 'exploring.webp'],
  },
  {
    text: "What's your preferred work environment?",
    options: [
      'Structured office with clear processes',
      'Flexible remote or hybrid setup',
      'Collaborative open-plan workspace',
      'Quiet space for deep focused work',
    ],
    styles: ['strategic', 'creative', 'social', 'analytical'],
    weight: 2,
    hoverImages: ['structured.webp', 'remote.webp', 'collaborative.webp', 'quiet.webp'],
  },
  {
    text: 'How do you typically approach problem-solving?',
    options: [
      'Research thoroughly before acting',
      'Consult others for different perspectives',
      'Experiment until I find what works',
      'Create a step-by-step structured plan',
    ],
    styles: ['analytical', 'social', 'creative', 'strategic'],
    weight: 2,
    hoverImages: ['research.webp', 'consult.webp', 'experiment.webp', 'plan.webp'],
  },
  {
    text: 'Which work value is most important to you?',
    options: [
      'Making a meaningful impact',
      'Continuous learning and growth',
      'Work-life balance and flexibility',
      'Recognition and career advancement',
    ],
    styles: ['social', 'analytical', 'creative', 'strategic'],
    weight: 2,
    hoverImages: ['impact.webp', 'growth.webp', 'balance.webp', 'recognition.webp'],
  },
  {
    text: "Complete this sentence: 'At work, I want to...'",
    options: [
      'Build innovative products or solutions',
      'Help people directly',
      'Optimise processes and systems',
      'Lead and inspire teams',
    ],
    styles: ['creative', 'social', 'analytical', 'strategic'],
    weight: 2,
    hoverImages: ['build.webp', 'help.webp', 'optimize.webp', 'lead.webp'],
  },
  {
    text: 'Which of these role archetypes resonates most with you?',
    options: [
      'Strategist – planning and vision',
      'Creator – designing and building',
      'Connector – relationships and communication',
      'Analyst – data and insights',
    ],
    styles: ['strategic', 'creative', 'social', 'analytical'],
    // The student naming their own style outright counts most, and settles
    // most ties.
    weight: 3,
    hoverImages: ['strategist.webp', 'creator.webp', 'connector.webp', 'analyst.webp'],
  },
];

/** Career areas to suggest for each style, as scoring cluster keys so they
 *  are shown under the same names as in the full assessment. */
export const DEMO_STYLE_AREAS: Record<DemoStyle, readonly string[]> = {
  analytical: ['Analytical', 'Research', 'IT'],
  creative: ['Creative', 'Engineering', 'Entrepreneurship'],
  social: ['Healthcare', 'Education', 'SocialImpact'],
  strategic: ['Business', 'Legal', 'Operations'],
};

export type DemoResult = {
  top: DemoStyle;
  second: DemoStyle;
  /** Each style's share of the votes, 0 to 100, adding up to 100. */
  shares: Record<DemoStyle, number>;
};

/**
 * Adds up the votes. `answers` holds the chosen option's index per question;
 * unanswered or out-of-range entries are skipped. Ties go to the style picked
 * in the last question, then to the order of DEMO_STYLES.
 */
export function scoreDemo(answers: readonly (number | undefined)[]): DemoResult {
  const votes: Record<DemoStyle, number> = { analytical: 0, creative: 0, social: 0, strategic: 0 };
  DEMO_QUESTIONS.forEach((q, i) => {
    const style = q.styles[answers[i] ?? -1];
    if (style) votes[style] += q.weight;
  });

  const last = DEMO_QUESTIONS.length - 1;
  const selfPick = DEMO_QUESTIONS[last].styles[answers[last] ?? -1];
  const ranked = [...DEMO_STYLES].sort(
    (a, b) =>
      votes[b] - votes[a] ||
      Number(b === selfPick) - Number(a === selfPick) ||
      DEMO_STYLES.indexOf(a) - DEMO_STYLES.indexOf(b)
  );

  const total = DEMO_STYLES.reduce((sum, s) => sum + votes[s], 0);
  const shares = Object.fromEntries(
    DEMO_STYLES.map((s) => [s, total ? Math.round((votes[s] / total) * 100) : 25])
  ) as Record<DemoStyle, number>;
  // Rounding can leave the four a point off 100; give the difference to the
  // top style so the bars add up.
  shares[ranked[0]] += 100 - DEMO_STYLES.reduce((sum, s) => sum + shares[s], 0);

  return { top: ranked[0], second: ranked[1], shares };
}
