// lib/institutions.ts
//
// University licences: who belongs to which university, how many of its
// attempts they have left, and the reads and writes that go with that. The
// decisions themselves live in lib/institution-rules.ts.
//
// A student joins automatically, the first time the app sees them signed in
// with a VERIFIED address on one of the university's domains. Verification is
// the whole safeguard — without it anyone could sign up as x@esic.edu and help
// themselves to an attempt the university paid for.
//
// Every function here fails closed for the licence and open for the rest of the
// app: if these tables are unreachable (or not created yet), a student simply
// has no university access, and people paying for themselves are unaffected.

if (typeof window !== 'undefined') {
  throw new Error('lib/institutions.ts is server-only');
}

import { supabaseServer } from '@/lib/supabase-server';
import { isEmailVerified } from '@/lib/auth';
import {
  emailDomain,
  isLicenceActive,
  isNewPeriod,
  licenceAttemptsRemaining,
  normaliseEmail,
  type InstitutionLicence,
} from '@/lib/institution-rules';

export type InstitutionRow = InstitutionLicence & {
  id: string;
  name: string;
  country: string | null;
  followup_included: boolean;
  max_students: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type MemberRow = {
  user_id: string;
  institution_id: string;
  joined_at: string;
  licence_period_start: string;
  attempts_used: number;
};

/** What a student has through their university, as the routes need it. */
export type Licence = {
  institution: InstitutionRow;
  member: MemberRow;
  active: boolean;
  attemptsRemaining: number;
};

type AuthUser = {
  id: string;
  email?: string | null;
  email_confirmed_at?: string | null;
  confirmed_at?: string | null;
};

const INSTITUTION_COLUMNS =
  'id, name, country, is_active, licence_starts_at, licence_ends_at, attempts_per_student, followup_included, max_students, notes, created_at, updated_at';

function logDbError(where: string, error: { message?: string; code?: string } | null) {
  if (!error) return;
  console.error(`INSTITUTIONS: ${where}:`, error.message, 'code:', error.code);
}

function toLicence(institution: InstitutionRow, member: MemberRow): Licence {
  return {
    institution,
    member,
    active: isLicenceActive(institution),
    attemptsRemaining: licenceAttemptsRemaining(institution, member),
  };
}

async function getInstitution(id: string): Promise<InstitutionRow | null> {
  const { data, error } = await supabaseServer
    .from('institutions')
    .select(INSTITUTION_COLUMNS)
    .eq('id', id)
    .maybeSingle();
  logDbError('read institution', error);
  return (data as InstitutionRow | null) ?? null;
}

/**
 * The student's university licence, joining them first if their verified
 * address matches a university that is currently licensed.
 *
 * Returns null for anyone without a university, and also when the lookup
 * fails — see the header for why failing that way is the right side to fail.
 */
export async function getLicence(user: AuthUser): Promise<Licence | null> {
  try {
    const { data: member, error: memberError } = await supabaseServer
      .from('institution_members')
      .select('user_id, institution_id, joined_at, licence_period_start, attempts_used')
      .eq('user_id', user.id)
      .maybeSingle();

    if (memberError) {
      logDbError('read membership', memberError);
      return null;
    }

    if (member) {
      const institution = await getInstitution(member.institution_id);
      return institution ? toLicence(institution, member as MemberRow) : null;
    }

    return await joinByEmailDomain(user);
  } catch (err) {
    console.error('INSTITUTIONS: getLicence failed:', err);
    return null;
  }
}

async function joinByEmailDomain(user: AuthUser): Promise<Licence | null> {
  if (!isEmailVerified(user)) return null;
  const domain = emailDomain(user.email);
  if (!domain) return null;

  const { data: domainRow, error: domainError } = await supabaseServer
    .from('institution_domains')
    .select('institution_id')
    .eq('domain', domain)
    .maybeSingle();

  if (domainError) {
    logDbError('domain lookup', domainError);
    return null;
  }
  if (!domainRow) return null;

  const institution = await getInstitution(domainRow.institution_id);
  // Only join while the licence is in force. Someone who signs up after it
  // lapses gets nothing, rather than a membership with no attempts in it.
  if (!institution || !isLicenceActive(institution)) return null;

  if (institution.max_students != null) {
    const { count, error: countError } = await supabaseServer
      .from('institution_members')
      .select('user_id', { count: 'exact', head: true })
      .eq('institution_id', institution.id);
    if (countError) {
      logDbError('count members', countError);
      return null;
    }
    if ((count ?? 0) >= institution.max_students) {
      console.warn(`INSTITUTIONS: ${institution.name} is at its cap of ${institution.max_students} students`);
      return null;
    }
  }

  const newMember: MemberRow = {
    user_id: user.id,
    institution_id: institution.id,
    joined_at: new Date().toISOString(),
    licence_period_start: institution.licence_starts_at,
    attempts_used: 0,
  };

  // ignoreDuplicates: two tabs joining at once both succeed, and the second
  // simply finds the row the first one wrote.
  const { error: insertError } = await supabaseServer
    .from('institution_members')
    .upsert(newMember, { onConflict: 'user_id', ignoreDuplicates: true });

  if (insertError) {
    logDbError('join', insertError);
    return null;
  }

  const { data: saved, error: rereadError } = await supabaseServer
    .from('institution_members')
    .select('user_id, institution_id, joined_at, licence_period_start, attempts_used')
    .eq('user_id', user.id)
    .maybeSingle();

  if (rereadError || !saved) {
    logDbError('reread membership', rereadError);
    return null;
  }

  // The row we read back may belong to a different institution if two
  // requests raced with different results; trust what is stored.
  const owner = saved.institution_id === institution.id ? institution : await getInstitution(saved.institution_id);
  return owner ? toLicence(owner, saved as MemberRow) : null;
}

/**
 * Take one of the university's attempts for this student.
 *
 * Compare-and-swap on the values the licence was computed from, the same
 * pattern lib/subscription.ts uses: if anything moved in between, nobody is
 * charged twice — the caller is told it lost and refuses the request.
 *
 * A counter from an earlier licence period is reset to 1 rather than
 * incremented, which is how a renewal hands everyone a fresh allowance.
 */
export async function reserveLicenceAttempt(licence: Licence): Promise<boolean> {
  if (!licence.active || licence.attemptsRemaining <= 0) return false;

  const { institution, member } = licence;
  const newPeriod = isNewPeriod(institution, member);

  const { data, error } = await supabaseServer
    .from('institution_members')
    .update(
      newPeriod
        ? { attempts_used: 1, licence_period_start: institution.licence_starts_at }
        : { attempts_used: member.attempts_used + 1 }
    )
    .eq('user_id', member.user_id)
    .eq('institution_id', institution.id)
    .eq('licence_period_start', member.licence_period_start)
    .eq('attempts_used', member.attempts_used)
    .select('user_id');

  if (error) {
    logDbError('reserve attempt', error);
    return false;
  }
  return (data?.length ?? 0) > 0;
}

/**
 * Hand back an attempt reserved by reserveLicenceAttempt when the report could
 * not be produced. Guarded so it only undoes the exact step that was taken.
 */
export async function releaseLicenceAttempt(licence: Licence): Promise<void> {
  const { institution, member } = licence;
  const newPeriod = isNewPeriod(institution, member);
  const takenTo = newPeriod ? 1 : member.attempts_used + 1;
  const periodNow = newPeriod ? institution.licence_starts_at : member.licence_period_start;

  const { error } = await supabaseServer
    .from('institution_members')
    .update({ attempts_used: takenTo - 1 })
    .eq('user_id', member.user_id)
    .eq('institution_id', institution.id)
    .eq('licence_period_start', periodNow)
    .eq('attempts_used', takenTo);

  // Logged, not thrown: the caller is already reporting the real failure.
  if (error) logDbError('release attempt', error);
}

/** Mark an attempt as one the university paid for, or clear the mark. */
export async function setResultInstitution(resultId: string, institutionId: string | null): Promise<void> {
  const { error } = await supabaseServer
    .from('user_results')
    .update({ institution_id: institutionId })
    .eq('id', resultId);
  if (error) {
    logDbError('tag result', error);
    throw error;
  }
}

/**
 * Was this attempt paid for by a university whose licence includes the
 * follow-up roadmap? Read separately from the main row so a missing column
 * (the SQL not run yet) costs a "no" rather than breaking follow-ups for
 * everyone.
 */
export async function resultHasInstitutionFollowup(resultId: string, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseServer
      .from('user_results')
      .select('institution_id')
      .eq('id', resultId)
      .eq('user_id', userId)
      .maybeSingle();
    if (error || !data?.institution_id) {
      if (error) logDbError('read result institution', error);
      return false;
    }
    const institution = await getInstitution(data.institution_id);
    return Boolean(institution?.followup_included);
  } catch (err) {
    console.error('INSTITUTIONS: follow-up check failed:', err);
    return false;
  }
}

/** Ids of this user's attempts that a university paid for, with follow-up included. */
export async function institutionFollowupResultIds(userId: string): Promise<Set<string>> {
  try {
    const { data, error } = await supabaseServer
      .from('user_results')
      .select('id, institution_id')
      .eq('user_id', userId)
      .not('institution_id', 'is', null);
    if (error || !data?.length) {
      if (error) logDbError('read institution results', error);
      return new Set();
    }
    const ids = [...new Set(data.map((r) => r.institution_id as string))];
    const { data: insts, error: instError } = await supabaseServer
      .from('institutions')
      .select('id, followup_included')
      .in('id', ids);
    if (instError) {
      logDbError('read institutions', instError);
      return new Set();
    }
    const included = new Set((insts ?? []).filter((i) => i.followup_included).map((i) => i.id));
    return new Set(data.filter((r) => included.has(r.institution_id as string)).map((r) => r.id));
  } catch (err) {
    console.error('INSTITUTIONS: follow-up ids failed:', err);
    return new Set();
  }
}

/** The institution id a feedback submission should carry, if any. */
export async function memberInstitutionId(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabaseServer
      .from('institution_members')
      .select('institution_id')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) logDbError('member institution', error);
    return (data?.institution_id as string | undefined) ?? null;
  } catch {
    return null;
  }
}

/**
 * The universities whose dashboard this person may open: their verified
 * address must be on the institution's staff list. Unverified accounts get
 * nothing, for the same reason as above.
 */
export async function getStaffInstitutions(user: AuthUser): Promise<{ id: string; name: string; country: string | null }[]> {
  if (!user.email || !isEmailVerified(user)) return [];
  try {
    const { data, error } = await supabaseServer
      .from('institution_staff')
      .select('institution_id, institutions (id, name, country)')
      .eq('email', normaliseEmail(user.email));
    if (error) {
      logDbError('staff lookup', error);
      return [];
    }
    return (data ?? [])
      .map((row) => row.institutions as unknown as { id: string; name: string; country: string | null } | null)
      .filter((i): i is { id: string; name: string; country: string | null } => Boolean(i))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error('INSTITUTIONS: staff lookup failed:', err);
    return [];
  }
}
