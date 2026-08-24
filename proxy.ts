import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { AUTH_COOKIE_FLAGS } from '@/lib/auth-cookies';
import { getUserRole, isAdmin } from '@/lib/roles';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin/login must stay reachable while signed out, or the redirect below
  // would bounce forever.
  if (pathname.startsWith('/admin/login')) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          // Two steps, and both matter. Writing only to the response means a
          // token refreshed here isn't visible to the page that renders in
          // this same request, so the page renders logged-out and the user
          // sees a redirect to /login for no reason. Writing only to the
          // request means the browser never receives the refreshed cookie.
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
              ...options,
              ...AUTH_COOKIE_FLAGS,
              ...(options?.maxAge !== undefined ? { maxAge: options.maxAge } : {}),
            });
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Role comes from the profiles table, matching lib/roles.ts and the
  // /api/admin/* routes. This used to read user.app_metadata.role and accept
  // only the exact string 'admin', which disagreed with the rest of the app in
  // both directions: a 'superadmin' was locked out of the dashboard even
  // though every admin API route accepted them, and the two sources of truth
  // could drift apart silently.
  const role = await getUserRole(user.id);
  if (!isAdmin(role)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

// Next.js reads the matcher from a `config` export — see
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.
//
// This was previously `export const matcher = [...]`, which Next.js ignores
// entirely. With no matcher, the proxy ran on EVERY page request instead of
// just /admin. That meant a Supabase client called getUser() on every
// navigation and prefetch, and each of those could rewrite — or, when the
// token looked invalid, delete — the session cookies that the sign-in routes
// had just written. Restoring the matcher confines this to /admin.
export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
