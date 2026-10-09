// app/api/admin/institutions/route.ts
//
// GET   the universities, with their domains, staff and how many students have
//       joined. Admin only.
// POST  set up a new university. Admin only, same-origin only, and written to
//       audit_logs — this hands out paid access, so it leaves a trail.

import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { requireAdmin } from '@/lib/admin-gate';
import { isUnauthorized, unauthorizedResponse } from '@/lib/api-errors';
import { isSameOrigin, NO_STORE_HEADERS } from '@/lib/auth-cookies';
import { supabaseServer } from '@/lib/supabase-server';
import { logAudit } from '@/lib/audit';
import { getIP } from '@/lib/rate-limit';
import {
  InstitutionInputSchema,
  cleanInstitutionInput,
  findDomainConflicts,
  listInstitutionsForAdmin,
  replaceDomainsAndStaff,
} from '@/lib/institution-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const gate = await requireAdmin(request);
    if ('response' in gate) return gate.response;

    const institutions = await listInstitutionsForAdmin();
    return NextResponse.json({ institutions }, { headers: NO_STORE_HEADERS });
  } catch (err) {
    if (isUnauthorized(err)) return unauthorizedResponse();
    Sentry.captureException(err);
    console.error('ADMIN INSTITUTIONS LIST ERROR:', err);
    return NextResponse.json(
      { error: 'Could not load universities. If this is the first time, run supabase/institutions.sql.' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Bad request' }, { status: 403, headers: NO_STORE_HEADERS });
  }

  try {
    const gate = await requireAdmin(request);
    if ('response' in gate) return gate.response;

    const parsed = InstitutionInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return NextResponse.json(
        { error: first ? `${first.path.join('.') || 'Form'}: ${first.message}` : 'Invalid form' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const cleaned = cleanInstitutionInput(parsed.data);
    if (!cleaned.ok) {
      return NextResponse.json({ error: cleaned.error }, { status: 400, headers: NO_STORE_HEADERS });
    }
    const { row, domains, staffEmails } = cleaned.value;

    const conflicts = await findDomainConflicts(domains);
    if (conflicts.length) {
      return NextResponse.json(
        { error: `Already used by another university: ${conflicts.join(', ')}` },
        { status: 409, headers: NO_STORE_HEADERS }
      );
    }

    const { data: created, error: insertError } = await supabaseServer
      .from('institutions')
      .insert(row)
      .select('id')
      .single();
    if (insertError || !created) throw insertError ?? new Error('Insert returned nothing');

    try {
      await replaceDomainsAndStaff(created.id, domains, staffEmails);
    } catch (childError) {
      // Do not leave a university behind with half its setup.
      await supabaseServer.from('institutions').delete().eq('id', created.id);
      throw childError;
    }

    await logAudit({
      userId: gate.user.id,
      action: 'admin_institution_change',
      ipAddress: getIP(request),
      metadata: { kind: 'create', institutionId: created.id, name: row.name, domains, staffCount: staffEmails.length },
    });

    return NextResponse.json({ ok: true, id: created.id }, { headers: NO_STORE_HEADERS });
  } catch (err) {
    if (isUnauthorized(err)) return unauthorizedResponse();
    Sentry.captureException(err);
    console.error('ADMIN INSTITUTION CREATE ERROR:', err);
    return NextResponse.json({ error: 'Could not save the university.' }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
