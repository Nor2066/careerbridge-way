// app/api/cron/retention/route.ts
//
// Runs once a night (see "crons" in vercel.json) and applies the rule for
// accounts nobody has used for two years: one email, then deletion three
// months later. The rule is in lib/retention-rules.ts and the order of
// operations in lib/inactive-accounts.ts; this file only checks who is
// calling and connects the job to the real database and mail provider.
//
// WHO MAY CALL IT
//
// Only the scheduler. Vercel sends "Authorization: Bearer <CRON_SECRET>" with
// each scheduled call, and nothing else is accepted. With no CRON_SECRET set
// the route refuses everyone, which is also the off switch: until the variable
// exists in Vercel, nothing here ever runs.
//
// TRYING IT SAFELY
//
// Add ?dry=1 to see what a run would do without sending or deleting anything:
//
//   curl -H "Authorization: Bearer $CRON_SECRET" https://adaqno.com/api/cron/retention?dry=1

import { NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'crypto';
import * as Sentry from '@sentry/nextjs';
import { supabaseServer } from '@/lib/supabase-server';
import { NO_STORE_HEADERS } from '@/lib/auth-cookies';
import { logAudit } from '@/lib/audit';
import { sendInactiveAccountNotice } from '@/lib/email';
import { deleteAccountData } from '@/lib/account-deletion';
import {
  runInactiveAccountJob,
  type InactiveAccountDeps,
  type InactiveAccountRow,
} from '@/lib/inactive-accounts';

export const dynamic = 'force-dynamic';

// Up to 25 emails and 25 deletions a run, each a handful of round trips.
export const maxDuration = 60;

const COLUMNS = 'id, email, role, last_active_at, inactivity_notice_sent_at';

/** Compared as hashes so the check takes the same time whatever was sent. */
function sameSecret(given: string, expected: string): boolean {
  const a = createHash('sha256').update(given).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

/** The columns do not exist until supabase/retention-rules.sql has been run. */
function isMissingColumn(error: { code?: string } | null): boolean {
  return error?.code === '42703' || error?.code === 'PGRST204';
}

const deps: InactiveAccountDeps = {
  async listCandidates(cutoffIso, limit) {
    const { data, error } = await supabaseServer
      .from('profiles')
      .select(COLUMNS)
      .lt('last_active_at', cutoffIso)
      .order('last_active_at', { ascending: true })
      .limit(limit);

    if (isMissingColumn(error)) return { ready: false, rows: [] };
    if (error) throw new Error(`could not list unused accounts: ${error.message}`);
    return { ready: true, rows: (data ?? []) as InactiveAccountRow[] };
  },

  async reload(id) {
    const { data, error } = await supabaseServer.from('profiles').select(COLUMNS).eq('id', id).maybeSingle();
    if (error) throw new Error(`could not re-read account: ${error.message}`);
    return (data as InactiveAccountRow | null) ?? null;
  },

  async emailFor(id) {
    const { data, error } = await supabaseServer.auth.admin.getUserById(id);
    if (error) return null;
    return data.user?.email ?? null;
  },

  async claimNotice(id, previous, nowIso) {
    const base = supabaseServer.from('profiles').update({ inactivity_notice_sent_at: nowIso }).eq('id', id);
    const guarded =
      previous === null
        ? base.is('inactivity_notice_sent_at', null)
        : base.eq('inactivity_notice_sent_at', previous);
    const { data, error } = await guarded.select('id');
    if (error) throw new Error(`could not record the notice: ${error.message}`);
    return (data ?? []).length === 1;
  },

  async releaseNotice(id, previous) {
    const { error } = await supabaseServer
      .from('profiles')
      .update({ inactivity_notice_sent_at: previous })
      .eq('id', id);
    if (error) console.error('RETENTION: could not take back a notice that was not sent:', error.message);
  },

  sendNotice: (to, deleteOn) => sendInactiveAccountNotice({ to, deleteOn }),

  deleteAccount: (id) => deleteAccountData(id),

  async audit(event, details) {
    const { user_id, ...metadata } = details as { user_id?: string } & Record<string, unknown>;
    await logAudit({ userId: user_id ?? null, action: event, metadata });
  },
};

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const given = request.headers.get('authorization') ?? '';
  if (!secret || !sameSecret(given, `Bearer ${secret}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE_HEADERS });
  }

  const dryRun = new URL(request.url).searchParams.get('dry') === '1';

  try {
    const summary = await runInactiveAccountJob({ now: new Date(), dryRun, deps });
    // One line a night in the log is how anyone finds out this is working.
    console.log('RETENTION JOB:', JSON.stringify(summary));
    return NextResponse.json(summary, { headers: NO_STORE_HEADERS });
  } catch (err) {
    Sentry.captureException(err);
    console.error('RETENTION JOB FAILED:', err);
    return NextResponse.json({ error: 'Retention job failed' }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
