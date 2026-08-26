// lib/password.ts
//
// One password policy, shared by signup, reset, and change. Three places
// enforcing three different rules is how someone ends up unable to set at
// reset the password they were allowed to choose at signup.
//
// The rules follow NIST SP 800-63B rather than the composition rules most
// sites still use. That guidance is deliberate about two things:
//
//   • Length beats character classes. "Must contain an uppercase, a number
//     and a symbol" reliably produces "Password1!", which is in every
//     cracking dictionary. It makes passwords harder for humans and barely
//     harder for machines.
//
//   • Check against known-breached passwords instead. That is the rule that
//     actually removes the passwords attackers try first, and it is what
//     "credential stuffing" defeats when it is missing.
//
// So: a real minimum length, a check against Have I Been Pwned, and a block
// on the handful of app-specific choices (your own email, the site name).

import { createHash } from 'crypto';
import { z } from 'zod';

/**
 * Ten rather than eight.
 *
 * Supabase's own default is six, and the signup route previously asked for
 * eight — so the effective floor was whichever happened to run first. Set the
 * Supabase minimum to match this number, or the two disagree again and the
 * user gets whichever error arrives first.
 */
export const MIN_PASSWORD_LENGTH = 10;

/** Above any plausible real password; stops a huge body being hashed. */
export const MAX_PASSWORD_LENGTH = 256;

/**
 * Base shape. Does not include the breach check, which is async and needs a
 * network call — routes run `assessPassword` for that.
 */
export const PasswordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters.`)
  .max(MAX_PASSWORD_LENGTH);

/**
 * Passwords that are technically long enough but specific to this site, so
 * they would not necessarily appear in a generic breach list.
 */
const SITE_SPECIFIC = [
  'careerbridge',
  'careerbridgeway',
  'careerbridge123',
];

export type PasswordProblem =
  | { ok: false; reason: string }
  | { ok: true };

/**
 * Ask Have I Been Pwned whether this password appears in a known breach.
 *
 * Uses their k-anonymity range API: we send the first five characters of the
 * SHA-1 hash and get back every suffix sharing that prefix. The password
 * itself, and 35 of the 40 hash characters, never leave this process — so this
 * is not "sending the user's password to a third party", and it needs no API
 * key.
 *
 * Fails OPEN. If HIBP is slow or down, a user must still be able to set a
 * password; refusing signups because a third-party service is unavailable
 * trades a small security gain for a total outage of registration.
 */
export async function isBreachedPassword(password: string): Promise<boolean> {
  try {
    const hash = createHash('sha1').update(password, 'utf8').digest('hex').toUpperCase();
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' },
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) return false;

    const body = await response.text();
    for (const line of body.split('\n')) {
      const [candidate] = line.trim().split(':');
      if (candidate === suffix) return true;
    }
    return false;
  } catch {
    // Network error, timeout, or a bad response — allow the password through.
    return false;
  }
}

/**
 * The full check. Cheap local rules first, network call last, so an obviously
 * bad password never costs a round trip.
 *
 * `email` is compared because reusing your own address as your password is
 * common, and it is the first thing anyone with a user list would try.
 */
export async function assessPassword(
  password: string,
  email?: string | null
): Promise<PasswordProblem> {
  const parsed = PasswordSchema.safeParse(password);
  if (!parsed.success) {
    return { ok: false, reason: parsed.error.issues[0]?.message ?? 'That password is not valid.' };
  }

  const lower = password.toLowerCase();

  if (email) {
    const local = email.toLowerCase().split('@')[0];
    if (local.length >= 3 && lower.includes(local)) {
      return {
        ok: false,
        reason: 'Your password cannot contain your email address.',
      };
    }
  }

  if (SITE_SPECIFIC.some((term) => lower.includes(term))) {
    return {
      ok: false,
      reason: 'Please choose something that is not based on the name of this site.',
    };
  }

  // A single repeated character, or a straight run, passes a length check but
  // is not a password.
  if (/^(.)\1+$/.test(password)) {
    return { ok: false, reason: 'Please choose something less repetitive.' };
  }

  if (await isBreachedPassword(password)) {
    return {
      ok: false,
      reason:
        'That password has appeared in a known data breach, so attackers try it first. Please choose a different one.',
    };
  }

  return { ok: true };
}

/**
 * Guidance shown next to the field, phrased as help rather than as a list of
 * prohibitions. Kept here so the form and the server never disagree about
 * what the rule is.
 */
export const PASSWORD_HINT =
  `At least ${MIN_PASSWORD_LENGTH} characters. A few unrelated words are easier to remember and harder to guess than a short password with symbols in it.`;
