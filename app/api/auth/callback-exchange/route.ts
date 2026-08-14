// app/api/auth/callback-exchange/route.ts
// Manually exchanges the OAuth code for tokens via Supabase's REST API
// directly, using our own explicitly-stored verifier cookie — bypassing
// exchangeCodeForSession()'s internal (unverifiable) storage lookup.
// Once we have raw tokens, setSession() takes over for the final cookie
// write, since that step needs no verifier at all — just valid tokens.
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === 'production';

  const codeVerifier = cookieStore.get('oauth_code_verifier')?.value;

  if (!code || !codeVerifier) {
    console.error('OAuth callback missing code or verifier', {
      hasCode: !!code,
      hasVerifier: !!codeVerifier,
    });
    return NextResponse.redirect(new URL('/login?error=oauth_failed', requestUrl.origin));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const tokenRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=pkce`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
    },
    body: JSON.stringify({ auth_code: code, code_verifier: codeVerifier }),
  });

  if (!tokenRes.ok) {
    const errBody = await tokenRes.text().catch(() => '');
    console.error('OAuth token exchange failed:', tokenRes.status, errBody);
    return NextResponse.redirect(new URL('/login?error=oauth_failed', requestUrl.origin));
  }

  const tokenData = await tokenRes.json();
  const { access_token, refresh_token } = tokenData;

  if (!access_token || !refresh_token) {
    console.error('OAuth token exchange returned no tokens:', tokenData);
    return NextResponse.redirect(new URL('/login?error=oauth_failed', requestUrl.origin));
  }

  const response = NextResponse.redirect(new URL('/', requestUrl.origin));

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, {
            ...options,
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
          });
        });
      },
    },
  });

  const { error: setSessionError } = await supabase.auth.setSession({ access_token, refresh_token });
  if (setSessionError) {
    console.error('setSession failed after manual token exchange:', setSessionError.message);
    return NextResponse.redirect(new URL('/login?error=oauth_failed', requestUrl.origin));
  }

  // Clean up the verifier cookie now that we're done with it
  response.cookies.set('oauth_code_verifier', '', { maxAge: 0, path: '/' });

  return response;
}