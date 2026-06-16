// app/api/save-followup/route.ts
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase-server';
import { saveResultLimiter, getUserIdentifier } from '@/lib/rate-limit';

const SaveFollowupSchema = z.object({
  answers: z.record(z.string(), z.unknown()),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);

    const { success } = await saveResultLimiter.limit(getUserIdentifier(user.id));
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = SaveFollowupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid answers format' }, { status: 400 });
    }

    const { error: dbError } = await supabaseServer.from('followup_answers').insert({
      user_id: user.id,
      answers: parsed.data.answers,
    });

    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (err) {
    Sentry.captureException(err);
    console.error('SAVE FOLLOWUP ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}