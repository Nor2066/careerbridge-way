// app/api/user-history/route.ts
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase-server';
import { readLimiter, getUserIdentifier } from '@/lib/rate-limit';

export async function GET() {
  try {
    const user = await requireAuth();

    const { success } = await readLimiter.limit(getUserIdentifier(user.id));
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

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
      console.error('USER HISTORY DB ERROR:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const history = data.map((item) => ({
      id: item.id,
      createdAt: item.created_at,
      topClusters: item.top_clusters,
      firstAIReport: item.ai_main_reports?.[0]?.report || null,
      detailedRoadmap: item.ai_followup_reports?.[0]?.report || null,
    }));

    return NextResponse.json(history);
  } catch (err) {
    Sentry.captureException(err);
    console.error('USER HISTORY ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}