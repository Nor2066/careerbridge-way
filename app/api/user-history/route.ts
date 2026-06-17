// app/api/user-history/route.ts
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { requireAuth } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase-server';
import { readLimiter, getUserIdentifier } from '@/lib/rate-limit';

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);

    const { success } = await readLimiter.limit(getUserIdentifier(user.id));
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Fetch results and followup unlocks in parallel
    const [resultsRes, unlocksRes] = await Promise.all([
      supabaseServer
        .from('user_results')
        .select(`
          id,
          created_at,
          top_clusters,
          ai_main_reports (report),
          ai_followup_reports (report)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),

      supabaseServer
        .from('followup_unlocks')
        .select('result_id')
        .eq('user_id', user.id),
    ]);

    if (resultsRes.error) {
      console.error('USER HISTORY DB ERROR:', resultsRes.error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Build a set of unlocked result IDs for O(1) lookup
    const unlockedResultIds = new Set(
      (unlocksRes.data ?? []).map((u: { result_id: string }) => u.result_id)
    );

    const history = resultsRes.data.map((item) => ({
      id: item.id,
      createdAt: item.created_at,
      topClusters: item.top_clusters,
      firstAIReport: item.ai_main_reports?.[0]?.report || null,
      detailedRoadmap: item.ai_followup_reports?.[0]?.report || null,
      // Full plan users have all followups included — mark as unlocked
      // Basic plan users need a row in followup_unlocks
      followupUnlocked: unlockedResultIds.has(item.id),
    }));

    return NextResponse.json(history);
  } catch (err) {
    Sentry.captureException(err);
    console.error('USER HISTORY ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}