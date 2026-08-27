// app/api/admin/regrant/route.ts
//
// "Restore purchases" from the launch checklist, in the shape a web app
// actually needs it.
//
// The situation it exists for: somebody pays, and then cannot reach what they
// bought. Almost always because they signed up with Google the first time and
// with email the second, so the payment sits on one account and they are
// looking at another. From their side it is indistinguishable from being
// robbed, and without this the only fix is opening a database console — which
// means it happens slowly, at a keyboard, by someone who might mistype a uuid.
//
// GET  ?email=… or ?sessionId=…   look up what was paid for
// POST { paymentId, targetUserId } re-apply that grant to an account
//
// Deliberate design choices:
//
//   • Lookup and action are separate calls. You see what you are about to do
//     before you do it, rather than passing an email to something that grants
//     in the same breath.
//
//   • The grant goes through fulfillCheckoutSession, the same path the webhook
//     uses, so the rules cannot drift between "normal" and "manual". It writes
//     a new payments row with a synthetic session id, which means the unique
//     constraint stops the same regrant being applied twice.
//
//   • Every regrant is written to audit_logs. Somebody with this endpoint can
//     hand out free product; the least it can do is leave a trail.

import { NextResponse } from 'next/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { requireAuth } from '@/lib/auth';
import { isUnauthorized, unauthorizedResponse } from '@/lib/api-errors';
import { getUserRole, isAdmin } from '@/lib/roles';
import { supabaseServer } from '@/lib/supabase-server';
import { fulfillCheckoutSession } from '@/lib/fulfillment';
import { logAudit } from '@/lib/audit';
import { isSameOrigin, NO_STORE_HEADERS } from '@/lib/auth-cookies';
import { adminReadLimiter, getUserIdentifier, getIP } from '@/lib/rate-limit';
import type { ProductType } from '@/lib/plans';

export const dynamic = 'force-dynamic';

async function requireAdmin(request: Request) {
  const user = await requireAuth(request);
  const { success } = await adminReadLimiter.limit(getUserIdentifier(user.id));
  if (!success) return { error: NextResponse.json({ error: 'Too many requests' }, { status: 429 }) };

  const role = await getUserRole(user.id);
  if (!isAdmin(role)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { user, role };
}

// ── Look up a payment ───────────────────────────────────────────────────
export async function GET(request: Request) {
  try {
    const gate = await requireAdmin(request);
    if (gate.error) return gate.error;

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const sessionId = searchParams.get('sessionId');

    if (!email && !sessionId) {
      return NextResponse.json(
        { error: 'Provide either ?email= or ?sessionId=' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    let query = supabaseServer
      .from('payments')
      .select('id, created_at, user_id, product_type, amount_cents, currency, status, stripe_session_id')
      .order('created_at', { ascending: false })
      .limit(20);

    if (sessionId) {
      query = query.eq('stripe_session_id', sessionId);
    } else {
      // payments has no email column, so resolve the address to accounts
      // first. There may be more than one — that is the whole problem.
      const { data: users, error: usersError } =
        await supabaseServer.auth.admin.listUsers({ page: 1, perPage: 200 });
      if (usersError) throw usersError;

      const matching = users.users
        .filter((u) => (u.email ?? '').toLowerCase() === email!.toLowerCase())
        .map((u) => u.id);

      if (matching.length === 0) {
        return NextResponse.json(
          { accounts: [], payments: [], note: 'No account with that address.' },
          { headers: NO_STORE_HEADERS }
        );
      }
      query = query.in('user_id', matching);
    }

    const { data: payments, error } = await query;
    if (error) throw error;

    return NextResponse.json({ payments: payments ?? [] }, { headers: NO_STORE_HEADERS });
  } catch (err) {
    if (isUnauthorized(err)) return unauthorizedResponse();
    Sentry.captureException(err);
    console.error('REGRANT LOOKUP ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── Re-apply a grant ────────────────────────────────────────────────────
const RegrantSchema = z.object({
  paymentId: z.union([z.string(), z.number()]),
  targetUserId: z.string().uuid(),
  reason: z.string().min(3).max(300),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Bad request' }, { status: 403, headers: NO_STORE_HEADERS });
  }

  try {
    const gate = await requireAdmin(request);
    if (gate.error) return gate.error;
    const admin = gate.user!;

    const parsed = RegrantSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Need paymentId, targetUserId and a reason.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const { paymentId, targetUserId, reason } = parsed.data;

    const { data: payment, error: paymentError } = await supabaseServer
      .from('payments')
      .select('id, product_type, amount_cents, currency, stripe_session_id, status')
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'No payment with that id.' },
        { status: 404, headers: NO_STORE_HEADERS }
      );
    }

    if (payment.status !== 'completed') {
      return NextResponse.json(
        { error: `That payment is "${payment.status}", not completed. Refusing to grant.` },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    // A synthetic session id derived from the original. Going through the same
    // fulfillment path as the webhook means the grant rules cannot drift, and
    // the unique constraint on stripe_session_id makes a second attempt at the
    // same regrant a no-op rather than a double grant.
    const syntheticSessionId = `regrant_${payment.stripe_session_id}_${targetUserId}`;

    const outcome = await fulfillCheckoutSession({
      userId: targetUserId,
      productType: payment.product_type as ProductType,
      sessionId: syntheticSessionId,
      paymentIntentId: null,
      amountTotal: 0, // Nothing was charged again; the original row holds the money.
      currency: payment.currency,
    });

    await logAudit({
      userId: admin.id,
      action: 'admin_viewed_assessments',
      ipAddress: getIP(request),
      metadata: {
        kind: 'purchase_regrant',
        paymentId: payment.id,
        productType: payment.product_type,
        targetUserId,
        reason,
        outcome,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        outcome,
        message:
          outcome === 'already_processed'
            ? 'This regrant had already been applied — nothing changed.'
            : `Granted ${payment.product_type} to that account.`,
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    if (isUnauthorized(err)) return unauthorizedResponse();
    Sentry.captureException(err);
    console.error('REGRANT ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
