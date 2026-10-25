// app/api/auth/verify-link/route.ts
//
// Redeems the token from an email link: sign-up confirmation, the login link
// and password reset (lib/auth-email-templates.ts). /auth/callback calls this
// only when the student presses its button, never on page load.
//
// That button is the point. University mail often goes through scanners such
// as Microsoft Safe Links, which open every link as soon as the email
// arrives. A link that signs in on first open would be used up by the
// scanner, and the student would find "link expired". A scanner loads the
// page; it does not press the button.
//
// Links sent before these templates bring the session in the URL fragment
// instead and still go through /api/auth/set-session.

import * as Sentry from '@sentry/nextjs';
import { NextResponse, after } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import {
  createBufferedServerClient,
  applyCookies,
  isSameOrigin,
  AUTH_COOKIE_FLAGS,
  NO_STORE_HEADERS,
} from '@/lib/auth-cookies';
import { RECOVERY_COOKIE, RECOVERY_COOKIE_MAX_AGE } from '@/lib/recovery-cookie';
import { authIpLimiter, getIP } from '@/lib/rate-limit';
import { getLocale } from '@/lib/i18n/server';
import { rememberEmailLocale } from '@/lib/email-locale';

export const dynamic = 'force-dynamic';

const VerifySchema = z.object({
  token_hash: z.string().min(10).max(512),
  type: z.enum(['signup', 'magiclink', 'recovery']),
});

export async function POST(request: Request) {
  // A hostile page must not be able to sign the visitor into an account of
  // its choosing with a token it holds (session fixation).
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Bad request' }, { status: 403, headers: NO_STORE_HEADERS });
  }

  const { success } = await authIpLimiter.limit(`verifylink_${getIP(request)}`);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const parsed = VerifySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'This link is invalid or has expired.', code: 'LINK_INVALID' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    const { token_hash, type } = parsed.data;

    const cookieStore = await cookies();
    const { supabase, pending } = createBufferedServerClient(() => cookieStore.getAll());
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });

    if (error || !data.session) {
      console.error('verify-link rejected:', error?.message ?? 'no session returned');
      return NextResponse.json(
        { error: 'This link is invalid or has expired.', code: 'LINK_INVALID' },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const response = NextResponse.json(
      // Someone resetting a password is here to choose a new one.
      { next: type === 'recovery' ? '/reset-password' : '/' },
      { headers: NO_STORE_HEADERS }
    );
    applyCookies(response, pending);

    // Lets /api/auth/update-password accept a new password without the old
    // one. Decided by the token Supabase just verified, not by anything the
    // browser sent.
    if (type === 'recovery') {
      response.cookies.set(RECOVERY_COOKIE, '1', { ...AUTH_COOKIE_FLAGS, maxAge: RECOVERY_COOKIE_MAX_AGE });
    }

    const session = data.session;
    const locale = await getLocale();
    after(() => rememberEmailLocale(session, locale));
    return response;
  } catch (err) {
    Sentry.captureException(err);
    console.error('VERIFY LINK ERROR:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
