// app/api/load-progress/route.ts
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

    const { data, error: dbError } = await supabaseServer
      .from('user_progress')
      .select('answers, step')
      .eq('user_id', user.id)
      .maybeSingle();

    if (dbError) throw dbError;

    return NextResponse.json(data || { answers: null, step: null });
  } catch (err) {
    // An expired session is not a server fault — answer 401 so the client
    // can prompt a sign-in instead of showing an error.
    if (isUnauthorized(err)) return unauthorizedResponse();
    Sentry.captureException(err);
    console.error('LOAD PROGRESS ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}