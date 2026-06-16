// app/api/save-result/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { requireAuth } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase-server';
import { saveResultLimiter, getUserIdentifier } from '@/lib/rate-limit';
import { getSubscription, canStartAssessment, markAssessmentInProgress } from '@/lib/subscription';

const SaveResultSchema = z.object({
  topClusters: z.array(
    z.object({
      cluster: z.string().max(100),
      percentage: z.number().min(0).max(100),
    })
  ).min(1).max(10),
  rawScores: z.record(z.string(), z.number()),
  answers: z.record(z.string(), z.unknown()),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    const { success } = await saveResultLimiter.limit(getUserIdentifier(user.id));
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // ─── Subscription / attempt check ──────────────────────────────────
    const sub = await getSubscription(user.id);
    const check = canStartAssessment(sub);
    if (!check.allowed) {
      return NextResponse.json({ error: check.reason, code: 'SUBSCRIPTION_REQUIRED' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = SaveResultSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const { topClusters, rawScores, answers } = parsed.data;

    // If the user is restarting (current_attempt_status was 'in_progress' with
    // a previous result_id), we still insert a NEW user_results row — the old
    // one is simply abandoned since no attempt was consumed for it.
    const { data, error } = await supabaseServer
      .from('user_results')
      .insert({ user_id: user.id, top_clusters: topClusters, raw_scores: rawScores, answers })
      .select('id')
      .single();

    if (error) throw error;

    // Mark this new result as the "current" in-progress attempt
    await markAssessmentInProgress(user.id, data.id);

    return NextResponse.json({ success: true, id: data.id });
  } catch (err: any) {
    Sentry.captureException(err);
    console.error('SAVE RESULT ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}