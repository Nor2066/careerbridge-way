// lib/subscription.ts
import { supabaseServer } from '@/lib/supabase-server';

export type SubscriptionRow = {
  user_id: string;
  plan: 'free' | 'basic' | 'full';
  main_attempts_remaining: number;
  followups_paid_count: number;
  bonus_attempt_granted: boolean;
  topup_followup_credits: number; // incremented on topup purchase; consumed when followup is accessed
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
        { user_id: userId, plan: 'free', main_attempts_remaining: 0, topup_followup_credits: 0 },
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
//   1. Full plan              → always included, no cost
//   2. topup_followup_credits → top-up purchased attempt; consume 1 credit
//   3. followup_unlocks row   → Basic plan paid-per-attempt unlock
//
// Credits are consumed here (at report generation time) rather than at
// followup questionnaire start, so a user who starts but doesn't finish
// doesn't lose their credit.
export async function canAccessFollowup(
  userId: string,
  resultId: string,
  plan: SubscriptionRow['plan']
): Promise<boolean> {
  // Full plan: always included
  if (plan === 'full') return true;

  // Check for a pre-paid followup_unlocks row (Basic per-attempt unlock)
  const { data: unlock, error: unlockError } = await supabaseServer
    .from('followup_unlocks')
    .select('id')
    .eq('user_id', userId)
    .eq('result_id', resultId)
    .maybeSingle();

  if (unlockError) throw unlockError;
  if (unlock) return true;

  // Check for a topup followup credit — these cover attempts started via
  // a top-up purchase (which grants a full main + followup attempt).
  // Consume 1 credit and insert a followup_unlocks row so subsequent calls
  // (e.g. retries) don't double-consume.
  const { data: sub, error: subError } = await supabaseServer
    .from('subscriptions')
    .select('topup_followup_credits')
    .eq('user_id', userId)
    .single();

  if (subError) throw subError;

  if (sub && sub.topup_followup_credits > 0) {
    // Decrement the credit
    const { error: decrementError } = await supabaseServer
      .from('subscriptions')
      .update({ topup_followup_credits: sub.topup_followup_credits - 1 })
      .eq('user_id', userId);

    if (decrementError) throw decrementError;

    // Insert a followup_unlocks row so this result is permanently marked
    // as unlocked — idempotent on retry due to the unique constraint
    const { error: insertError } = await supabaseServer
      .from('followup_unlocks')
      .insert({ user_id: userId, result_id: resultId });

    // 23505 = unique violation (already unlocked — safe to ignore)
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
export async function consumeAttemptAndAwaitFollowup(
  userId: string,
  sub: SubscriptionRow
): Promise<void> {
  const { error } = await supabaseServer
    .from('subscriptions')
    .update({
      main_attempts_remaining: Math.max(0, sub.main_attempts_remaining - 1),
      current_attempt_status: 'awaiting_followup_decision',
    })
    .eq('user_id', userId);

  if (error) throw error;
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