// app/api/save-followup/route.ts
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { getSubscription, canAccessFollowup } from '@/lib/subscription';
import { supabaseServer } from '@/lib/supabase-server';
import { saveResultLimiter, getUserIdentifier } from '@/lib/rate-limit';

const SaveFollowupSchema = z.object({
  answers: z.record(z.string(), z.unknown()),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);

    const { success } = await saveResultLimiter.limit(getUserIdentifier(user.id));
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = SaveFollowupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid answers format' }, { status: 400 });
    }

    // Verify the user has paid followup access before saving answers.
    // Uses current_attempt_result_id as the authoritative assessment reference —
    // same pattern as generate-report, avoids "fetch latest" race condition.
    const sub = await getSubscription(user.id);

    if (sub.current_attempt_status !== 'awaiting_followup_decision') {
      return NextResponse.json(
        { error: 'No followup in progress.' },
        { status: 403 }
      );
    }

    const assessmentId = sub.current_attempt_result_id;
    if (!assessmentId) {
      return NextResponse.json(
        { error: 'No active assessment found.' },
        { status: 403 }
      );
    }

    const hasAccess = await canAccessFollowup(user.id, assessmentId, sub.plan);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Followup not unlocked for this assessment.', code: 'FOLLOWUP_LOCKED' },
        { status: 403 }
      );
    }

    const { error: dbError } = await supabaseServer.from('followup_answers').insert({
      user_id: user.id,
      answers: parsed.data.answers,
    });

    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (err) {
    Sentry.captureException(err);
    console.error('SAVE FOLLOWUP ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}