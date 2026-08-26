// app/api/auth/request-password-reset/route.ts
//
// "I forgot my password." There was no way to do this at all before, which
// meant a customer who forgot theirs was permanently locked out of an account
// they had paid for, with no self-serve route back.
//
// Always answers 200, whether or not the address has an account. Telling the
// caller "no such user" turns this endpoint into a way to test which email
// addresses are registered — the same reason /api/auth/signin returns one
// message for a wrong password and an unknown user, and the same reason
// /api/auth/magic-link already answers this way.

import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { isSameOrigin, siteOrigin, NO_STORE_HEADERS } from '@/lib/auth-cookies';
import { authLimiter, getIP } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const RequestSchema = z.object({
  email: z.string().email().max(320),
});

export async function POST(request: Request) {
  // Sends mail to an address the caller chooses, so it gets the same
  // cross-site guard as signup and magic-link.
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: 'Bad request' },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  const ip = getIP(request);
  const { success } = await authLimiter.limit(`pwreset_${ip}`);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a few minutes.' },
      { status: 429, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const parsed = RequestSchema.safeParse(await request.json());

    // Even a malformed address gets the same cheerful answer, so the shape of
    // the response never reveals anything either.
    if (parsed.success) {
      // Anon key: sending a recovery email needs no elevated privileges, and
      // using the service role here would mean a compromised route had full
      // database access. Same reasoning as /api/auth/magic-link.
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
        redirectTo: `${siteOrigin(request)}/auth/callback`,
      });

      if (error) {
        // Logged, never returned. A rate limit from Supabase or an unknown
        // address both land here and neither is the caller's business.
        console.error('Password reset request failed:', error.message);
      }
    }

    return NextResponse.json(
      {
        ok: true,
        message:
          'If there is an account for that address, a reset link is on its way. It expires in one hour.',
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    Sentry.captureException(err);
    console.error('PASSWORD RESET REQUEST ERROR:', err);
    // Still a 200-shaped answer: an internal fault must not become a signal
    // about whether the address exists.
    return NextResponse.json(
      {
        ok: true,
        message:
          'If there is an account for that address, a reset link is on its way. It expires in one hour.',
      },
      { headers: NO_STORE_HEADERS }
    );
  }
}
