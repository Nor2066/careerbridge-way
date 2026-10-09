// app/api/university/summary/route.ts
//
// What a university's staff see: totals for their own students, never a
// person. The separation between universities is enforced here, on every
// request:
//
//   1. The caller must be signed in with a verified address.
//   2. That address must be on the requested institution's staff list.
//   3. Every query below is filtered to that one institution's id.
//
// No answers, no free text, no reports and no emails leave this route — only
// counts, and only counts large enough not to point at anyone (see
// MIN_GROUP_SIZE in lib/institution-rules.ts).

import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { requireVerifiedAuth } from '@/lib/auth';
import {
  isUnauthorized,
  unauthorizedResponse,
  isEmailNotVerified,
  emailNotVerifiedResponse,
} from '@/lib/api-errors';
import { NO_STORE_HEADERS } from '@/lib/auth-cookies';
import { supabaseServer } from '@/lib/supabase-server';
import { readLimiter, getUserIdentifier } from '@/lib/rate-limit';
import { getStaffInstitutions } from '@/lib/institutions';
import {
  summariseInstitution,
  dateInputFromLicenceStart,
  dateInputFromLicenceEnd,
  licenceStatus,
  type ResultForSummary,
} from '@/lib/institution-rules';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await requireVerifiedAuth(request);

    const { success } = await readLimiter.limit(getUserIdentifier(user.id));
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: NO_STORE_HEADERS });
    }

    const staffOf = await getStaffInstitutions(user);
    if (staffOf.length === 0) {
      return NextResponse.json({ error: 'Forbidden', code: 'NOT_STAFF' }, { status: 403, headers: NO_STORE_HEADERS });
    }

    const requested = new URL(request.url).searchParams.get('institutionId');
    const institution = requested ? staffOf.find((i) => i.id === requested) : staffOf[0];
    if (!institution) {
      // Asking for a university you are not staff at gets the same answer as
      // asking for one that does not exist.
      return NextResponse.json({ error: 'Forbidden', code: 'NOT_STAFF' }, { status: 403, headers: NO_STORE_HEADERS });
    }

    const [membersRes, resultsRes, ratingsRes, licenceRes, domainsRes] = await Promise.all([
      supabaseServer
        .from('institution_members')
        .select('user_id', { count: 'exact', head: true })
        .eq('institution_id', institution.id),
      supabaseServer
        .from('user_results')
        .select('user_id, created_at, top_clusters, ai_main_reports (id), ai_followup_reports (id)')
        .eq('institution_id', institution.id),
      supabaseServer
        .from('assessments')
        .select('feedback_rating')
        .eq('institution_id', institution.id)
        .not('feedback_rating', 'is', null),
      supabaseServer
        .from('institutions')
        .select('licence_starts_at, licence_ends_at, is_active, attempts_per_student, followup_included')
        .eq('id', institution.id)
        .single(),
      // So staff can tell their students which address to sign up with.
      supabaseServer.from('institution_domains').select('domain').eq('institution_id', institution.id),
    ]);

    for (const res of [membersRes, resultsRes, ratingsRes, licenceRes, domainsRes]) {
      if (res.error) throw res.error;
    }

    const results: ResultForSummary[] = (resultsRes.data ?? []).map((r) => ({
      user_id: r.user_id as string,
      created_at: r.created_at as string,
      top_clusters: r.top_clusters as ResultForSummary['top_clusters'],
      has_main_report: Array.isArray(r.ai_main_reports) && r.ai_main_reports.length > 0,
      has_followup_report: Array.isArray(r.ai_followup_reports) && r.ai_followup_reports.length > 0,
    }));

    const summary = summariseInstitution({
      membersJoined: membersRes.count ?? 0,
      results,
      ratings: (ratingsRes.data ?? []).map((r) => r.feedback_rating as number),
    });

    return NextResponse.json(
      {
        institution: { id: institution.id, name: institution.name, country: institution.country },
        institutions: staffOf.map((i) => ({ id: i.id, name: i.name })),
        licence: licenceRes.data
          ? {
              start: dateInputFromLicenceStart(licenceRes.data.licence_starts_at),
              end: dateInputFromLicenceEnd(licenceRes.data.licence_ends_at),
              status: licenceStatus(licenceRes.data),
              attemptsPerStudent: licenceRes.data.attempts_per_student,
              followupIncluded: licenceRes.data.followup_included,
            }
          : null,
        domains: (domainsRes.data ?? []).map((d) => d.domain as string).sort(),
        summary,
        generatedAt: new Date().toISOString(),
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    if (isUnauthorized(err)) return unauthorizedResponse();
    if (isEmailNotVerified(err)) return emailNotVerifiedResponse();
    Sentry.captureException(err);
    console.error('UNIVERSITY SUMMARY ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
