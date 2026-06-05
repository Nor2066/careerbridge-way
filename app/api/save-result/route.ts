import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error } = await supabaseServer.auth.getUser(token);
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, userId, feedbackRating, feedbackComment, topClusters, rawScores, answers } = await request.json();
    if (!userId || userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error: dbError } = await supabaseServer.from('assessments').insert([
      {
        email,
        user_id: userId,
        feedback_rating: feedbackRating,
        feedback_comment: feedbackComment,
        top_clusters: topClusters,
        raw_scores: rawScores,
        answers,
      }
    ]);

    if (dbError) throw dbError;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}