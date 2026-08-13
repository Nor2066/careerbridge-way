// app/api/auth/sync-session/route.ts
// Called by the auth callback page immediately after it establishes a
// session client-side (which necessarily writes a non-httpOnly cookie,
// since httpOnly can only ever be set by a server response). This
// endpoint re-writes the same session as proper httpOnly cookies,
// closing that exposure window down to a fraction of a second.
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { access_token, refresh_token } = await request.json();

    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: 'Missing tokens' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const response = NextResponse.json({ success: true });
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

    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return response;
  } catch (err) {
    console.error('SYNC SESSION ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}