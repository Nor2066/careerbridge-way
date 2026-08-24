// app/api/auth/callback-exchange/route.ts
//
// Completes Google sign-in. The path is kept as-is on purpose — it's the URL
// registered in the Supabase dashboard's redirect allow-list, and Supabase
// refuses to redirect anywhere else.
//
// Every failure here reports a DISTINCT ?error= code. They all used to
// collapse into a single "oauth_failed", which meant a failed sign-in gave no
// clue whether the browser withheld the verifier cookie, Supabase rejected the
// code, or the provider itself errored — three unrelated problems with three
// unrelated fixes. The codes are coarse operational categories, not internal
// details; the specifics go to the server log.
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import {
  createBufferedServerClient,
  applyCookies,
  siteOrigin,
  safeReturnTo,
  AUTH_COOKIE_FLAGS,
  NO_STORE_HEADERS,
} from '@/lib/auth-cookies';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = siteOrigin(request);
  const code = requestUrl.searchParams.get('code');

  const cookieStore = await cookies();
  const returnTo = safeReturnTo(cookieStore.get('oauth_return_to')?.value);

  const fail = (errorCode: string, logReason: string, detail?: string) => {
    console.error(`[oauth] ${errorCode}: ${logReason}`, detail ?? '');
    return NextResponse.redirect(new URL(`/login?error=${errorCode}`, origin), {
      headers: NO_STORE_HEADERS,
    });
  };

  // Google/Supabase report user-facing failures (consent denied, provider
  // misconfiguration) as query params rather than a non-2xx status.
  const providerError =
    requestUrl.searchParams.get('error_description') ?? requestUrl.searchParams.get('error');
  if (providerError) return fail('oauth_provider', 'provider returned an error', providerError);

  if (!code) return fail('oauth_no_code', 'no authorization code in callback URL');

  // Did the PKCE verifier cookie survive the round trip through Google?
  // Checking this separately is the whole point: without it, a browser that
  // dropped the cookie and a Supabase that rejected the code look identical.
  const verifierCookie = cookieStore
    .getAll()
    .find((c) => c.name.endsWith('-code-verifier') && c.value);

  if (!verifierCookie) {
    return fail(
      'oauth_no_verifier',
      'the PKCE verifier cookie did not come back with the callback request',
      `cookies present: ${cookieStore.getAll().map((c) => c.name).join(', ') || '(none)'}`
    );
  }

  const { supabase, pending } = createBufferedServerClient(() => cookieStore.getAll());

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    // A single-use code that's already been spent lands here. If the earlier
    // attempt actually succeeded, the session cookie is already in the browser
    // — bouncing to /login would then log out someone who is legitimately
    // signed in, which looks exactly like the bug we're chasing.
    const existing = await getExistingUser(cookieStore.getAll());
    if (existing) {
      console.warn('[oauth] code exchange failed but a valid session already exists — continuing');
      return NextResponse.redirect(new URL(returnTo, origin), { headers: NO_STORE_HEADERS });
    }
    return fail('oauth_exchange', 'Supabase rejected the code exchange', error.message);
  }

  if (pending.length === 0) {
    return fail('oauth_no_session', 'exchange succeeded but produced no session cookies');
  }

  const response = NextResponse.redirect(new URL(returnTo, origin), {
    headers: NO_STORE_HEADERS,
  });

  applyCookies(response, pending);

  // Clean up our own short-lived cookies.
  response.cookies.set('oauth_return_to', '', { ...AUTH_COOKIE_FLAGS, maxAge: 0 });
  response.cookies.set('oauth_code_verifier', '', { ...AUTH_COOKIE_FLAGS, maxAge: 0 });

  return response;
}

/** Is there already a valid session on this request? */
async function getExistingUser(requestCookies: { name: string; value: string }[]) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: { getAll: () => requestCookies, setAll: () => {} },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}
