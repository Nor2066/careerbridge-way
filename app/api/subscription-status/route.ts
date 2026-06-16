// app/api/subscription-status/route.ts
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { requireAuth } from '@/lib/auth';
import { getSubscription, canStartAssessment } from '@/lib/subscription';
import { readLimiter, getUserIdentifier } from '@/lib/rate-limit';

// Frontend calls this to decide what UI to show:
// - pricing page (plan === 'free')
// - "start new assessment" button state (canStart)
// - "finish your followup first" banner (current_attempt_status)
export async function GET() {
  try {
    const user = await requireAuth();

    const { success } = await readLimiter.limit(getUserIdentifier(user.id));
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const sub = await getSubscription(user.id);
    const startCheck = canStartAssessment(sub);

    return NextResponse.json({
      plan: sub.plan,
      mainAttemptsRemaining: sub.main_attempts_remaining,
      followupsPaidCount: sub.followups_paid_count,
      bonusAttemptGranted: sub.bonus_attempt_granted,
      currentAttemptStatus: sub.current_attempt_status,
      currentAttemptResultId: sub.current_attempt_result_id,
      canStartAssessment: startCheck.allowed,
      cannotStartReason: startCheck.reason ?? null,
    });
  } catch (err: any) {
    Sentry.captureException(err);
    console.error('SUBSCRIPTION STATUS ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}