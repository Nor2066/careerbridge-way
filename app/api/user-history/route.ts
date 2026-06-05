import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET() {
  try {
    // Get authenticated user from session cookie
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all user_results for this user
    const { data: results, error: resultsError } = await supabaseServer
      .from('user_results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (resultsError) throw resultsError;

    // For each result, fetch the corresponding AI reports
    const history = await Promise.all(
      results.map(async (result) => {
        // First AI report (main report) – find the closest one by created_at
        const { data: mainReports } = await supabaseServer
          .from('ai_main_reports')
          .select('report, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        // Second AI report (follow-up roadmap)
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