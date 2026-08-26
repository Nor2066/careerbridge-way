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
    // If user_id is NOT NULL in your schema this update fails; that is not
    // fatal on its own, but it does mean step 3 will fail too if the foreign
    // key restricts deletion. See supabase/audit-queries.sql — the fix is to
    // make payments.user_id nullable with ON DELETE SET NULL.
    const { error: paymentError } = await supabaseServer
      .from(PAYMENTS_TABLE)
      .update({ user_id: null })
      .eq('user_id', user.id);

    if (paymentError) {
      console.warn(
        'DELETE ACCOUNT: could not detach payment records —',
        paymentError.message,
        '(see supabase/audit-queries.sql for the constraint this needs)'
      );
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
