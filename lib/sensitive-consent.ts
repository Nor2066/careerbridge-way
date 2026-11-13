// lib/sensitive-consent.ts
//
// Explicit consent (GDPR Article 9(2)(a)) for sensitive details a student
// chooses to write into the four free-text answers: health, disability,
// religion and the like. We never ask for them; some people write them anyway.
//
// The EDPB's consent guidelines (05/2020, paragraphs 93-96) say explicit
// consent needs an express statement, such as an unticked box saying "I
// consent". Writing the details after being told not to is not one, which is
// what the privacy policy used to rely on. So the last step of the assessment
// shows an unticked box, and its answer is stored with the answers it covers.
//
// The box is optional. Not ticking it does not block anything: the step tells
// the student to go back and take such details out instead.

/** Move this when the wording of the box changes, so each record says which wording was agreed to. */
export const SENSITIVE_CONSENT_VERSION = '2026-11-13';

export type SensitiveConsentRecord = {
  given: boolean;
  /** Server time when the answers were saved with the box ticked; null if not ticked. */
  at: string | null;
  version: string;
};

/**
 * The answers as they will be saved, with the client's yes/no replaced by a
 * record the server stamps itself. Anything other than literal `true` counts
 * as not given: a missing or malformed value must never read as consent.
 */
export function stampSensitiveConsent(
  answers: Record<string, unknown>,
  now: Date
): Record<string, unknown> & { sensitiveConsent: SensitiveConsentRecord } {
  const given = answers.sensitiveConsent === true;
  return {
    ...answers,
    sensitiveConsent: { given, at: given ? now.toISOString() : null, version: SENSITIVE_CONSENT_VERSION },
  };
}
