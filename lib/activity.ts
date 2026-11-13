// lib/activity.ts
//
// Records that an account is in use, so the nightly job (lib/inactive-accounts.ts)
// can tell a forgotten account from one whose owner simply never signs out.
//
// Called after the response on each signed-in page load (app/api/auth/me),
// and written at most once a day per account: the update only matches a row
// whose stored time is more than a day old, so every later call that day
// changes nothing.
//
// Deliberately not Supabase's own last_sign_in_at. That moves only when
// someone signs in, and a session here lasts until it is ended — a student
// who signed in once and has used the site every week since would look
// four years idle.

if (typeof window !== 'undefined') {
  throw new Error('This module is server-only and must not be imported by client code');
}

import { supabaseServer } from '@/lib/supabase-server';
import { activityTouchThreshold } from '@/lib/retention-rules';

/** The column does not exist until supabase/retention-rules.sql has been run. */
function isMissingColumn(error: { code?: string } | null): boolean {
  return error?.code === '42703' || error?.code === 'PGRST204';
}

/**
 * Never throws and never matters to the request that triggered it: a failure
 * here costs one day of precision on a four-year clock.
 */
export async function touchLastActive(userId: string, now: Date = new Date()): Promise<void> {
  try {
    const { error } = await supabaseServer
      .from('profiles')
      .update({ last_active_at: now.toISOString() })
      .eq('id', userId)
      .lt('last_active_at', activityTouchThreshold(now).toISOString());

    if (error && !isMissingColumn(error)) {
      console.error('ACTIVITY: could not record last use:', error.message);
    }
  } catch (err) {
    console.error('ACTIVITY: could not record last use:', err);
  }
}
