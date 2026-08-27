// app/api/auth/update-password/route.ts
//
// Serves two flows that end in the same place:
//
//   1. CHANGE  — signed in, knows the old password, wants a new one.
//   2. RESET   — arrived from a recovery email, cannot supply the old one
//                because forgetting it is the entire reason they are here.
//
// Telling those apart matters. If a missing currentPassword were simply
// accepted, anyone who got hold of a session cookie could change the password
// and lock the real owner out — turning a stolen session into permanent
// account takeover. So the reset path needs its own proof.
//
// That proof is a short-lived httpOnly marker cookie, set by
// /api/auth/set-session only when the tokens came from a recovery link.
// Because it is httpOnly it cannot be forged from JavaScript, and because it
// expires in fifteen minutes a recovery session left open on a shared computer
// does not stay a password-change ticket forever.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { isUnauthorized, unauthorizedResponse } from '@/lib/api-errors';
import {
  createBufferedServerClient,
  applyCookies,
  isSameOrigin,
  AUTH_COOKIE_FLAGS,
  NO_STORE_HEADERS,
} from '@/lib/auth-cookies';
import { RECOVERY_COOKIE } from '@/lib/recovery-cookie';
import { assessPassword, MAX_PASSWORD_LENGTH } from '@/lib/password';
import { authLimiter, getIP } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const UpdateSchema = z.object({
  currentPassword: z.string().min(1).max(MAX_PASSWORD_LENGTH).optional(),
  newPassword: z.string().min(1).max(MAX_PASSWORD_LENGTH),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: 'Bad request' },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  const ip = getIP(request);
  const { success } = await authLimiter.limit(`pwupdate_${ip}`);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again in a few minutes.' },
      { status: 429, headers: NO_STORE_HEADERS }
    );
  }

  let user;
  try {
    user = await requireAuth(request);
  } catch (err) {
    if (isUnauthorized(err)) return unauthorizedResponse();
    throw err;
  }

  try {
    const parsed = UpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please enter a new password.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const { currentPassword, newPassword } = parsed.data;
    const cookieStore = await cookies();
    const inRecovery = cookieStore.get(RECOVERY_COOKIE)?.value === '1';

    const { supabase, pending } = createBufferedServerClient(() => cookieStore.getAll());

    // ── Authorise the change ────────────────────────────────────────────
    if (currentPassword) {
      // signInWithPassword is the only way to verify a password against
      // Supabase. It succeeds or it does not; we ignore the session it hands
      // back, since the caller already has one.
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email ?? '',
        password: currentPassword,
      });

      if (verifyError) {
        return NextResponse.json(
          { error: 'That is not your current password.' },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
    } else if (!inRecovery) {
      return NextResponse.json(
        { error: 'Please enter your current password.', code: 'CURRENT_PASSWORD_REQUIRED' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    // ── Check the new password ──────────────────────────────────────────
    if (currentPassword && currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'Your new password must be different from your current one.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const verdict = await assessPassword(newPassword, user.email);
    if (!verdict.ok) {
      return NextResponse.json(
        { error: verdict.reason },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      console.error('Password update rejected:', updateError.message);
      return NextResponse.json(
        { error: 'We could not update your password. Please try again.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    // Anyone else holding a session for this account loses it. This is the
    // point of changing a password after a suspected compromise — without it
    // the attacker's session stays valid until it expires on its own.
    try {
      await supabase.auth.signOut({ scope: 'others' });
    } catch (err) {
      // Not fatal: the password is already changed, which is the main thing.
      console.error('Could not revoke other sessions after password change:', err);
    }

    const response = NextResponse.json(
      { ok: true, message: 'Your password has been updated.' },
      { headers: NO_STORE_HEADERS }
    );

    applyCookies(response, pending);

    // The recovery ticket is single use.
    response.cookies.set(RECOVERY_COOKIE, '', { ...AUTH_COOKIE_FLAGS, maxAge: 0 });

    return response;
  } catch (err) {
    if (isUnauthorized(err)) return unauthorizedResponse();
    Sentry.captureException(err);
    console.error('UPDATE PASSWORD ERROR:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
