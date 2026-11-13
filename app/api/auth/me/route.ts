// app/api/auth/me/route.ts
//
// Tells the browser who it is. Now that the session cookies are httpOnly,
// client-side code can't read the token to work this out for itself — which
// is the whole point: the token stays out of reach of any injected script.
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { AUTH_COOKIE_FLAGS, NO_STORE_HEADERS } from '@/lib/auth-cookies';
import { isEmailVerified } from '@/lib/auth';
import { sessionReadLimiter, getIP } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * Is this error Supabase telling us the session is permanently dead, rather
 * than a transient network blip? Only the former justifies clearing cookies —
 * signing someone out because Supabase was briefly unreachable would be worse
 * than the log noise.
 */
function isDeadSession(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { __isAuthError?: boolean; status?: number; code?: string };
  if (!e.__isAuthError) return false;
  if (e.code === 'refresh_token_not_found' || e.code === 'session_not_found') return true;
  return e.status === 400 || e.status === 401 || e.status === 403;
}

export async function GET(request: Request) {
  // A ceiling, not a policy: this runs on essentially every page load, so the
  // limit sits far above normal browsing and exists only so an unauthenticated
  // flood cannot turn each request into a Supabase round trip.
  const { success } = await sessionReadLimiter.limit(getIP(request));
  if (!success) {
    return NextResponse.json({ user: null }, { status: 429, headers: NO_STORE_HEADERS });
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        // Read-only: refreshing the session is the proxy's job, not ours.
        setAll: () => {},
      },
    }
  );

  // getUser() validates the token against Supabase rather than trusting the
  // cookie's contents, so a forged cookie can't fake a login here.
  const { data: { user }, error } = await supabase.auth.getUser();

  const response = NextResponse.json(
    {
      user: user
        ? {
            id: user.id,
            email: user.email ?? null,
            // Drives the banner and the paywall messaging. Routes still check
            // this server-side; sending it here only saves the UI from
            // discovering it via a 403.
            emailVerified: isEmailVerified(user),
          }
        : null,
    },
    { headers: NO_STORE_HEADERS }
  );

  // Evict cookies for a session that no longer exists. Without this the
  // browser keeps resending a dead token on every request forever — which is
  // what filled the logs with "Invalid Refresh Token: Refresh Token Not
  // Found" and left stale `sb-*-auth-token.0/.1` chunks lying around from an
  // earlier deployment, confusing later sign-in attempts.
  if (!user && isDeadSession(error)) {
    for (const { name } of cookieStore.getAll()) {
      if (name.startsWith('sb-') && !name.endsWith('-code-verifier')) {
        response.cookies.set(name, '', { ...AUTH_COOKIE_FLAGS, maxAge: 0 });
      }
    }
  }

  return response;
}
