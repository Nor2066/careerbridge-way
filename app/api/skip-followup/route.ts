// app/api/skip-followup/route.ts
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { requireAuth } from '@/lib/auth';
import { finishCurrentAttempt } from '@/lib/subscription';
import { readLimiter, getUserIdentifier } from '@/lib/rate-limit';

// Called when a user in 'awaiting_followup_decision' state chooses NOT to
// do the followup right now. Frees them up to start a new assessment
// (consuming another attempt, if available). They can still come back to
// history later and pay to unlock + complete the followup for this attempt.
export async function POST() {
  try {
    const user = await requireAuth();

    const { success } = await readLimiter.limit(getUserIdentifier(user.id));
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    await finishCurrentAttempt(user.id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    Sentry.captureException(err);
    console.error('SKIP FOLLOWUP ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}