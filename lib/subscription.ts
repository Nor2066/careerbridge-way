// lib/subscription.ts
import { supabaseServer } from '@/lib/supabase-server';

export type SubscriptionRow = {
  user_id: string;
  plan: 'free' | 'basic' | 'full';
  main_attempts_remaining: number;
  followups_paid_count: number; // legacy — no longer incremented, kept for old data
  bonus_attempt_granted: boolean;
  topup_followup_credits: number;
  followup_bundle_purchased: boolean; // new — account-wide followup unlock
  current_attempt_status: 'none' | 'in_progress' | 'awaiting_followup_decision';
  current_attempt_result_id: string | null;
};

export async function getSubscription(userId: string): Promise<SubscriptionRow> {
  const { data, error } = await supabaseServer
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error(`Supabase error fetching subscription for ${userId}:`, error.message, 'code:', error.code);
    throw new Error(`Database error fetching subscription: ${error.message}`);
  }

  if (!data) {
    console.warn(`No subscription row for ${userId} — attempting upsert`);
    const { data: created, error: upsertError } = await supabaseServer
      .from('subscriptions')
      .upsert(
        { user_id: userId, plan: 'free', main_attempts_remaining: 0, topup_followup_credits: 0, followup_bundle_purchased: false },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (upsertError || !created) {
      console.error(`Upsert failed for ${userId}:`, upsertError?.message, 'code:', upsertError?.code);
      return {
        user_id: userId,
        plan: 'free',
        main_attempts_remaining: 0,
        followups_paid_count: 0,
        bonus_attempt_granted: false,
        topup_followup_credits: 0,
        followup_bundle_purchased: false,
        current_attempt_status: 'none',
        current_attempt_result_id: null,
      };
    }
    return created as SubscriptionRow;
  }

  return data as SubscriptionRow;
}

// ─── Can the user start a new main questionnaire? ───────────────────────
export function canStartAssessment(sub: SubscriptionRow): { allowed: boolean; reason?: string } {
  if (sub.current_attempt_status === 'in_progress') {
    return { allowed: true };
  }

  if (sub.current_attempt_status === 'awaiting_followup_decision') {
    return {
      allowed: false,
      reason: 'Please finish your current assessment (followup) before starting a new one.',
    };
  }

  if (sub.main_attempts_remaining > 0) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'You have no attempts remaining. Please purchase a plan or top-up.',
  };
}

// ─── Can the user generate the followup report for a given result? ──────
// Priority order:
//   1. Full plan                  → always included, no cost
//   2. followup_bundle_purchased  → account-wide bundle covers all attempts
//   3. Legacy followup_unlocks row → honors any pre-existing per-attempt
//      unlocks purchased before the pricing model changed
//   4. topup_followup_credits     → top-up purchased attempt; consume 1 credit
export async function canAccessFollowup(
  userId: string,
  resultId: string,
  plan: SubscriptionRow['plan']
): Promise<boolean> {
  if (plan === 'full') return true;

  const { data: sub, error: subError } = await supabaseServer
    .from('subscriptions')
    .select('followup_bundle_purchased, topup_followup_credits')
    .eq('user_id', userId)
    .single();

  if (subError) throw subError;

  if (sub?.followup_bundle_purchased) return true;

  const { data: unlock, error: unlockError } = await supabaseServer
    .from('followup_unlocks')
    .select('id')
    .eq('user_id', userId)
    .eq('result_id', resultId)
    .maybeSingle();

  if (unlockError) throw unlockError;
  if (unlock) return true;

  if (sub && sub.topup_followup_credits > 0) {
    const { error: decrementError } = await supabaseServer
      .from('subscriptions')
      .update({ topup_followup_credits: sub.topup_followup_credits - 1 })
      .eq('user_id', userId);

    if (decrementError) throw decrementError;

    const { error: insertError } = await supabaseServer
      .from('followup_unlocks')
      .insert({ user_id: userId, result_id: resultId });

    if (insertError && insertError.code !== '23505') throw insertError;

    return true;
  }

  return false;
}

// ─── Mark assessment as "in progress" ───────────────────────────────────
export async function markAssessmentInProgress(userId: string, resultId: string): Promise<void> {
  const { error } = await supabaseServer
    .from('subscriptions')
    .update({
      current_attempt_status: 'in_progress',
      current_attempt_result_id: resultId,
    })
    .eq('user_id', userId);

  if (error) throw error;
}

// ─── Consume an attempt + transition to awaiting_followup_decision ───────
//
// Written as a compare-and-swap rather than a plain update. The old version
// read the row, subtracted one in JavaScript, and wrote the result back — so
// two requests that read the same row (two tabs, or a retry racing the
// original) both computed the same "one fewer" and the second silently undid
// the first. Gating the update on the values we read makes the database the
// arbiter: exactly one writer matches, and the loser is told it lost.
//
// Returns false when someone else got there first. Callers should treat that
// as "this attempt is already being generated", not as an error.
export async function consumeAttemptAndAwaitFollowup(
  userId: string,
  sub: SubscriptionRow
): Promise<boolean> {
  const { data, error } = await supabaseServer
    .from('subscriptions')
    .update({
      main_attempts_remaining: Math.max(0, sub.main_attempts_remaining - 1),
      current_attempt_status: 'awaiting_followup_decision',
    })
    .eq('user_id', userId)
    // The guard: every field we based the new value on must still hold.
    .eq('current_attempt_status', 'in_progress')
    .eq('main_attempts_remaining', sub.main_attempts_remaining)
    .select('user_id');

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

// ─── Give a consumed attempt back ────────────────────────────────────────
//
// Report generation consumes the attempt before calling OpenAI, deliberately:
// the alternative is generating first and risking two concurrent requests each
// producing a paid report. But that ordering means an OpenAI timeout or outage
// left the customer with one fewer attempt and nothing to show for it — the
// single most refund-worthy failure this product has.
//
// So the consume is now a reservation, and this puts it back if generation
// never happened. Guarded the same way: only reverses the exact transition we
// made, so it can't hand out a free attempt if the state has moved on.
export async function restoreConsumedAttempt(
  userId: string,
  sub: SubscriptionRow
): Promise<void> {
  const { error } = await supabaseServer
    .from('subscriptions')
    .update({
      main_attempts_remaining: sub.main_attempts_remaining,
      current_attempt_status: 'in_progress',
    })
    .eq('user_id', userId)
    .eq('current_attempt_status', 'awaiting_followup_decision')
    .eq('main_attempts_remaining', Math.max(0, sub.main_attempts_remaining - 1))
    .eq('current_attempt_result_id', sub.current_attempt_result_id ?? '');

  // A failed restore must not mask the original error the caller is handling —
  // log it and let the caller report the real failure.
  if (error) {
    console.error('RESTORE ATTEMPT FAILED for', userId, error.message);
  }
}

// ─── Reset to 'none' once the user moves on ─────────────────────────────
export async function finishCurrentAttempt(userId: string): Promise<void> {
  const { error } = await supabaseServer
    .from('subscriptions')
    .update({
      current_attempt_status: 'none',
      current_attempt_result_id: null,
    })
    .eq('user_id', userId);

  if (error) throw error;
}