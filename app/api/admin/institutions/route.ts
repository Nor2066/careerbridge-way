// app/api/admin/institutions/route.ts
//
// GET   the universities, with their domains, staff and how many students have
//       joined. Admin only.
// POST  set up a new university. Admin only, same-origin only, and written to
//       audit_logs — this hands out paid access, so it leaves a trail.

import { NextResponse } from 'next/server';
import { z } from 'zod';
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

    const body = await request.json();
    const parsed = InstitutionInputSchema.safeParse(body);
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

    // The page picks this id when the form opens and sends it with every try.
    // A browser does not retry a POST on its own when the connection drops, so
    // the page does -- and if the first try did get through, the retry finds
    // that row here instead of creating the same university twice.
    const requestedId = z.string().uuid().safeParse(body?.id);
    const id = requestedId.success ? requestedId.data : crypto.randomUUID();

    const conflicts = await findDomainConflicts(domains, id);
    if (conflicts.length) {
      return NextResponse.json(
        { error: `Already used by another university: ${conflicts.join(', ')}` },
        { status: 409, headers: NO_STORE_HEADERS }
      );
    }

    const { error: insertError } = await supabaseServer.from('institutions').insert({ ...row, id });
    if (insertError) {
      if (insertError.code === '23505') {
        const { data: existing } = await supabaseServer.from('institutions').select('id').eq('id', id).maybeSingle();
        if (existing) return NextResponse.json({ ok: true, id, repeated: true }, { headers: NO_STORE_HEADERS });
      }
      throw insertError;
    }

    try {
      await replaceDomainsAndStaff(id, domains, staffEmails);
    } catch (childError) {
      // Do not leave a university behind with half its setup.
      await supabaseServer.from('institutions').delete().eq('id', id);
      throw childError;
    }

    await logAudit({
      userId: gate.user.id,
      action: 'admin_institution_change',
      ipAddress: getIP(request),
      metadata: { kind: 'create', institutionId: id, name: row.name, domains, staffCount: staffEmails.length },
    });

    return NextResponse.json({ ok: true, id }, { headers: NO_STORE_HEADERS });
  } catch (err) {
    if (isUnauthorized(err)) return unauthorizedResponse();
    Sentry.captureException(err);
    console.error('ADMIN INSTITUTION CREATE ERROR:', err);
    return NextResponse.json({ error: 'Could not save the university.' }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
