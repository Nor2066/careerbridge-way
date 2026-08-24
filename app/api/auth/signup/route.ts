// app/api/auth/signup/route.ts
//
// Server-side sign-up, so that when a project has email confirmation turned
// off (Supabase returns a session immediately) that session lands in httpOnly
// cookies like every other login path.
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import {
  createBufferedServerClient,
  applyCookies,
  siteOrigin,
  NO_STORE_HEADERS,
} from '@/lib/auth-cookies';
import { authLimiter, getIP } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const SignUpSchema = z.object({
  email: z.string().email().max(320),
  // Supabase's own default minimum is 6; enforce it here too so the user gets
  // a clear message instead of a raw provider error.
  password: z.string().min(8, 'Password must be at least 8 characters').max(256),
});

export async function POST(request: Request) {
  const ip = getIP(request);
  const { success } = await authLimiter.limit(`signup_${ip}`);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many sign-up attempts. Please try again later.' },
      { status: 429, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const parsed = SignUpSchema.safeParse(await request.json());
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Invalid email or password';
      return NextResponse.json({ error: message }, { status: 400, headers: NO_STORE_HEADERS });
    }

    const cookieStore = await cookies();
    const { supabase, pending } = createBufferedServerClient(() => cookieStore.getAll());

    const { data, error } = await supabase.auth.signUp({
      ...parsed.data,
      options: { emailRedirectTo: `${siteOrigin(request)}/auth/callback` },
    });

    if (error) {
      console.error('Signup error:', error.message);
      // Don't echo the provider message back — "User already registered"
      // would turn this endpoint into an account-existence oracle.
      return NextResponse.json(
        { error: 'Could not create that account. Please try a different email.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const response = NextResponse.json(
      { needsConfirmation: !data.session },
      { headers: NO_STORE_HEADERS }
    );
    applyCookies(response, pending);
    return response;
  } catch (err) {
    Sentry.captureException(err);
    console.error('SIGNUP ERROR:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
