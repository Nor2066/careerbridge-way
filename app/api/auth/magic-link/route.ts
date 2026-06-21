// app/api/auth/magic-link/route.ts
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { authLimiter, getIP } from '@/lib/rate-limit';

const MagicLinkSchema = z.object({
  email: z.string().email(),
});

// Use the anon key for magic link — sending OTPs does not require elevated
// privileges. Using the service role here was unnecessary and meant a
// compromised route would have had full DB access.
function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(request: Request) {
  // IP-based limit — user is not authenticated yet
  const ip = getIP(request);
  const { success } = await authLimiter.limit(`magic_${ip}`);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const result = MagicLinkSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const { email } = result.data;

    const { error } = await getAnonClient().auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/callback`,
      },
    });

    if (error) {
      // Log server-side only — never expose to client
      console.error('Magic link error:', error.message);
    }

    // Always return success — prevents email enumeration
    return NextResponse.json({ success: true });
  } catch (err) {
    Sentry.captureException(err);
    console.error('MAGIC LINK ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}