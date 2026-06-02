import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { getAuthenticatedUser } from '@/lib/supabase-server-auth';
import { saveResultLimiter, getIP } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = getIP(request);
  const { success } = await saveResultLimiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, userId, feedbackRating, feedbackComment, topClusters, rawScores, answers } = await request.json();
    if (userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabaseServer.from('assessments').insert([
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