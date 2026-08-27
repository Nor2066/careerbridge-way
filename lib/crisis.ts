// lib/crisis.ts
//
// A career assessment asks people what they are bad at, what they have failed
// at, and what they are afraid their future looks like. A proportion of the
// free-text answers to those questions will contain real distress. That is not
// a hypothetical for this product — it is the predictable consequence of the
// questions it asks, to an audience of students.
//
// This module does one narrow job: notice when an answer looks like it may
// disclose distress, so the response can lead with support instead of with
// "here are your top three career clusters".
//
// Deliberate limits, so nobody mistakes this for more than it is:
//
//   • It is a keyword screen, not an assessment. It will miss things and it
//     will fire on innocent phrasing ("this course is killing me"). It is
//     tuned to over-trigger rather than under-trigger, because the cost of a
//     false positive is showing someone a helpline they did not need, and the
//     cost of a false negative is not showing it to someone who did.
//
//   • Nothing detected here is ever written to the database. An inference
//     about someone's mental health is special-category data under UK GDPR
//     Article 9, and storing it would mean a lawful basis, a retention
//     policy, and a breach class we do not want. The signal lives for the
//     duration of one request and then is gone.
//
//   • It does not block the report. The person asked for a career report and
//     paid for it; withholding it would be a punishment, not a kindness. The
//     support information goes above it.

/**
 * Phrases that suggest the writer may be describing self-harm, suicidal
 * ideation, or acute hopelessness.
 *
 * Word-boundary matched so "therapist" does not trip "the rapist"-style
 * substring accidents, and so "can't go on" is caught but "going on holiday"
 * is not.
 */
const CRISIS_PATTERNS: RegExp[] = [
  /\bkill(ing)?\s+my\s?self\b/i,
  /\bkms\b/i,
  // "suicide" immediately followed by an occupational noun is someone
  // describing a career, not their state — and on a careers site aimed at
  // students, mental health work is a common and entirely ordinary answer.
  // Firing on every one of those would train people to ignore the notice.
  // Anything else ("thinking about suicide a lot") still matches.
  /\bsuicid(e|al)\b(?!\s+(prevention|awareness|research|studies|charity|helpline|hotline|counsell?or|counselling|counseling|nurse|ward|services|support|intervention|watch))/i,
  /\bend\s+(my|it)\s+(life|all)\b/i,
  /\btake\s+my\s+own\s+life\b/i,
  /\bself[-\s]?harm(ing)?\b/i,
  /\bcut(ting)?\s+my\s?self\b/i,
  /\bhurt(ing)?\s+my\s?self\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bbetter\s+off\s+(dead|without\s+me)\b/i,
  /\bno\s+(point|reason)\s+(in\s+)?living\b/i,
  /\bnothing\s+to\s+live\s+for\b/i,
  /\bcan'?t\s+(go\s+on|take\s+it\s+any\s?more|do\s+this\s+any\s?more)\b/i,
  /\bdon'?t\s+want\s+to\s+be\s+here\s+any\s?more\b/i,
  /\bworthless\s+and\s+(hopeless|alone)\b/i,
  /\bgive\s+up\s+on\s+life\b/i,
];

/**
 * True when any of the supplied free-text answers matches a crisis pattern.
 *
 * Pass the raw answers, before sanitisation — the sanitiser strips bracketed
 * text and code fences, which could remove the very phrase we need to see.
 */
export function detectCrisisSignals(texts: Array<string | undefined | null>): boolean {
  for (const text of texts) {
    if (!text) continue;
    for (const pattern of CRISIS_PATTERNS) {
      if (pattern.test(text)) return true;
    }
  }
  return false;
}

export type SupportResource = {
  name: string;
  contact: string;
  detail: string;
  href?: string;
};

/**
 * Shown above the report when a signal is detected.
 *
 * UK-first because the business is registered in the UK and that is where the
 * numbers are free to call; the last entry covers everyone else, since a
 * career site for students will always have visitors from elsewhere.
 *
 * Keep this list short. A wall of options is harder to act on than three.
 */
export const SUPPORT_RESOURCES: SupportResource[] = [
  {
    name: 'Samaritans',
    contact: '116 123',
    detail: 'Free, 24 hours a day, from any UK phone.',
    href: 'https://www.samaritans.org',
  },
  {
    name: 'Shout',
    contact: 'Text SHOUT to 85258',
    detail: 'Free, 24-hour text support in the UK if talking feels like too much.',
    href: 'https://giveusashout.org',
  },
  {
    name: 'Childline',
    contact: '0800 1111',
    detail: 'Free and confidential, for anyone under 19 in the UK.',
    href: 'https://www.childline.org.uk',
  },
  {
    name: 'Find a helpline',
    contact: 'findahelpline.com',
    detail: 'Free support lines in almost every country, if you are outside the UK.',
    href: 'https://findahelpline.com',
  },
];

export const SUPPORT_MESSAGE =
  'Some of what you wrote sounded heavy, and we did not want to hand you a career report without saying so. ' +
  'Whatever is going on, you deserve to talk to someone about it — these people are free to contact and will not judge you.';

/**
 * The shape returned alongside a report when support should be surfaced.
 */
export type SupportNotice = {
  message: string;
  resources: SupportResource[];
};

export function buildSupportNotice(): SupportNotice {
  return { message: SUPPORT_MESSAGE, resources: SUPPORT_RESOURCES };
}

/**
 * Appended to the model's system prompt whenever a signal is detected.
 *
 * The base prompt tells the model to stay strictly on career guidance and to
 * refuse anything else — sensible against injection, actively harmful here,
 * because it would have the model write breezily about job clusters directly
 * underneath a disclosure of self-harm. This narrows that rule for the one
 * case where it should not apply.
 */
export const CRISIS_PROMPT_ADDENDUM = `
IMPORTANT — READ BEFORE WRITING:
Something in this person's answers may indicate they are struggling badly, possibly with self-harm or thoughts of suicide.

Adjust your report accordingly:
- Open by acknowledging, briefly and warmly, that some of what they wrote sounded difficult. One or two sentences. Do not quote their words back to them.
- Do not diagnose, do not speculate about their mental health, and do not tell them how they feel.
- Do not minimise it, and do not be cheerful about it. No "everything happens for a reason", no exclamation marks in that opening.
- The application is already showing them support helplines above your report, so do not list phone numbers yourself. You may say that the information above is there if they want it.
- Then continue with the career report as normal, in a calmer and gentler register than usual.
- Do not make their career recommendations contingent on their wellbeing, and do not suggest they are unfit for any path because of it.
`;
