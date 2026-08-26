// app/api/auth/signin/route.ts
//
// Email + password sign-in, performed server-side so the resulting session
// lands in httpOnly cookies. Doing this in the browser (the old
// supabase.auth.signInWithPassword() call in AuthContext) necessarily wrote a
// JavaScript-readable cookie, which both defeated the httpOnly policy and
// fought with the cookies the OAuth callback writes.
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import {
  createBufferedServerClient,
  applyCookies,
  isSameOrigin,
  NO_STORE_HEADERS,
} from '@/lib/auth-cookies';
import { authLimiter, getIP } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const SignInSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(256),
});

export async function POST(request: Request) {
  // Login CSRF: without this, a hostile page can POST the attacker's own
  // credentials here and silently sign the visitor into the attacker's
  // account, where their activity is then visible to whoever owns it.
  // /api/auth/set-session already guards the same way.
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: 'Bad request' },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  const ip = getIP(request);
  const { success } = await authLimiter.limit(`signin_${ip}`);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many sign-in attempts. Please try again later.' },
      { status: 429, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const parsed = SignInSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const cookieStore = await cookies();
    const { supabase, pending } = createBufferedServerClient(() => cookieStore.getAll());

    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error || !data.session) {
      // Deliberately identical for "no such user" and "wrong password" so the
      // endpoint can't be used to discover which addresses have accounts.
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    // Note: the session itself is NOT in the body — only the cookies.
    const response = NextResponse.json(
      { user: { id: data.user.id, email: data.user.email ?? null } },
      { headers: NO_STORE_HEADERS }
    );
    applyCookies(response, pending);
    return response;
  } catch (err) {
    Sentry.captureException(err);
    console.error('SIGNIN ERROR:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
