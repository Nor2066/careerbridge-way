import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request: Request) {
  console.log('✅ generate-followup-report API called');
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      console.log('❌ No token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error } = await supabaseServer.auth.getUser(token);
    if (error || !user) {
      console.log('❌ Auth failed:', error?.message);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, mainAnswers, topClusters, followupAnswers } = await request.json();
    if (!userId || userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Return a simple test report
    const report = "This is a test report. If you see this, the API is working correctly.";

    // Optionally save to database
    await supabaseServer.from('ai_followup_reports').insert({
      user_id: userId,
      report,
      top_clusters: topClusters,
      followup_answers: followupAnswers,
    }).catch(console.error);

    return NextResponse.json({ report });
  } catch (err: any) {
    console.error('Error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}