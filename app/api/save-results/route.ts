// app/api/save-results/route.ts
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { isUnauthorized, unauthorizedResponse } from '@/lib/api-errors';
import { supabaseServer } from '@/lib/supabase-server';
import { saveResultLimiter, getUserIdentifier } from '@/lib/rate-limit';

// topClusters, rawScores, and answers are now optional — the feedback popup
// on the followup page only sends feedbackRating + feedbackComment, with no
// access to the original assessment data. Previously these were required,
// which silently failed validation and broke the feedback popup entirely.
const SaveResultsSchema = z.object({
  feedbackRating: z.number().int().min(1).max(5).optional(),
  feedbackComment: z.string().max(2000).optional(),
  topClusters: z.array(
    z.object({
      cluster: z.string().max(100),
      percentage: z.number().min(0).max(100),
    })
  ).max(10).optional(),
  rawScores: z.record(z.string(), z.number()).optional(),
  answers: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);

    const { success } = await saveResultLimiter.limit(getUserIdentifier(user.id));
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = SaveResultsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const { feedbackRating, feedbackComment, topClusters, rawScores, answers } = parsed.data;

    const { error: dbError } = await supabaseServer.from('assessments').insert([{
      email: user.email,
      user_id: user.id,
      feedback_rating: feedbackRating ?? null,
      feedback_comment: feedbackComment ?? null,
      top_clusters: topClusters ?? null,
      raw_scores: rawScores ?? null,
      answers: answers ?? null,
    }]);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (err) {
    // An expired session is not a server fault — answer 401 so the client
    // can prompt a sign-in instead of showing an error.
    if (isUnauthorized(err)) return unauthorizedResponse();
    Sentry.captureException(err);
    console.error('SAVE RESULTS ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}