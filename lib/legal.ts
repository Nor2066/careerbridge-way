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
  privacy: '26 August 2026',
  terms: '26 August 2026',
  refunds: '26 August 2026',
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
    region: 'See your project region in the Supabase dashboard',
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
    region: 'United States',
  },
  {
    name: 'Upstash',
    purpose: 'Rate limiting, to stop abuse of the service',
    data: 'A hashed identifier and a request count. No assessment content.',
    region: 'Europe',
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
