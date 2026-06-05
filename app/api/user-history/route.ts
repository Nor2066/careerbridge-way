import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { getAuthenticatedUser } from '@/lib/supabase-server-auth';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all user_results for this user, ordered by newest first
    const { data: results, error: resultsError } = await supabaseServer
      .from('user_results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (resultsError) throw resultsError;

    // For each result, fetch corresponding AI reports (by user_id and closest created_at)
    const history = await Promise.all(
      results.map(async (result) => {
        // Fetch the AI main report (first AI) that was created around the same time
        const { data: mainReports } = await supabaseServer
          .from('ai_main_reports')
          .select('report, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        // Fetch the AI follow‑up report (roadmap) for this result (by user_id and closest created_at)
        const { data: followupReports } = await supabaseServer
          .from('ai_followup_reports')
          .select('report, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        return {
          id: result.id,
          createdAt: result.created_at,
          topClusters: result.top_clusters,
          rawScores: result.raw_scores,
          firstAIReport: mainReports?.[0]?.report || null,
          detailedRoadmap: followupReports?.[0]?.report || null,
        };
      })
    );

    return NextResponse.json(history);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}