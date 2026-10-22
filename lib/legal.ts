// lib/legal.ts
//
// One place for the facts that every legal page repeats. Three documents that
// each name the company, the contact address, and their own last-updated date
// will drift apart within a month if each carries its own copy.
//
// The registration details (number, registry court, seat, tax numbers) exist
// only once ADAQNO Kft. is registered, so they are null until then. The pages
// leave out whatever is null, and checkout refuses real-money payments until
// legalDetailsComplete() is true — see app/api/checkout/route.ts.

import { BRAND } from '@/lib/site';

export const COMPANY = {
  /** Trading name shown to customers. Set in lib/site.ts. */
  tradingName: BRAND.name,

  /** Registered company name, exactly as it appears in the Hungarian company
   *  register (cégjegyzék). The full form is ADAQNO Korlátolt Felelősségű
   *  Társaság; the short form is what customers see. */
  legalName: 'ADAQNO Kft.',

  /** Company registration number (cégjegyzékszám), in the form 01-09-123456.
   *  The Hungarian e-commerce act (Ekertv. 4. §) requires it on the site,
   *  together with the court that registered the company. */
  companyNumber: null as string | null,

  /** The registry court (cégbíróság) that keeps the company's file, which
   *  follows the seat — for a Budapest seat, Fővárosi Törvényszék Cégbírósága. */
  registryCourt: null as string | null,

  /**
   * Registered seat (székhely). Use the seat-service address, never a home
   * address: this is published on a public page, and once it is indexed it is
   * very hard to take back.
   */
  address: null as string | null,

  /** Hungarian tax number (adószám), in the form 12345678-1-42. A Kft gets one
   *  on registration, and Ekertv. 4. § requires it on the site. */
  taxNumber: null as string | null,

  /** EU VAT number (közösségi adószám), HU followed by eight digits, or null
   *  until it is issued. Needed for selling to businesses in other EU
   *  countries, such as university licences. */
  euVatNumber: null as string | null,

  jurisdiction: 'Hungary',
  country: 'Hungary',
} as const;

/**
 * Who hosts the website. The Hungarian e-commerce act (Ekertv. 4. § h)) asks
 * for the hosting provider's name, address and email alongside our own
 * details. Keep it in step with the Vercel row in SUBPROCESSORS.
 */
export const HOSTING = {
  name: 'Vercel Inc.',
  address: '440 N Barranca Avenue #4133, Covina, CA 91723, United States',
  email: 'privacy@vercel.com',
} as const;

/**
 * Minimum age for an account.
 *
 * 16 is the age of digital consent in Hungary, where we are established: the
 * GDPR's default under Article 8, which Hungary has not lowered. Other
 * countries set it anywhere from 13 to 16, and most of what we do rests on
 * contract rather than consent, so it is also a business choice — the
 * assessment asks personal questions and the report is about life decisions,
 * and one line for everyone is the defensible one. The signup form asks, and
 * /api/auth/signup refuses without it.
 */
export const MINIMUM_AGE = 16;

/**
 * The version of the terms a new account is agreeing to.
 *
 * Recorded against the profile at signup. A tickbox that records nothing is
 * weak evidence: what matters later is being able to say which wording the
 * person accepted and when, and that is only possible if the version is
 * stamped at the time rather than inferred from whatever is published now.
 *
 * Bump this whenever the terms change materially — the same day you move
 * LAST_UPDATED.terms.
 */
export const TERMS_VERSION = '2026-10-22';

export const CONTACT = {
  /** Answered by a human. Also the support address the launch checklist wants. */
  support: 'support@adaqno.com',
  /** Data protection requests: access, deletion, export, objections. */
  privacy: 'privacy@adaqno.com',
} as const;

/**
 * Shown as "Last updated" on each document.
 *
 * Bump the one you actually changed. A document whose date moves every deploy
 * teaches people the date means nothing, and the date is what tells a customer
 * whether the terms they agreed to are the terms on the page.
 */
export const LAST_UPDATED = {
  privacy: '22 October 2026',
  terms: '22 October 2026',
  refunds: '22 October 2026',
  cookies: '22 October 2026',
  acceptableUse: '22 October 2026',
  aiNotice: '22 October 2026',
} as const;

/**
 * Everyone we send personal data to, and why.
 *
 * This list does triple duty: the privacy policy renders it (the reel costs
 * $7,988 for omitting third-party collectors), the GDPR record of
 * processing (Article 30) needs it, and it is the checklist of who you owe a data
 * processing agreement to. Keep it accurate — adding a service to the stack
 * without adding it here is how a policy becomes untrue.
 */
export type Subprocessor = {
  name: string;
  purpose: string;
  data: string;
  region: string;
};

export const SUBPROCESSORS: Subprocessor[] = [
  {
    name: 'Supabase',
    purpose: 'Database and account authentication',
    data: 'Email address, account identifiers, assessment and follow-up answers, generated reports, ratings and comments, and the partner university you joined through, if any',
    region: 'European Union (Frankfurt, Germany)',
  },
  {
    name: 'OpenAI',
    purpose:
      'Writing your career report and follow-up roadmap. Also summarising themes across many people’s answers so we can improve the questionnaire and the reports.',
    data: 'Your answers, your career scores and the language you use the site in; for the roadmap, also your follow-up answers and first report; if you came through a university, the country it is in. For the improvement work, answers with the identifying details stripped out. Never your name or email address. Not used to train their models.',
    region: 'United States',
  },
  {
    name: 'Stripe',
    purpose: 'Taking payment',
    data: 'Email address, payment details. We never see or store your card number.',
    region: 'United States and Ireland',
  },
  {
    name: 'Vercel',
    purpose: 'Hosting the website. Also tells us which country a request comes from, which we use only to show the right helplines.',
    data: 'Technical request logs, including IP address and approximate country',
    region: 'United States and Europe',
  },
  {
    name: 'Sentry',
    purpose: 'Recording errors so we can fix them',
    data: 'Technical error details, which may include your account identifier',
    region: 'European Union (Germany)',
  },
  {
    name: 'Upstash',
    purpose: 'Rate limiting, to stop abuse of the service',
    data: 'A hashed identifier and a request count. No assessment content.',
    region: 'Europe',
  },
  {
    name: 'Resend',
    purpose: 'Sending receipts, sign-in links, "report ready" emails and confirmations when you cancel a purchase',
    data: 'Your email address and the contents of that email. No assessment answers.',
    region: 'United States',
  },
  {
    name: 'Google',
    purpose: 'Sign in with Google, if you choose it',
    data: 'The sign-in request. Google tells us your email address; we tell Google nothing about your answers.',
    region: 'United States',
  },
];

/** How long we keep things, and why that long. */
export const RETENTION = [
  {
    what: 'Your account and assessment results',
    how_long: 'Until you delete your account',
    why: 'So you can return to your reports and history at any time.',
  },
  {
    what: 'Ratings and comments you leave on a report',
    how_long: 'Until you delete your account',
    why: 'To improve the questionnaire and the reports. A partner university sees only the average rating of its students, and only once at least five have rated.',
  },
  {
    what: 'Your link to a partner university',
    how_long: 'Until you delete your account',
    why: 'So the free access your university pays for keeps working while its licence runs. When a licence ends, your account and reports stay yours.',
  },
  {
    what: 'University staff contact details',
    how_long: 'Until the university asks us to remove someone, or 12 months after its agreement with us ends',
    why: 'So the people the university named can sign in to its dashboard, and so we can show who had access if a question is ever asked.',
  },
  {
    what: 'Payment records',
    how_long: '8 years from the end of the financial year of the sale',
    why: 'Hungarian accounting law requires us to keep the records behind every sale for at least 8 years. These are kept even after account deletion, with your name and email removed where possible.',
  },
  {
    what: 'Cancellations you send us (the withdrawal form)',
    how_long: '8 years from the end of the financial year, the same as payment records',
    why: 'They are the record that you cancelled in time and that we refunded you. Kept with your name and email, including after account deletion, because without them that record proves nothing.',
  },
  {
    what: 'Emails you send us',
    how_long: '2 years after your last message',
    why: 'So we have the history if you write to us again about the same thing.',
  },
  {
    what: 'Error and security logs',
    how_long: 'Up to 90 days',
    why: 'Long enough to investigate a fault or a security incident, and no longer.',
  },
  {
    what: 'Product analytics events',
    how_long: '90 days',
    why: 'To see which step of the assessment loses people. These never contain the content of your answers, and deleting your account detaches them from you rather than removing them. Enforced by a nightly job, not by hand — see supabase/analytics-retention.sql.',
  },
];

/**
 * True once the company is registered and its details are filled in above.
 *
 * Hungarian law (Ekertv. 4. §) wants the registration number, registry court,
 * seat and tax number on the site of anyone selling online, so checkout takes
 * no real money until this is true. Test payments are unaffected.
 */
export function legalDetailsComplete(): boolean {
  return [COMPANY.companyNumber, COMPANY.registryCourt, COMPANY.address, COMPANY.taxNumber].every(Boolean);
}

/**
 * The registration details that exist, as one or more sentences:
 * "Company registration number (cégjegyzékszám): 01-09-123456, registered by
 * the Fővárosi Törvényszék Cégbírósága. Registered seat: … Tax number: …".
 * Empty until the company is registered.
 */
export function registrationDetails(): string {
  const parts: string[] = [];
  if (COMPANY.companyNumber) {
    parts.push(
      `Company registration number (cégjegyzékszám): ${COMPANY.companyNumber}` +
        (COMPANY.registryCourt ? `, registered by the ${COMPANY.registryCourt}.` : '.')
    );
  }
  if (COMPANY.address) parts.push(`Registered seat (székhely): ${COMPANY.address}.`);
  if (COMPANY.taxNumber) parts.push(`Tax number (adószám): ${COMPANY.taxNumber}.`);
  if (COMPANY.euVatNumber) parts.push(`EU VAT number: ${COMPANY.euVatNumber}.`);
  return parts.join(' ');
}
