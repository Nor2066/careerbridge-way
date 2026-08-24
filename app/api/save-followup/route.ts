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
  // Which attempt this followup belongs to. Optional so older clients keep
  // working: when it's absent we fall back to the current in-flight attempt.
  assessmentId: z.string().uuid().optional(),
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
    //
    // The attempt being answered is whichever one the client says it is —
    // ownership is verified below. It deliberately is NOT required to be the
    // "current" attempt: followups started from the history page (an older
    // attempt the customer skipped at the time) are a normal, supported path,
    // and requiring current_attempt_status === 'awaiting_followup_decision'
    // meant those users answered the whole questionnaire and only got told
    // "No followup in progress." on the very last click, losing every answer.
    const sub = await getSubscription(user.id);

    const assessmentId = parsed.data.assessmentId ?? sub.current_attempt_result_id;
    if (!assessmentId) {
      return NextResponse.json(
        { error: 'No assessment found for this followup. Open it from your history page and try again.' },
        { status: 400 }
      );
    }

    const { data: ownedResult, error: ownerError } = await supabaseServer
      .from('user_results')
      .select('id')
      .eq('id', assessmentId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (ownerError) throw ownerError;
    if (!ownedResult) {
      return NextResponse.json({ error: 'Assessment not found.' }, { status: 404 });
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