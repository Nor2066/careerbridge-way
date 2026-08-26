// app/api/admin/login/route.ts
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import {
  createBufferedServerClient,
  applyCookies,
  isSameOrigin,
  NO_STORE_HEADERS,
} from '@/lib/auth-cookies';
import { getUserRole, isAdmin } from '@/lib/roles';
import { adminLoginLimiter, getIP } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const LoginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(256),
});

export async function POST(request: Request) {
  // Login CSRF: without this, a hostile page can POST the attacker's own
  // credentials here and silently sign the visitor into the attacker's
  // account, where their activity is then visible to whoever owns it.
  // /api/auth/set-session already guards the same way.
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: 'Bad request' },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  // IP-based limit for login — must happen before any auth attempt
  const ip = getIP(request);
  const { success } = await adminLoginLimiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const parsed = LoginSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const cookieStore = await cookies();
    const { supabase, pending } = createBufferedServerClient(() => cookieStore.getAll());

    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error || !data.session || !data.user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    // Check the role before handing out a session for the admin area, so a
    // non-admin gets a plain rejection rather than a working session plus a
    // redirect they might be able to poke at.
    const role = await getUserRole(data.user.id);
    if (!isAdmin(role)) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    // The response body used to contain `session`, i.e. the access token AND
    // the long-lived refresh token, in readable JSON. Anything that could see
    // a network response — a browser extension, an injected script, a logging
    // proxy — could lift a full account takeover out of it. The session now
    // travels only as httpOnly cookies.
    const response = NextResponse.json(
      { user: { id: data.user.id, email: data.user.email ?? null }, role },
      { headers: NO_STORE_HEADERS }
    );
    applyCookies(response, pending);
    return response;
  } catch (err) {
    Sentry.captureException(err);
    console.error('ADMIN LOGIN ERROR:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
