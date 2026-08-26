// app/api/save-progress/route.ts
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { isUnauthorized, unauthorizedResponse } from '@/lib/api-errors';
import { supabaseServer } from '@/lib/supabase-server';
import { saveProgressLimiter, getUserIdentifier } from '@/lib/rate-limit';

const SaveProgressSchema = z.object({
  answers: z.record(z.string(), z.unknown()),
  step: z.number().int().min(0),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);

    // Use high-limit progress limiter — this is called on every question answer
    const { success } = await saveProgressLimiter.limit(getUserIdentifier(user.id));
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = SaveProgressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const { answers, step } = parsed.data;

    const { error: dbError } = await supabaseServer
      .from('user_progress')
      .upsert(
        { user_id: user.id, answers, step, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );

    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (err) {
    // An expired session is not a server fault — answer 401 so the client
    // can prompt a sign-in instead of showing an error.
    if (isUnauthorized(err)) return unauthorizedResponse();
    Sentry.captureException(err);
    console.error('SAVE PROGRESS ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}