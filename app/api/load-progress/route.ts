// app/api/load-progress/route.ts
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
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

    const { data, error: dbError } = await supabaseServer
      .from('user_progress')
      .select('answers, step')
      .eq('user_id', user.id)
      .maybeSingle();

    if (dbError) throw dbError;

    return NextResponse.json(data || { answers: null, step: null });
  } catch (err) {
    Sentry.captureException(err);
    console.error('LOAD PROGRESS ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}