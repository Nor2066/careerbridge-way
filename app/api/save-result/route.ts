import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const { email, userId, feedbackRating, feedbackComment, topClusters, rawScores, answers } = await request.json();

    const { error } = await supabaseServer.from('assessments').insert([
      {
        email,
        user_id: userId || null,
        feedback_rating: feedbackRating,
        feedback_comment: feedbackComment,
        top_clusters: topClusters,
        raw_scores: rawScores,
        answers: answers,
      }
    ]);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}