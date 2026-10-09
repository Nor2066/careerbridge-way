// lib/institution-admin.ts
//
// Creating and editing universities from /admin/universities. Shared by the
// create (POST /api/admin/institutions) and edit (PATCH .../[id]) routes so the
// two cannot validate differently.
//
// Every university is set up by hand on purpose: it has paid, it has agreed
// the domains its students use, and it has named the staff who may see its
// dashboard. Nothing here is reachable without an admin role.

if (typeof window !== 'undefined') {
  throw new Error('lib/institution-admin.ts is server-only');
}

import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase-server';
import {
  dateInputFromLicenceEnd,
  dateInputFromLicenceStart,
  licenceEndFromDateInput,
  licenceStartFromDateInput,
  licenceStatus,
  normaliseDomain,
  normaliseEmail,
} from '@/lib/institution-rules';

export const InstitutionInputSchema = z.object({
  name: z.string().trim().min(2).max(200),
  country: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, 'Country must be a two-letter code such as ES')
    .nullable(),
  licenceStart: z.string(),
  licenceEnd: z.string(),
  attemptsPerStudent: z.number().int().min(1).max(20),
  followupIncluded: z.boolean(),
  maxStudents: z.number().int().positive().nullable(),
  isActive: z.boolean(),
  domains: z.array(z.string().max(253)).min(1, 'Add at least one email domain').max(20),
  staffEmails: z.array(z.string().trim().email('One of the staff emails is not valid').max(320)).max(50),
  notes: z.string().max(2000).nullable(),
});

export type InstitutionInput = z.infer<typeof InstitutionInputSchema>;

export type CleanInstitution = {
  row: {
    name: string;
    country: string | null;
    licence_starts_at: string;
    licence_ends_at: string;
    attempts_per_student: number;
    followup_included: boolean;
    max_students: number | null;
    is_active: boolean;
    notes: string | null;
  };
  domains: string[];
  staffEmails: string[];
};

/** Validates the parsed form beyond what the schema can, or says what is wrong. */
export function cleanInstitutionInput(input: InstitutionInput): { ok: true; value: CleanInstitution } | { ok: false; error: string } {
  const start = licenceStartFromDateInput(input.licenceStart);
  const end = licenceEndFromDateInput(input.licenceEnd);
  if (!start || !end) return { ok: false, error: 'Licence dates must be real dates.' };
  if (Date.parse(end) <= Date.parse(start)) {
    return { ok: false, error: 'The licence must end on or after the day it starts.' };
  }

  const domains: string[] = [];
  const bad: string[] = [];
  for (const raw of input.domains) {
    if (!raw.trim()) continue;
    const d = normaliseDomain(raw);
    if (d) {
      if (!domains.includes(d)) domains.push(d);
    } else {
      bad.push(raw.trim());
    }
  }
  if (bad.length) return { ok: false, error: `These are not valid email domains: ${bad.join(', ')}` };
  if (!domains.length) return { ok: false, error: 'Add at least one email domain.' };

  const staffEmails = [...new Set(input.staffEmails.map(normaliseEmail).filter(Boolean))];

  return {
    ok: true,
    value: {
      row: {
        name: input.name,
        country: input.country ?? null,
        licence_starts_at: start,
        licence_ends_at: end,
        attempts_per_student: input.attemptsPerStudent,
        followup_included: input.followupIncluded,
        max_students: input.maxStudents,
        is_active: input.isActive,
        notes: input.notes?.trim() ? input.notes.trim() : null,
      },
      domains,
      staffEmails,
    },
  };
}

/**
 * Domains already claimed by a different institution. Checked before any
 * write, so a clash is reported without leaving a half-saved university.
 */
export async function findDomainConflicts(domains: string[], exceptInstitutionId?: string): Promise<string[]> {
  if (!domains.length) return [];
  const { data, error } = await supabaseServer
    .from('institution_domains')
    .select('domain, institution_id')
    .in('domain', domains);
  if (error) throw error;
  return (data ?? [])
    .filter((r) => r.institution_id !== exceptInstitutionId)
    .map((r) => r.domain as string);
}

/** Makes the stored domains and staff for an institution exactly these lists. */
export async function replaceDomainsAndStaff(institutionId: string, domains: string[], staffEmails: string[]): Promise<void> {
  const [{ data: currentDomains, error: dErr }, { data: currentStaff, error: sErr }] = await Promise.all([
    supabaseServer.from('institution_domains').select('domain').eq('institution_id', institutionId),
    supabaseServer.from('institution_staff').select('email').eq('institution_id', institutionId),
  ]);
  if (dErr) throw dErr;
  if (sErr) throw sErr;

  const haveDomains = new Set((currentDomains ?? []).map((r) => r.domain as string));
  const haveStaff = new Set((currentStaff ?? []).map((r) => r.email as string));

  const removeDomains = [...haveDomains].filter((d) => !domains.includes(d));
  const addDomains = domains.filter((d) => !haveDomains.has(d));
  const removeStaff = [...haveStaff].filter((e) => !staffEmails.includes(e));
  const addStaff = staffEmails.filter((e) => !haveStaff.has(e));

  if (removeDomains.length) {
    const { error } = await supabaseServer
      .from('institution_domains')
      .delete()
      .eq('institution_id', institutionId)
      .in('domain', removeDomains);
    if (error) throw error;
  }
  if (addDomains.length) {
    const { error } = await supabaseServer
      .from('institution_domains')
      .insert(addDomains.map((domain) => ({ domain, institution_id: institutionId })));
    if (error) throw error;
  }
  if (removeStaff.length) {
    const { error } = await supabaseServer
      .from('institution_staff')
      .delete()
      .eq('institution_id', institutionId)
      .in('email', removeStaff);
    if (error) throw error;
  }
  if (addStaff.length) {
    const { error } = await supabaseServer
      .from('institution_staff')
      .insert(addStaff.map((email) => ({ email, institution_id: institutionId })));
    if (error) throw error;
  }
}

export type AdminInstitution = {
  id: string;
  name: string;
  country: string | null;
  licenceStart: string;
  licenceEnd: string;
  status: ReturnType<typeof licenceStatus>;
  attemptsPerStudent: number;
  followupIncluded: boolean;
  maxStudents: number | null;
  isActive: boolean;
  notes: string | null;
  domains: string[];
  staffEmails: string[];
  studentsJoined: number;
  universityAttemptsUsed: number;
  createdAt: string;
};

/** Everything the admin list shows, one row per university. */
export async function listInstitutionsForAdmin(): Promise<AdminInstitution[]> {
  const [instRes, domainRes, staffRes, memberRes, resultRes] = await Promise.all([
    supabaseServer
      .from('institutions')
      .select('id, name, country, licence_starts_at, licence_ends_at, attempts_per_student, followup_included, max_students, is_active, notes, created_at')
      .order('name'),
    supabaseServer.from('institution_domains').select('domain, institution_id'),
    supabaseServer.from('institution_staff').select('email, institution_id'),
    supabaseServer.from('institution_members').select('institution_id'),
    supabaseServer.from('user_results').select('institution_id').not('institution_id', 'is', null),
  ]);

  for (const res of [instRes, domainRes, staffRes, memberRes, resultRes]) {
    if (res.error) throw res.error;
  }

  const group = <T,>(rows: T[] | null, key: (r: T) => string) => {
    const m = new Map<string, T[]>();
    for (const r of rows ?? []) {
      const k = key(r);
      m.set(k, [...(m.get(k) ?? []), r]);
    }
    return m;
  };

  const domains = group(domainRes.data, (r) => r.institution_id as string);
  const staff = group(staffRes.data, (r) => r.institution_id as string);
  const members = group(memberRes.data, (r) => r.institution_id as string);
  const results = group(resultRes.data, (r) => r.institution_id as string);

  return (instRes.data ?? []).map((i) => ({
    id: i.id,
    name: i.name,
    country: i.country,
    licenceStart: dateInputFromLicenceStart(i.licence_starts_at),
    licenceEnd: dateInputFromLicenceEnd(i.licence_ends_at),
    status: licenceStatus(i),
    attemptsPerStudent: i.attempts_per_student,
    followupIncluded: i.followup_included,
    maxStudents: i.max_students,
    isActive: i.is_active,
    notes: i.notes,
    domains: (domains.get(i.id) ?? []).map((d) => d.domain as string).sort(),
    staffEmails: (staff.get(i.id) ?? []).map((s) => s.email as string).sort(),
    studentsJoined: members.get(i.id)?.length ?? 0,
    universityAttemptsUsed: results.get(i.id)?.length ?? 0,
    createdAt: i.created_at,
  }));
}
