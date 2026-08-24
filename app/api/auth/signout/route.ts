// app/api/auth/signout/route.ts
//
// Ends the session. POST-only on purpose: a GET sign-out can be triggered by
// any cross-site <img src="/api/auth/signout">, which is a nuisance CSRF.
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  createBufferedServerClient,
  applyCookies,
  isSameOrigin,
  AUTH_COOKIE_FLAGS,
  NO_STORE_HEADERS,
} from '@/lib/auth-cookies';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Bad request' }, { status: 403, headers: NO_STORE_HEADERS });
  }

  const cookieStore = await cookies();
  const { supabase, pending } = createBufferedServerClient(() => cookieStore.getAll());

  // Revokes the refresh token server-side, so a stolen copy is useless
  // afterwards rather than staying valid until it expires.
  await supabase.auth.signOut();

  const response = NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS });
  applyCookies(response, pending);

  // Belt and braces: clear any session cookie the SDK didn't account for,
  // including chunked ones (`sb-<ref>-auth-token.0`, `.1`, …) and leftovers
  // from the pre-httpOnly implementation.
  for (const { name } of cookieStore.getAll()) {
    if (name.startsWith('sb-') || name.startsWith('oauth_')) {
      response.cookies.set(name, '', { ...AUTH_COOKIE_FLAGS, maxAge: 0 });
    }
  }

  return response;
}
