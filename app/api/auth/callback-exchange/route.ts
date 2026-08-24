// app/api/auth/callback-exchange/route.ts
//
// Completes Google sign-in. The path is kept as-is on purpose — it's the URL
// registered in the Supabase dashboard's redirect allow-list, and Supabase
// refuses to redirect anywhere else.
//
// Previously this route re-implemented the token exchange against Supabase's
// REST API and then called setSession() to persist it. That did two network
// round trips (exchange, then a /user lookup inside setSession) and, if the
// second one hiccuped, it bailed out to /login with the single-use OAuth code
// already spent — so the retry always needed a fresh trip through Google.
// exchangeCodeForSession() does the whole thing in one call and reads the
// verifier cookie the SDK itself wrote in /api/auth/google.
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
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

  const fail = (reason: string, detail?: string) => {
    // Log the real reason server-side; show the user something generic.
    console.error(`OAuth callback failed (${reason})`, detail ?? '');
    return NextResponse.redirect(new URL(`/login?error=oauth_failed`, origin), {
      headers: NO_STORE_HEADERS,
    });
  };

  // Google/Supabase report user-facing failures (consent denied, provider
  // misconfiguration) as query params rather than a non-2xx status.
  const providerError =
    requestUrl.searchParams.get('error_description') ?? requestUrl.searchParams.get('error');
  if (providerError) return fail('provider returned an error', providerError);

  if (!code) return fail('no authorization code in callback URL');

  const cookieStore = await cookies();
  const returnTo = safeReturnTo(cookieStore.get('oauth_return_to')?.value);

  const { supabase, pending } = createBufferedServerClient(() => cookieStore.getAll());

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return fail('code exchange rejected', error.message);

  if (pending.length === 0) {
    // Exchange succeeded but nothing asked to be persisted — returning here
    // would send the user to a page with no session, which is exactly the
    // silent failure this route used to produce. Surface it instead.
    return fail('exchange succeeded but no session cookies were produced');
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
