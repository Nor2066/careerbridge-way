// app/api/user-results/route.ts
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { isUnauthorized, unauthorizedResponse } from '@/lib/api-errors';
import { supabaseServer } from '@/lib/supabase-server';
import { readLimiter, getUserIdentifier } from '@/lib/rate-limit';

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);

    const { success } = await readLimiter.limit(getUserIdentifier(user.id));
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Named columns rather than '*'. The raw `answers` and `raw_scores` blobs
    // are the most sensitive thing this table holds and no caller needs them,
    // so they should not be sitting in a response body that any browser
    // extension or logging proxy can read.
    const { data, error } = await supabaseServer
      .from('user_results')
      .select('id, created_at, top_clusters')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('USER RESULTS DB ERROR:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    // An expired session is not a server fault — answer 401 so the client
    // can prompt a sign-in instead of showing an error.
    if (isUnauthorized(err)) return unauthorizedResponse();
    Sentry.captureException(err);
    console.error('USER RESULTS ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}