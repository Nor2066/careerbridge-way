// app/api/admin/withdrawals/[id]/route.ts
//
// PATCH  record how a withdrawal was handled: the outcome, a note, and — the
//        first time only — taking back what the refunded purchase granted
//        (attempts, follow-up credits, the bundle, the plan).
//
// The refund itself is made in the Stripe Dashboard, not here. Moving money
// stays a deliberate act in Stripe, where the amount and the card are visible;
// this records that it happened and tidies the balance to match.

import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-gate';
import { isUnauthorized, unauthorizedResponse } from '@/lib/api-errors';
import { isSameOrigin, NO_STORE_HEADERS } from '@/lib/auth-cookies';
import { supabaseServer } from '@/lib/supabase-server';
import { logAudit } from '@/lib/audit';
import { getIP } from '@/lib/rate-limit';
import { WITHDRAWAL_STATUSES, planAttemptRemoval, type AttemptRemoval } from '@/lib/withdrawal-rules';

export const dynamic = 'force-dynamic';

const HandleSchema = z.object({
  status: z.enum(WITHDRAWAL_STATUSES),
  note: z.string().trim().max(2000).optional(),
  removeMainAttempts: z.number().int().min(0).max(20).default(0),
  removeFollowupCredits: z.number().int().min(0).max(20).default(0),
  revokeFollowupBundle: z.boolean().default(false),
  resetPlan: z.boolean().default(false),
});

const MAX_REMOVAL_ATTEMPTS = 5;

function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status, headers: NO_STORE_HEADERS });
}

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return fail(403, 'Bad request');

  try {
    const gate = await requireAdmin(request);
    if ('response' in gate) return gate.response;

    const { id } = await ctx.params;
    if (!z.string().uuid().safeParse(id).success) return fail(404, 'Unknown withdrawal');

    const parsed = HandleSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return fail(400, 'Invalid form');
    const input = parsed.data;

    const { data: current, error: readError } = await supabaseServer
      .from('withdrawals')
      .select('id, user_id, status')
      .eq('id', id)
      .maybeSingle();
    if (readError) throw readError;
    if (!current) return fail(404, 'Unknown withdrawal');

    const removal: AttemptRemoval = {
      mainAttempts: input.removeMainAttempts,
      followupCredits: input.removeFollowupCredits,
      revokeBundle: input.revokeFollowupBundle,
      resetPlan: input.resetPlan,
    };
    const removing =
      removal.mainAttempts > 0 || removal.followupCredits > 0 || removal.revokeBundle || removal.resetPlan;

    if (removing && current.status !== 'received') {
      // Taking attempts back twice would punish the customer for a second
      // save. Once handled, only the outcome and note can change.
      return fail(409, 'Attempts can only be removed the first time a withdrawal is handled.');
    }
    if (removing && !current.user_id) {
      return fail(400, 'This withdrawal is not linked to an account, so there is nothing to remove.');
    }

    // Status first, pinned to the status we read, so two founders handling
    // the same row at once cannot both remove attempts.
    const handled = input.status !== 'received';
    const { data: updated, error: updateError } = await supabaseServer
      .from('withdrawals')
      .update({
        status: input.status,
        handled_note: input.note || null,
        handled_at: handled ? new Date().toISOString() : null,
        handled_by: handled ? gate.user.id : null,
      })
      .eq('id', id)
      .eq('status', current.status)
      .select('id');
    if (updateError) throw updateError;
    if (!updated?.length) return fail(409, 'Someone else changed this withdrawal just now. Reload and check.');

    let removed: Record<string, unknown> | null = null;
    if (removing) {
      try {
        removed = await removeFromBalance(current.user_id!, removal);
      } catch (err) {
        Sentry.captureException(err);
        console.error('ADMIN WITHDRAWAL: outcome saved but balance not changed:', err);
        return fail(500, 'The outcome was saved, but the attempts were NOT removed. Remove them by hand (see supabase/withdrawals.sql).');
      }
    }

    await logAudit({
      userId: gate.user.id,
      action: 'admin_withdrawal_change',
      ipAddress: getIP(request),
      metadata: { withdrawalId: id, from: current.status, to: input.status, removed },
    });

    return NextResponse.json({ ok: true, removed }, { headers: NO_STORE_HEADERS });
  } catch (err) {
    if (isUnauthorized(err)) return unauthorizedResponse();
    Sentry.captureException(err);
    console.error('ADMIN WITHDRAWAL UPDATE ERROR:', err);
    return fail(500, 'Internal server error');
  }
}

/** Applies planAttemptRemoval as a compare-and-swap, re-reading on contention. */
async function removeFromBalance(userId: string, remove: AttemptRemoval): Promise<Record<string, unknown> | null> {
  for (let attempt = 1; attempt <= MAX_REMOVAL_ATTEMPTS; attempt++) {
    const { data: sub, error } = await supabaseServer
      .from('subscriptions')
      .select('plan, main_attempts_remaining, topup_followup_credits, followup_bundle_purchased')
      .eq('user_id', userId)
      .single();
    if (error || !sub) throw new Error(`Subscription not found for user ${userId}`);

    const plan = planAttemptRemoval(sub, remove);
    if (!plan) return null;

    let query = supabaseServer
      .from('subscriptions')
      .update({ ...plan.updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
    for (const [column, value] of Object.entries(plan.guards)) {
      query = value === null ? query.is(column, null) : query.eq(column, value);
    }
    const { data, error: writeError } = await query.select('user_id');
    if (writeError) throw writeError;
    if ((data?.length ?? 0) > 0) return plan.updates;
  }
  throw new Error(`Could not change the balance for ${userId} after ${MAX_REMOVAL_ATTEMPTS} tries`);
}
