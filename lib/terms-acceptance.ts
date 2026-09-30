// lib/terms-acceptance.ts
//
// Records that someone confirmed their age and accepted the terms when they
// created their account.
//
// WHY BOTHER STORING IT
//
// A tickbox that records nothing proves nothing. The question that actually
// gets asked later — by a customer disputing a charge, or by anyone reviewing
// the contract — is "which wording did this person agree to, and when?", and
// that is only answerable if the version is stamped at the time. Inferring it
// from whatever is published today is not the same thing, because the wording
// will have moved on.
//
// WHY IT NEVER OVERWRITES
//
// The stamp is written only when the column is still null, so it captures the
// FIRST acceptance and nothing later touches it. Signing in again is not a new
// agreement, and quietly rewriting the date to today would destroy the only
// useful property the record has.
//
// WHY A FAILURE HERE IS SWALLOWED
//
// This runs after the account already exists. If the update fails, the right
// outcome is a customer with an account and a missing audit row — not a
// customer who was charged nothing, got no account, and saw an error because
// a bookkeeping write failed. The failure goes to Sentry, where it can be
// fixed, rather than to the person signing up.

import * as Sentry from '@sentry/nextjs';
import { supabaseServer } from '@/lib/supabase-server';
import { TERMS_VERSION } from '@/lib/legal';

/**
 * Stamp the profile with the terms version accepted and the age confirmation.
 *
 * Safe to call more than once: only the first call writes anything.
 */
export async function recordTermsAcceptance(userId: string): Promise<void> {
  try {
    const { error } = await supabaseServer
      .from('profiles')
      .update({
        terms_accepted_at: new Date().toISOString(),
        terms_version: TERMS_VERSION,
        age_confirmed_at: new Date().toISOString(),
      })
      .eq('id', userId)
      // The guard that makes this idempotent. Without it, every Google
      // sign-in would rewrite the acceptance date.
      .is('terms_accepted_at', null);

    if (error) {
      // Not thrown: see the note at the top of this file.
      console.error('TERMS ACCEPTANCE: could not stamp profile', userId, error.message);
      Sentry.captureMessage('Failed to record terms acceptance', {
        level: 'warning',
        extra: { userId, error: error.message },
      });
    }
  } catch (err) {
    console.error('TERMS ACCEPTANCE: unexpected failure', err);
    Sentry.captureException(err);
  }
}
