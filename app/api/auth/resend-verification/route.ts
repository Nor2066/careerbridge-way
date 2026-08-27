// app/api/auth/resend-verification/route.ts
//
// The other half of enforcing email verification. Blocking someone until they
// confirm their address is only reasonable if there is a way to get the email
// again — the first one expires, lands in spam, or arrives at an address they
// mistyped.
//
// Works in BOTH states, and that is the whole point of the file:
//
//   SIGNED IN  — resends to the address on the session. Ignores any address in
//                the body, because accepting one would turn an authenticated
//                endpoint into an open mail relay.
//
//   SIGNED OUT — takes an address from the body. This case exists because
//                turning on "Confirm email" creates a trap: Supabase refuses
//                to sign in an unconfirmed user, so somebody whose first email
//                never arrived can neither sign in NOR reach their account
//                page to ask for another. They would be permanently stuck
//                with no way out but support.
//
// The signed-out path always answers 200 whether or not the address exists,
// matching /api/auth/signin and /api/auth/magic-link, so it cannot be used to
// discover which addresses are registered.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { requireAuth, isEmailVerified } from '@/lib/auth';
import { isUnauthorized } from '@/lib/api-errors';
import {
  createBufferedServerClient,
  isSameOrigin,
  siteOrigin,
  NO_STORE_HEADERS,
} from '@/lib/auth-cookies';
import { authLimiter, getIP, getUserIdentifier } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  email: z.string().email().max(320).optional(),
});

/** Identical wording for every signed-out outcome, so none of them is a signal. */
const GENERIC_SENT = {
  ok: true,
  message:
    'If that address needs confirming, a new link is on its way. It can take a minute — check your spam folder too.',
};

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: 'Bad request' },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  const body = await request.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);

  // ── Signed in? ──────────────────────────────────────────────────────
  let user = null;
  try {
    user = await requireAuth(request);
  } catch (err) {
    if (!isUnauthorized(err)) throw err;
  }

  const redirectTo = `${siteOrigin(request)}/auth/callback`;

  try {
    if (user) {
      const { success } = await authLimiter.limit(`resend_${getUserIdentifier(user.id)}`);
      if (!success) {
        return NextResponse.json(
          { error: 'We have sent several already. Please wait a few minutes before asking again.' },
          { status: 429, headers: NO_STORE_HEADERS }
        );
      }

      if (isEmailVerified(user)) {
        // Not an error — a double click, or a stale tab. Say so plainly rather
        // than sending a pointless second email.
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
        options: { emailRedirectTo: redirectTo },
      });

      if (error) console.error('Resend verification failed:', error.message);

      return NextResponse.json(
        {
          ok: true,
          message: 'Confirmation email sent. It can take a minute — check your spam folder too.',
        },
        { headers: NO_STORE_HEADERS }
      );
    }

    // ── Signed out ──────────────────────────────────────────────────────
    const ip = getIP(request);
    const { success } = await authLimiter.limit(`resend_ip_${ip}`);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a few minutes.' },
        { status: 429, headers: NO_STORE_HEADERS }
      );
    }

    // Even a missing or malformed address gets the same answer.
    if (parsed.success && parsed.data.email) {
      // Anon key: resending a confirmation needs no elevated privileges, and
      // the service role here would mean a compromised route had full database
      // access. Same reasoning as /api/auth/magic-link.
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: parsed.data.email,
        options: { emailRedirectTo: redirectTo },
      });

      // Logged, never returned. "Already confirmed" and "no such user" both
      // land here, and neither is the caller's business.
      if (error) console.error('Resend (signed out) failed:', error.message);
    }

    return NextResponse.json(GENERIC_SENT, { headers: NO_STORE_HEADERS });
  } catch (err) {
    Sentry.captureException(err);
    console.error('RESEND VERIFICATION ERROR:', err);
    // Still the generic shape: an internal fault must not become a signal
    // about whether the address exists.
    return NextResponse.json(GENERIC_SENT, { headers: NO_STORE_HEADERS });
  }
}
