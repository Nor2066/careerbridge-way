// app/api/auth/google/route.ts
// Manually implements the PKCE handshake using Supabase's REST API
// directly, rather than the SDK's signInWithOAuth(). This removes any
// dependency on exactly how the SDK's cookie adapter behaves when called
// server-side (which we couldn't fully verify was working), in favor of
// a fully explicit, debuggable implementation we control end to end.
import { NextResponse } from 'next/server';
import crypto from 'crypto';

function base64url(input: Buffer): string {
  return input.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const isProd = process.env.NODE_ENV === 'production';

  const codeVerifier = base64url(crypto.randomBytes(32));
  const codeChallenge = base64url(crypto.createHash('sha256').update(codeVerifier).digest());

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const redirectTo = `${requestUrl.origin}/api/auth/callback-exchange`;

  const authorizeUrl = new URL(`${supabaseUrl}/auth/v1/authorize`);
  authorizeUrl.searchParams.set('provider', 'google');
  authorizeUrl.searchParams.set('redirect_to', redirectTo);
  authorizeUrl.searchParams.set('code_challenge', codeChallenge);
  authorizeUrl.searchParams.set('code_challenge_method', 's256');

  const response = NextResponse.redirect(authorizeUrl.toString());
  response.cookies.set('oauth_code_verifier', codeVerifier, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10, // 10 minutes is plenty to complete the round trip
  });

  return response;
}