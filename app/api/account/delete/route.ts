// app/api/account/delete/route.ts
//
// The delete-account button the launch checklist asks for and the privacy
// policy promises. A deletion clause with nothing behind it is worse than no
// clause, because it is a statement that is not true.
//
// What is removed, and in what order, is in lib/account-deletion.ts.
//
// Confirmation is required in the body: the client makes the person type their
// own email address. That is a deliberate speed bump on an irreversible
// action, not security theatre — combined with the same-origin check it means
// a stray click, a prefetch, or a hostile page cannot trigger this.

import { NextResponse } from 'next/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { requireAuth } from '@/lib/auth';
import { isUnauthorized, unauthorizedResponse } from '@/lib/api-errors';
import { deleteAccountData } from '@/lib/account-deletion';
import {
  isSameOrigin,
  AUTH_COOKIE_FLAGS,
  NO_STORE_HEADERS,
} from '@/lib/auth-cookies';
import { cookies } from 'next/headers';
import { authIpLimiter, getIP } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const DeleteSchema = z.object({
  confirmEmail: z.string().email().max(320),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: 'Bad request' },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  // Irreversible, so it gets the strict auth limiter rather than a read one.
  const { success } = await authIpLimiter.limit(`delete_${getIP(request)}`);
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
    const parsed = DeleteSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please type your email address to confirm.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    // Compare case-insensitively — people capitalise inconsistently, and this
    // is a confirmation step, not an authentication one.
    const typed = parsed.data.confirmEmail.trim().toLowerCase();
    const actual = (user.email ?? '').trim().toLowerCase();
    if (!actual || typed !== actual) {
      return NextResponse.json(
        { error: 'That email address does not match the one on this account.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    // The deletion itself lives in lib/account-deletion.ts, shared with the
    // nightly job for unused accounts so both remove exactly the same things.
    const result = await deleteAccountData(user.id);
    if (!result.ok) {
      const message =
        result.stage === 'content'
          ? 'We could not finish deleting your account. Nothing has been half-removed that you need to worry about — please contact support and we will complete it by hand.'
          : result.stage === 'payments'
          ? 'We could not finish deleting your account because of a problem with your purchase records. Nothing has been lost. Please contact support and we will complete it by hand.'
          : 'Your data has been removed, but we could not close the sign-in record itself. Please contact support so we can finish it.';
      return NextResponse.json({ error: message }, { status: 500, headers: NO_STORE_HEADERS });
    }

    // Clear the session so the browser is not left holding a token for an
    // account that no longer exists.
    const response = NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS });
    const cookieStore = await cookies();
    for (const { name } of cookieStore.getAll()) {
      if (name.startsWith('sb-') || name.startsWith('oauth_')) {
        response.cookies.set(name, '', { ...AUTH_COOKIE_FLAGS, maxAge: 0 });
      }
    }
    return response;
  } catch (err) {
    if (isUnauthorized(err)) return unauthorizedResponse();
    Sentry.captureException(err);
    console.error('DELETE ACCOUNT ERROR:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
