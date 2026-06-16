// app/api/save-results/route.ts
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase-server';
import { saveResultLimiter, getUserIdentifier } from '@/lib/rate-limit';

const SaveResultsSchema = z.object({
  feedbackRating: z.number().int().min(1).max(5).optional(),
  feedbackComment: z.string().max(2000).optional(),
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
      feedback_rating: feedbackRating,
      feedback_comment: feedbackComment,
      top_clusters: topClusters,
      raw_scores: rawScores,
      answers,
    }]);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (err) {
    Sentry.captureException(err);
    console.error('SAVE RESULTS ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}