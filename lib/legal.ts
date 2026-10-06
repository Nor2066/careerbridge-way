// lib/legal.ts
//
// One place for the facts that every legal page repeats. Three documents that
// each name the company, the contact address, and their own last-updated date
// will drift apart within a month if each carries its own copy.
//
// ─────────────────────────────────────────────────────────────────────────
// BEFORE LAUNCH: replace every value marked TODO. They are deliberately
// obvious rather than plausible-looking placeholders, so an unfinished one is
// impossible to miss on the rendered page.
// ─────────────────────────────────────────────────────────────────────────

export const COMPANY = {
  /** Trading name shown to customers. */
  tradingName: 'CareerBridge Way',

  /** Registered company name, exactly as it appears at Companies House. */
  legalName: 'TODO — registered company name',

  /** Companies House registration number. */
  companyNumber: 'TODO — company number',

  /**
   * Registered office address. Use the registered or agent address, never a
   * home address: this is published on a public page, and once it is indexed
   * it is very hard to take back.
   */
  address: 'TODO — registered office address',

  /** VAT number, or null if not registered. UK registration is required above
   *  the £90,000 threshold; below it, leave this null and charge no UK VAT. */
  vatNumber: null as string | null,

  jurisdiction: 'England and Wales',
  country: 'United Kingdom',
} as const;

/**
 * Minimum age for an account.
 *
 * 16 is a business choice rather than a legal floor — UK law sets the age of
 * consent for information society services at 13 — but the assessment asks
 * personal questions and the report is about life decisions, so the higher
 * line is the defensible one. The signup form asks, and /api/auth/signup
 * refuses without it.
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
export const TERMS_VERSION = '2026-09-30';

export const CONTACT = {
  /** Answered by a human. Also the support address the launch checklist wants. */
  support: 'TODO@example.com',
  /** Data protection requests: access, deletion, export, objections. */
  privacy: 'TODO@example.com',
} as const;

/**
 * Shown as "Last updated" on each document.
 *
 * Bump the one you actually changed. A document whose date moves every deploy
 * teaches people the date means nothing, and the date is what tells a customer
 * whether the terms they agreed to are the terms on the page.
 */
export const LAST_UPDATED = {
  privacy: '6 October 2026',
  terms: '30 September 2026',
  refunds: '30 September 2026',
  cookies: '30 September 2026',
  acceptableUse: '30 September 2026',
  aiNotice: '30 September 2026',
} as const;

/**
 * Everyone we send personal data to, and why.
 *
 * This list does triple duty: the privacy policy renders it (the reel costs
 * $7,988 for omitting third-party collectors), the UK GDPR record of
 * processing needs it, and it is the checklist of who you owe a data
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
    data: 'Email address, account identifiers, assessment answers, generated reports',
    region: 'European Union (Frankfurt, Germany)',
  },
  {
    name: 'OpenAI',
    purpose: 'Generating your career report from your answers',
    data: 'The answers used to write the report. Not used to train their models.',
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
    purpose: 'Hosting the website',
    data: 'Technical request logs, including IP address',
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
    purpose: 'Sending receipts, sign-in links and "report ready" emails',
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
    what: 'Payment records',
    how_long: '6 years from the end of the relevant tax year',
    why: 'UK tax law requires businesses to keep records of sales for this long. These are kept even after account deletion, with your name and email removed where possible.',
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
 * True once the placeholders have been filled in.
 *
 * Used to render an unmissable banner on the legal pages while the details are
 * still TODO — a privacy policy that names "TODO — registered company name" in
 * production is worse than not shipping one, because it looks like you tried.
 */
export function legalDetailsComplete(): boolean {
  return ![
    COMPANY.legalName,
    COMPANY.companyNumber,
    COMPANY.address,
    CONTACT.support,
    CONTACT.privacy,
  ].some((value) => value.includes('TODO'));
}
