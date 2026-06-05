import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: Request) {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the token and get the user
    const { data: { user }, error: userError } = await supabaseServer.auth.getUser(token);
    if (userError || !user) {
      console.error('Token verification failed:', userError?.message);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user_results with AI reports
    const { data, error } = await supabaseServer
      .from('user_results')
      .select(`
        id,
        created_at,
        top_clusters,
        ai_main_reports (report),
        ai_followup_reports (report)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const history = data.map(item => ({
      id: item.id,
      createdAt: item.created_at,
      topClusters: item.top_clusters,
      firstAIReport: item.ai_main_reports?.[0]?.report || null,
      detailedRoadmap: item.ai_followup_reports?.[0]?.report || null,
    }));

    return NextResponse.json(history);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}