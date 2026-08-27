// lib/analytics.ts
//
// Funnel tracking, first-party.
//
// WHY NOT PLAUSIBLE / UMAMI / VERCEL ANALYTICS
//
// The question this has to answer is "where do people give up in a
// 46-question assessment", which needs custom events, not pageviews. On the
// plans available that is either a paid tier or a self-hosted service. And
// every hosted option is another company receiving user data, which means
// another row in the privacy policy, another data processing agreement, and
// another entry in the GDPR subprocessor register — real recurring work for
// something the existing database can do.
//
// WHY THIS NEEDS NO COOKIE BANNER
//
// Nothing is stored on the visitor's device. No cookie, no localStorage, no
// sessionStorage. UK PECR regulation 6 is about *storage on terminal
// equipment*, so writing nothing means the consent rule does not apply — and
// that is a deliberate design constraint here, not a happy accident.
//
// The trade is that a "session" ends when the tab reloads, since the id lives
// in a module variable and nothing survives. For measuring where a single
// sitting falls apart, that is exactly the right unit anyway.
//
// WHAT MUST NEVER GO IN HERE
//
// No answers, no report text, no email addresses, no free text of any kind.
// The server enforces this by allowlisting event names and refusing anything
// that is not a small scalar, but the rule starts here: if you find yourself
// wanting to pass a string a user typed, the answer is no.

/** Every event the server will accept. Adding one here means adding it there. */
export const EVENTS = [
  'landing_view',
  'demo_quiz_start',
  'demo_quiz_complete',
  'quiz_start',
  'quiz_question',
  'quiz_abandon_hint',
  'quiz_complete',
  'paywall_view',
  'checkout_start',
  'checkout_cancelled',
  'purchase_complete',
  'report_generate_start',
  'report_view',
  'report_failed',
  'followup_start',
  'followup_question',
  'followup_complete',
  'signup_start',
  'signup_needs_confirmation',
  'account_deleted',
] as const;

export type AnalyticsEvent = (typeof EVENTS)[number];

/** Small scalars only — see the note above about free text. */
export type EventProps = Record<string, string | number | boolean | null>;

/**
 * Identifies one sitting, so a funnel can be followed from landing to purchase.
 *
 * Generated in memory and never written anywhere on the device. A reload
 * starts a new one, which is the cost of not needing a consent banner.
 */
let sessionId: string | null = null;

function getSessionId(): string {
  if (sessionId) return sessionId;
  sessionId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `s_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  return sessionId;
}

/**
 * Record an event. Fire and forget — never awaited, never throws, and never
 * blocks whatever the user was doing.
 *
 * Analytics failing must be invisible. A tracking call that can break a
 * checkout is worse than no tracking at all.
 */
export function track(event: AnalyticsEvent, props: EventProps = {}): void {
  if (typeof window === 'undefined') return;

  try {
    const body = JSON.stringify({
      event,
      sessionId: getSessionId(),
      props,
      // The page, without query string or fragment — those carry Stripe
      // session ids and auth tokens, neither of which belongs in an events
      // table.
      path: window.location.pathname,
    });

    // keepalive lets the request survive the page navigating away, which is
    // exactly when the most interesting events happen (leaving mid-quiz).
    void fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      keepalive: true,
      body,
    }).catch(() => {});
  } catch {
    // Never let instrumentation surface to the user.
  }
}
