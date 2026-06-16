// lib/subscription.ts
import { supabaseServer } from '@/lib/supabase-server';

export type SubscriptionRow = {
  user_id: string;
  plan: 'free' | 'basic' | 'full';
  main_attempts_remaining: number;
  followups_paid_count: number;
  bonus_attempt_granted: boolean;
  current_attempt_status: 'none' | 'in_progress' | 'awaiting_followup_decision';
  current_attempt_result_id: string | null;
};

export async function getSubscription(userId: string): Promise<SubscriptionRow> {
  const { data, error } = await supabaseServer
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  // If no row exists (new user, or row missing), auto-create one and return
  // a default free subscription. This prevents the chicken-and-egg problem
  // where a user can't purchase a plan because we can't find their subscription.
  if (!data) {
    console.warn(`No subscription row for user ${userId} — creating default free row`);

    const { data: newRow, error: insertError } = await supabaseServer
      .from('subscriptions')
      .upsert(
        {
          user_id: userId,
          plan: 'free',
          main_attempts_remaining: 0,
          current_attempt_status: 'none',
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (insertError || !newRow) {
      // Last resort — return an in-memory default so the user isn't blocked
      console.error(`Failed to create subscription row for ${userId}:`, insertError?.message);
      return {
        user_id: userId,
        plan: 'free',
        main_attempts_remaining: 0,
        followups_paid_count: 0,
        bonus_attempt_granted: false,
        current_attempt_status: 'none',
        current_attempt_result_id: null,
      };
    }

    return newRow as SubscriptionRow;
  }

  return data as SubscriptionRow;
}

// ─── Can the user start a new main questionnaire? ───────────────────────
// Rules:
//   - 'in_progress'             -> YES, they're just continuing/restarting before AI report (free)
//   - 'awaiting_followup_decision' -> NO, must finish current attempt first (handle followup via history)
//   - 'none' + attempts > 0     -> YES, starting fresh consumes nothing yet (consumed at generate-report)
//   - 'none' + attempts === 0   -> NO, must purchase
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

  // status === 'none'
  if (sub.main_attempts_remaining > 0) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'You have no attempts remaining. Please purchase a plan or top-up.',
  };
}

// ─── Can the user generate the followup report for a given result? ──────
// Full plan: always yes (included).
// Basic plan: only if a followup_unlocks row exists for this result_id.
export async function canAccessFollowup(
  userId: string,
  resultId: string,
  plan: SubscriptionRow['plan']
): Promise<boolean> {
  if (plan === 'full') return true;

  const { data, error } = await supabaseServer
    .from('followup_unlocks')
    .select('id')
    .eq('user_id', userId)
    .eq('result_id', resultId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

// ─── Mark assessment as "in progress" (called from save-result) ─────────
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
// Called from generate-report — this is the "point of no return".
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

// ─── Reset to 'none' once the user moves on (finishes followup or skips it) ──
// Called from generate-followup-report on success, or from a "skip followup"
// action the frontend can call.
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