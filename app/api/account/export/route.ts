// app/api/account/export/route.ts
//
// UK GDPR Articles 15 and 20: a copy of your data, in a portable format.
// Our privacy policy promises a button, so here is the thing behind it.
//
// Returns JSON rather than a PDF deliberately — Article 20 asks for
// "structured, commonly used and machine-readable", and JSON is the format a
// person can actually hand to another service.

import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { requireAuth } from '@/lib/auth';
import { isUnauthorized, unauthorizedResponse } from '@/lib/api-errors';
import { supabaseServer } from '@/lib/supabase-server';
import { USER_DATA_TABLES, PAYMENTS_TABLE } from '@/lib/account-data';
import { NO_STORE_HEADERS } from '@/lib/auth-cookies';
import { readLimiter, getUserIdentifier } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);

    const { success } = await readLimiter.limit(getUserIdentifier(user.id));
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const account: Record<string, unknown> = {
      exported_at: new Date().toISOString(),
      account: {
        id: user.id,
        email: user.email ?? null,
        created_at: user.created_at ?? null,
      },
    };

    // Sequential rather than Promise.all: an export is rare, not latency
    // sensitive, and running eight queries at once against the pooler for a
    // background-ish request is not worth the connection pressure.
    for (const { table, userColumn, label } of USER_DATA_TABLES) {
      const { data, error } = await supabaseServer
        .from(table)
        .select('*')
        .eq(userColumn, user.id);

      if (error) {
        // One missing table must not sink the whole export — the person still
        // gets everything else, and the gap is visible rather than silent.
        console.error(`EXPORT: could not read ${table}:`, error.message);
        account[label] = { error: 'Could not be exported. Please contact support.' };
        continue;
      }

      account[label] = data ?? [];
    }

    // Payments are listed with only the fields a customer would want on a
    // receipt. The Stripe identifiers are ours for reconciliation, not theirs.
    const { data: payments } = await supabaseServer
      .from(PAYMENTS_TABLE)
      .select('created_at, product_type, amount_cents, currency, status')
      .eq('user_id', user.id);

    account.purchases = payments ?? [];

    const filename = `careerbridge-data-${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(JSON.stringify(account, null, 2), {
      status: 200,
      headers: {
        ...NO_STORE_HEADERS,
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    if (isUnauthorized(err)) return unauthorizedResponse();
    Sentry.captureException(err);
    console.error('ACCOUNT EXPORT ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
