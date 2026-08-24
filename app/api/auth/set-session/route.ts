// app/api/auth/set-session/route.ts
//
// Landing point for the magic-link flow. Supabase's email links come back with
// the tokens in the URL *fragment* (`#access_token=...`), which the server
// never receives — only client JavaScript can read it. So /auth/callback reads
// the fragment and hands the tokens here, once, over HTTPS, and from then on
// they live only in httpOnly cookies.
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

const SetSessionSchema = z.object({
  // JWTs, not free text — cap the length so this can't be used to stuff
  // arbitrary payloads into a Set-Cookie header.
  access_token: z.string().min(10).max(4096),
  refresh_token: z.string().min(10).max(4096),
});

export async function POST(request: Request) {
  // Without this, a hostile page could POST its OWN tokens here and silently
  // log the visitor into the attacker's account (session fixation).
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: 'Bad request' },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  const ip = getIP(request);
  const { success } = await authLimiter.limit(`setsession_${ip}`);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const parsed = SetSessionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'This sign-in link is invalid or has expired.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const cookieStore = await cookies();
    const { supabase, pending } = createBufferedServerClient(() => cookieStore.getAll());

    // setSession verifies the access token with Supabase before storing it,
    // so a made-up token is rejected here rather than becoming a cookie.
    const { data, error } = await supabase.auth.setSession(parsed.data);

    if (error || !data.session || !data.user) {
      console.error('set-session rejected:', error?.message ?? 'no session returned');
      return NextResponse.json(
        { error: 'This sign-in link is invalid or has expired.' },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const response = NextResponse.json(
      { user: { id: data.user.id, email: data.user.email ?? null } },
      { headers: NO_STORE_HEADERS }
    );
    applyCookies(response, pending);
    return response;
  } catch (err) {
    Sentry.captureException(err);
    console.error('SET SESSION ERROR:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
