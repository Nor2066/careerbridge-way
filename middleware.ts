import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the admin login page, all API routes, and static files through
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
        // Fix for #47 — explicitly set HttpOnly, Secure, and SameSite on every cookie
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
              ...options,
              httpOnly: true,          // JS cannot read this cookie — prevents token theft via XSS
              secure: isProd,          // Only sent over HTTPS in production
              sameSite: 'lax',         // Blocks cross-site request forgery
              path: '/',
            });
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (pathname.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/admin/login', request.url));

    // Check admin role from app_metadata (server-only, users cannot modify this themselves)
    const isAdmin = user.app_metadata?.role === 'admin';
    if (!isAdmin) return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};