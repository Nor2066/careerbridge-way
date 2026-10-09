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
//     about someone's mental health is special-category data under GDPR (UK and EU)
//     Article 9, and storing it would mean a lawful basis, a retention
//     policy, and a breach class we do not want. The signal lives for the
//     duration of one request and then is gone.
//
//   • It does not block the report. The person asked for a career report and
//     paid for it; withholding it would be a punishment, not a kindness. The
//     support information goes above it.
//
//   • It is international. The helplines shown depend on the country, and the
//     screen reads every language the site is offered in.

import type { Locale } from '@/lib/i18n/config';

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
 * The same screen for answers written in Spanish. Matched against the text
 * with accents removed (see foldAccents), so "quitarme la vida" and a hurried
 * "quitarme la vída" both match, and patterns are written without accents.
 *
 * Same tuning as above: over-trigger rather than under-trigger, but leave
 * people describing a career in mental health alone ("prevención del
 * suicidio").
 */
const CRISIS_PATTERNS_ES: RegExp[] = [
  /\bsuicid(arme|arse|ar)\b/i,
  /\bme\s+(quiero|voy\s+a)\s+suicidar\b/i,
  /\b(pensamientos?|ideas?|ideacion)\s+suicidas?\b/i,
  /(?<!(prevencion|investigacion|atencion|estudios?)\s+(del|al)\s+)(?<!sobre\s+el\s+)\bsuicidio\b/i,
  /\bquitar(me)?\s+la\s+vida\b/i,
  /\bmatarme\b/i,
  /\bme\s+quiero\s+matar\b/i,
  /\b(quiero|deseo)\s+morir(me)?\b/i,
  /\bme\s+quiero\s+morir\b/i,
  /\bno\s+quiero\s+(seguir\s+)?(vivir|viviendo)\b/i,
  /\b(acabar|terminar)\s+con\s+mi\s+vida\b/i,
  /\bponer\s+fin\s+a\s+mi\s+vida\b/i,
  /\bautolesi(on|ones|onarme|onando|ono)\b/i,
  /\b(hacerme|me\s+hago|me\s+he\s+hecho)\s+dano\b/i,
  /\bcortarme\s+(los\s+brazos|las\s+munecas|la\s+piel)\b/i,
  /\b(estarian|estaria|estarias|estan|estaran)\s+mejor\s+sin\s+mi\b/i,
  /\bmejor\s+muert[oa]\b/i,
  /\bno\s+(tiene|hay)\s+(sentido|razon|motivo)\s+(para\s+)?(seguir\s+)?vivir\b/i,
  /\bno\s+le\s+veo\s+sentido\s+a\s+(la|mi)\s+vida\b/i,
  /\bnada\s+por\s+lo\s+que\s+vivir\b/i,
  /\bno\s+(puedo|aguanto)\s+mas\b/i,
  /\bquiero\s+desaparecer\b/i,
];

/** "Quitarme la vída" → "Quitarme la vida": strips combining accents. */
function foldAccents(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/**
 * True when any of the supplied free-text answers matches a crisis pattern,
 * in any of the languages the site is offered in. Every answer is checked
 * against every language: people answer in whatever language they think in,
 * regardless of which one the site is showing.
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
    const folded = foldAccents(text);
    for (const pattern of CRISIS_PATTERNS_ES) {
      if (pattern.test(folded)) return true;
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

type Helpline = {
  name: string;
  contact: Record<Locale, string>;
  detail: Record<Locale, string>;
  href?: string;
};

/**
 * Helplines by country (ISO 3166-1 alpha-2). Keep each list short: a wall of
 * options is harder to act on than three. Every list is followed by the
 * international directory, so nobody is left with numbers for the wrong
 * country.
 *
 * A country with no entry here gets the directory plus a line about the local
 * emergency number. Add a country before selling to institutions there.
 */
const HELPLINES: Record<string, Helpline[]> = {
  GB: [
    {
      name: 'Samaritans',
      contact: { en: '116 123', es: '116 123' },
      detail: {
        en: 'Free, 24 hours a day, from any UK phone.',
        es: 'Gratuito, las 24 horas, desde cualquier teléfono del Reino Unido.',
      },
      href: 'https://www.samaritans.org',
    },
    {
      name: 'Shout',
      contact: { en: 'Text SHOUT to 85258', es: 'Envía SHOUT al 85258' },
      detail: {
        en: 'Free, 24-hour text support in the UK if talking feels like too much.',
        es: 'Apoyo gratuito por SMS las 24 horas en el Reino Unido, si hablar se te hace demasiado.',
      },
      href: 'https://giveusashout.org',
    },
    {
      name: 'Childline',
      contact: { en: '0800 1111', es: '0800 1111' },
      detail: {
        en: 'Free and confidential, for anyone under 19 in the UK.',
        es: 'Gratuito y confidencial, para menores de 19 años en el Reino Unido.',
      },
      href: 'https://www.childline.org.uk',
    },
  ],
  ES: [
    {
      name: 'Línea 024',
      contact: { en: '024', es: '024' },
      detail: {
        en: "Spain's suicide-prevention line. Free, confidential, 24 hours a day, from any phone in Spain.",
        es: 'Línea de atención a la conducta suicida. Gratuita, confidencial y 24 horas, desde cualquier teléfono en España.',
      },
      href: 'https://www.sanidad.gob.es/linea024/',
    },
    {
      name: 'Teléfono de la Esperanza',
      contact: { en: '717 003 717', es: '717 003 717' },
      detail: {
        en: 'Someone to talk to, any time of day, anywhere in Spain.',
        es: 'Alguien con quien hablar, a cualquier hora, en toda España.',
      },
    },
    {
      name: 'Fundación ANAR',
      contact: { en: '900 20 20 10', es: '900 20 20 10' },
      detail: {
        en: 'Free and confidential, 24 hours a day, for children and teenagers.',
        es: 'Gratuito y confidencial, las 24 horas, para niños, niñas y adolescentes.',
      },
      href: 'https://www.anar.org',
    },
  ],
};

const INTERNATIONAL_DIRECTORY: Helpline = {
  name: 'Find a helpline',
  contact: { en: 'findahelpline.com', es: 'findahelpline.com' },
  detail: {
    en: 'Free support lines in almost every country, if you are somewhere else.',
    es: 'Líneas de ayuda gratuitas en casi todos los países, si estás en otro lugar.',
  },
  href: 'https://findahelpline.com',
};

const EMERGENCY_FALLBACK: Helpline = {
  name: 'Emergency services',
  contact: { en: '112 / 911 / 999', es: '112' },
  detail: {
    en: 'If you are in immediate danger, call your local emergency number.',
    es: 'Si estás en peligro inmediato, llama al número de emergencias local (en Europa, el 112).',
  },
};

const SUPPORT_MESSAGES: Record<Locale, string> = {
  en:
    'Some of what you wrote sounded heavy, and we did not want to hand you a career report without saying so. ' +
    'Whatever is going on, you deserve to talk to someone about it — these people are free to contact and will not judge you.',
  es:
    'Algo de lo que has escrito sonaba duro, y no queríamos darte un informe de carrera sin decírtelo. ' +
    'Pase lo que pase, mereces hablarlo con alguien: estas personas son gratuitas y no te van a juzgar.',
};

/** The UK English list, kept for callers that want it directly. */
export const SUPPORT_RESOURCES: SupportResource[] = resolveResources('GB', 'en');
export const SUPPORT_MESSAGE = SUPPORT_MESSAGES.en;

function resolveResources(country: string | null | undefined, locale: Locale): SupportResource[] {
  const code = country?.toUpperCase() ?? '';
  const local = HELPLINES[code];
  const list = local ? [...local, INTERNATIONAL_DIRECTORY] : [INTERNATIONAL_DIRECTORY, EMERGENCY_FALLBACK];
  return list.map((h) => ({
    name: h.name,
    contact: h.contact[locale],
    detail: h.detail[locale],
    ...(h.href ? { href: h.href } : {}),
  }));
}

/**
 * The shape returned alongside a report when support should be surfaced.
 */
export type SupportNotice = {
  message: string;
  resources: SupportResource[];
};

/**
 * Support information for the person's country, in their language.
 *
 * `country` is decided by the caller, best signal first: the country of the
 * university that gave them access, then where the request came from, then a
 * guess from the language. Unknown countries still get the international
 * directory and the emergency-number line rather than another country's
 * numbers.
 */
export function buildSupportNotice(
  { country, locale }: { country?: string | null; locale?: Locale } = {}
): SupportNotice {
  const lang = locale ?? 'en';
  return { message: SUPPORT_MESSAGES[lang], resources: resolveResources(country, lang) };
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
