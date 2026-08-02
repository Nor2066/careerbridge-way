// app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();
    // Build the redirect response first so we can attach the session
    // cookies directly onto it — cookies set via NextResponse.redirect
    // are the ones that actually reach the browser on this response.
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

    // Using the server client here (not the browser client) is essential —
    // it's the only way the resulting session can actually be written to
    // the response's cookies so the rest of the app can see it.
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('OAuth code exchange failed:', error.message);
      return NextResponse.redirect(new URL('/login?error=oauth_failed', requestUrl.origin));
    }

    return response;
  }

  // No code present — something went wrong upstream, send back to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}