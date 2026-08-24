// app/api/auth/google/route.ts
//
// Starts Google sign-in. Server-side, so the PKCE verifier is written as a
// real httpOnly Set-Cookie header that is committed before the browser leaves
// for Google.
//
// This used to hand-roll the PKCE handshake: generate a verifier, hash it,
// store it in a bespoke `oauth_code_verifier` cookie, and build the authorize
// URL by hand. That worked but had to be kept in sync with the callback by
// hand, and it stored the verifier under a name Supabase's own SDK doesn't
// know about. We now let the SDK own the handshake: signInWithOAuth writes the
// verifier under the name exchangeCodeForSession() will look for, so the two
// halves cannot drift apart.
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

// Never let this be prerendered or cached: each call must mint a fresh
// verifier and a fresh Set-Cookie header. A cached copy would hand every
// visitor the same verifier, or (worse, behind a CDN that strips Set-Cookie)
// no verifier at all.
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = siteOrigin(request);
  const returnTo = safeReturnTo(requestUrl.searchParams.get('returnTo'));

  const cookieStore = await cookies();
  const { supabase, pending } = createBufferedServerClient(() => cookieStore.getAll());

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/api/auth/callback-exchange`,
      // We issue the redirect ourselves so we can attach cookies to it.
      skipBrowserRedirect: true,
    },
  });

  if (error || !data?.url) {
    console.error('Google OAuth init failed:', error?.message ?? 'no authorize URL returned');
    return NextResponse.redirect(new URL('/login?error=oauth_init_failed', origin), {
      headers: NO_STORE_HEADERS,
    });
  }

  const response = NextResponse.redirect(data.url, { headers: NO_STORE_HEADERS });

  // Flushes the `sb-<ref>-auth-token-code-verifier` cookie the SDK just asked
  // us to store. Without this the callback has nothing to exchange with.
  applyCookies(response, pending);

  // Remember where to land afterwards. Separate short-lived cookie rather than
  // a query param on the callback, because Supabase only redirects back to the
  // exact URL registered in its allow-list.
  response.cookies.set('oauth_return_to', returnTo, {
    ...AUTH_COOKIE_FLAGS,
    maxAge: 60 * 10,
  });

  // Clear the cookie the old hand-rolled implementation used, so browsers
  // that still carry one don't keep a stale verifier around for 10 minutes.
  response.cookies.set('oauth_code_verifier', '', { ...AUTH_COOKIE_FLAGS, maxAge: 0 });

  return response;
}
