// app/api/auth/google/route.ts
// Initiates Google OAuth from the server instead of the browser. This lets
// the PKCE code verifier be written as a real httpOnly cookie via an HTTP
// Set-Cookie header, committed atomically BEFORE the browser navigates to
// Google — eliminating the race where a client-side document.cookie write
// could lose to browser privacy features (e.g. Chrome's bounce-tracking
// mitigation) during the redirect.
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === 'production';

  let capturedCookies: { name: string; value: string; options: any }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          capturedCookies = cookiesToSet;
        },
      },
    }
  );

  // skipBrowserRedirect: true — we're server-side, there's no window to
  // redirect. This just gets us Google's auth URL back as a string, while
  // the verifier is still generated and captured via setAll above.
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${requestUrl.origin}/api/auth/callback-exchange`,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    console.error('Google sign-in initiation failed:', error?.message);
    return NextResponse.redirect(new URL('/login?error=oauth_init_failed', requestUrl.origin));
  }

  const response = NextResponse.redirect(data.url);
  capturedCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, {
      ...options,
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
    });
  });

  return response;
}