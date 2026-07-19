import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/api') ||
    pathname.includes('favicon.ico')
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const isProd = process.env.NODE_ENV === 'production';

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
              ...options,
              httpOnly: true,
              secure: isProd,
              // 'lax' (not 'strict') — strict blocks the cookie on legitimate
              // top-level redirects back from external sites like Stripe
              // checkout, which was causing users to be bounced to /login
              // right after a successful payment. 'lax' still blocks
              // cross-site POST/PUT/DELETE (the actual CSRF risk) while
              // allowing normal top-level GET redirects.
              sameSite: 'lax',
              path: '/',
            });
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (pathname.startsWith('/admin') || pathname === '/admin') {
    if (!user) return NextResponse.redirect(new URL('/admin/login', request.url));

    const isAdmin = user.app_metadata?.role === 'admin';
    if (!isAdmin) return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

// Match both /admin exactly and all /admin/* sub-paths
export const matcher = ['/admin', '/admin/:path*'];