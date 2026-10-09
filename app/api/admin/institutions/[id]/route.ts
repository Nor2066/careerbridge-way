// app/api/admin/institutions/[id]/route.ts
//
// PATCH  edit a university: details, licence dates, domains and staff. The full
//        form is sent each time, so domains and staff are replaced with exactly
//        what the form holds. To stop access without losing the record, untick
//        "Active" rather than deleting anything.

import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';
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
  replaceDomainsAndStaff,
} from '@/lib/institution-admin';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Bad request' }, { status: 403, headers: NO_STORE_HEADERS });
  }

  try {
    const gate = await requireAdmin(request);
    if ('response' in gate) return gate.response;

    const { id } = await ctx.params;
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ error: 'Unknown university' }, { status: 404, headers: NO_STORE_HEADERS });
    }

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

    const conflicts = await findDomainConflicts(domains, id);
    if (conflicts.length) {
      return NextResponse.json(
        { error: `Already used by another university: ${conflicts.join(', ')}` },
        { status: 409, headers: NO_STORE_HEADERS }
      );
    }

    const { data: updated, error: updateError } = await supabaseServer
      .from('institutions')
      .update({ ...row, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id');
    if (updateError) throw updateError;
    if (!updated?.length) {
      return NextResponse.json({ error: 'Unknown university' }, { status: 404, headers: NO_STORE_HEADERS });
    }

    await replaceDomainsAndStaff(id, domains, staffEmails);

    await logAudit({
      userId: gate.user.id,
      action: 'admin_institution_change',
      ipAddress: getIP(request),
      metadata: {
        kind: 'update',
        institutionId: id,
        name: row.name,
        isActive: row.is_active,
        licence: [row.licence_starts_at, row.licence_ends_at],
        domains,
        staffCount: staffEmails.length,
      },
    });

    return NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS });
  } catch (err) {
    if (isUnauthorized(err)) return unauthorizedResponse();
    Sentry.captureException(err);
    console.error('ADMIN INSTITUTION UPDATE ERROR:', err);
    return NextResponse.json({ error: 'Could not save the university.' }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
