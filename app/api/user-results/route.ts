// app/api/user-results/route.ts
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

    const { data, error } = await supabaseServer
      .from('user_results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('USER RESULTS DB ERROR:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    Sentry.captureException(err);
    console.error('USER RESULTS ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}