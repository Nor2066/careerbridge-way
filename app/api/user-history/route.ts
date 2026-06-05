import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET() {
  try {
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

    // Join user_results with AI reports via assessment_id
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

    if (error) throw error;

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