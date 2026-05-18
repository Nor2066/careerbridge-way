import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, feedbackRating, feedbackComment, topClusters, rawScores, answers } = await request.json();

    // Insert into Supabase
    const { error } = await supabase.from('assessments').insert([
      {
        email,
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