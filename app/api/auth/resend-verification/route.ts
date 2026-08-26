// app/api/auth/resend-verification/route.ts
//
// The other half of enforcing email verification. Blocking someone from paying
// until they confirm their address is only reasonable if there is a way to get
// the email again — the original one expires, lands in spam, or was sent to an
// address they mistyped and have since fixed.
//
// Takes no email in the body: it resends to whatever address is on the signed-in
// account. Accepting an address from the caller would turn an authenticated
// endpoint into an open mail relay.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as Sentry from '@sentry/nextjs';
import { requireAuth, isEmailVerified } from '@/lib/auth';
import { isUnauthorized, unauthorizedResponse } from '@/lib/api-errors';
import {
  createBufferedServerClient,
  isSameOrigin,
  siteOrigin,
  NO_STORE_HEADERS,
} from '@/lib/auth-cookies';
import { authLimiter, getUserIdentifier } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: 'Bad request' },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  let user;
  try {
    user = await requireAuth(request);
  } catch (err) {
    if (isUnauthorized(err)) return unauthorizedResponse();
    throw err;
  }

  // Keyed by user rather than address: the account is what is being emailed,
  // and it is the thing an abuser would have to keep creating.
  const { success } = await authLimiter.limit(`resend_${getUserIdentifier(user.id)}`);
  if (!success) {
    return NextResponse.json(
      { error: 'We have sent several already. Please wait a few minutes before asking again.' },
      { status: 429, headers: NO_STORE_HEADERS }
    );
  }

  try {
    if (isEmailVerified(user)) {
      // Not an error — someone clicking twice, or a stale tab. Say so plainly
      // rather than sending a pointless second email.
      return NextResponse.json(
        { ok: true, alreadyVerified: true, message: 'Your email address is already confirmed.' },
        { headers: NO_STORE_HEADERS }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        { error: 'This account has no email address to confirm.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const cookieStore = await cookies();
    const { supabase } = createBufferedServerClient(() => cookieStore.getAll());

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
      options: { emailRedirectTo: `${siteOrigin(request)}/auth/callback` },
    });

    if (error) {
      // Usually Supabase's own send-rate limit. Logged, not echoed.
      console.error('Resend verification failed:', error.message);
    }

    return NextResponse.json(
      {
        ok: true,
        message: 'Confirmation email sent. It can take a minute — check your spam folder too.',
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    if (isUnauthorized(err)) return unauthorizedResponse();
    Sentry.captureException(err);
    console.error('RESEND VERIFICATION ERROR:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
