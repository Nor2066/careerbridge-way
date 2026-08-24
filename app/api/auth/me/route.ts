// app/api/auth/me/route.ts
//
// Tells the browser who it is. Now that the session cookies are httpOnly,
// client-side code can't read the token to work this out for itself — which
// is the whole point: the token stays out of reach of any injected script.
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { NO_STORE_HEADERS } from '@/lib/auth-cookies';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        // Read-only: refreshing the session is the proxy's job, not ours.
        setAll: () => {},
      },
    }
  );

  // getUser() validates the token against Supabase rather than trusting the
  // cookie's contents, so a forged cookie can't fake a login here.
  const { data: { user } } = await supabase.auth.getUser();

  return NextResponse.json(
    {
      user: user ? { id: user.id, email: user.email ?? null } : null,
    },
    { headers: NO_STORE_HEADERS }
  );
}
