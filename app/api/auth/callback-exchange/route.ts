// app/api/auth/callback-exchange/route.ts
// Completes Google OAuth entirely server-side. Google/Supabase redirects
// here directly (not through the client page) with ?code=..., and since
// the PKCE verifier was set as an httpOnly cookie by /api/auth/google,
// only server code can read it back — which is exactly what happens here.
// The resulting session is written as httpOnly cookies on this same
// redirect response, so the whole OAuth round-trip never exposes a
// readable-by-JS session cookie at any point.
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', requestUrl.origin));
  }

  const cookieStore = await cookies();
  const response = NextResponse.redirect(new URL('/', requestUrl.origin));
  const isProd = process.env.NODE_ENV === 'production';

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('OAuth code exchange failed:', error.message);
    return NextResponse.redirect(new URL('/login?error=oauth_failed', requestUrl.origin));
  }

  return response;
}