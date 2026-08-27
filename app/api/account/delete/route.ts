// app/api/account/delete/route.ts
//
// The delete-account button the launch checklist asks for and the privacy
// policy promises. A deletion clause with nothing behind it is worse than no
// clause, because it is a statement that is not true.
//
// Order matters and is deliberate:
//
//   1. Child tables first. Each is idempotent, so a partial failure can simply
//      be retried by pressing the button again.
//   2. Payments are detached, not deleted — UK tax law requires six years of
//      sales records. We drop the link to the person and keep the transaction.
//   3. The auth user last. Once it is gone the customer cannot sign in to
//      retry, so nothing that might fail should come after it.
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
import { supabaseServer } from '@/lib/supabase-server';
import { USER_DATA_TABLES, PAYMENTS_TABLE, AUDIT_TABLE } from '@/lib/account-data';
import {
  isSameOrigin,
  AUTH_COOKIE_FLAGS,
  NO_STORE_HEADERS,
} from '@/lib/auth-cookies';
import { cookies } from 'next/headers';
import { authLimiter, getIP } from '@/lib/rate-limit';

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
  const { success } = await authLimiter.limit(`delete_${getIP(request)}`);
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

    // ── 1. Content tables ───────────────────────────────────────────────
    for (const { table, userColumn } of USER_DATA_TABLES) {
      const { error } = await supabaseServer.from(table).delete().eq(userColumn, user.id);
      if (error) {
        Sentry.captureException(error);
        console.error(`DELETE ACCOUNT: failed on ${table}:`, error.message);
        return NextResponse.json(
          {
            error:
              'We could not finish deleting your account. Nothing has been half-removed that you need to worry about — please contact support and we will complete it by hand.',
          },
          { status: 500, headers: NO_STORE_HEADERS }
        );
      }
    }

    // ── 2. Detach payments, keep the transaction ────────────────────────
    // The audit found payments.user_id is NOT NULL with ON DELETE CASCADE, so
    // this update fails and step 3 would then delete the payment rows outright
    // — destroying sales records UK tax law requires be kept for six years.
    //
    // So a failure here is fatal, not a warning. Refusing to finish is the
    // safe outcome: the customer can be told to contact us, whereas records
    // deleted to satisfy an erasure request cannot be brought back.
    //
    // supabase/security-fixes-part2.sql makes the column nullable with
    // ON DELETE SET NULL, after which this succeeds and the branch never runs.
    const { error: paymentError } = await supabaseServer
      .from(PAYMENTS_TABLE)
      .update({ user_id: null })
      .eq('user_id', user.id);

    if (paymentError) {
      const { count } = await supabaseServer
        .from(PAYMENTS_TABLE)
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if ((count ?? 0) > 0) {
        Sentry.captureException(paymentError);
        console.error(
          'DELETE ACCOUNT: refusing to continue — cannot detach',
          count,
          'payment record(s), and deleting the user would cascade them away:',
          paymentError.message
        );
        return NextResponse.json(
          {
            error:
              'We could not finish deleting your account because of a problem with your purchase records. Nothing has been lost. Please contact support and we will complete it by hand.',
          },
          { status: 500, headers: NO_STORE_HEADERS }
        );
      }

      // No payment rows to lose, so the failed update was a no-op anyway.
      console.warn('DELETE ACCOUNT: payment detach failed but user has no payments —', paymentError.message);
    }

    // Audit rows record that something happened, not what was in it.
    await supabaseServer.from(AUDIT_TABLE).update({ user_id: null }).eq('user_id', user.id);

    // ── 3. The auth user, last ──────────────────────────────────────────
    const { error: authError } = await supabaseServer.auth.admin.deleteUser(user.id);
    if (authError) {
      Sentry.captureException(authError);
      console.error('DELETE ACCOUNT: auth user deletion failed:', authError.message);
      return NextResponse.json(
        {
          error:
            'Your data has been removed, but we could not close the sign-in record itself. Please contact support so we can finish it.',
        },
        { status: 500, headers: NO_STORE_HEADERS }
      );
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
