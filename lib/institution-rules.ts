// lib/institution-rules.ts
//
// The decisions behind university licences, kept free of any database client so
// they can be tested directly. lib/institutions.ts does the reading and writing
// and asks this module what the answer is.

export type InstitutionLicence = {
  is_active: boolean;
  licence_starts_at: string;
  licence_ends_at: string;
  attempts_per_student: number;
};

export type MemberUsage = {
  licence_period_start: string;
  attempts_used: number;
};

/**
 * Turns whatever an admin typed into the domain we store, or null if it is not a
 * usable domain. Accepts "@esic.edu", "ESIC.EDU " and "student@esic.edu" alike,
 * because all three are what people paste.
 */
export function normaliseDomain(input: string): string | null {
  let d = input.trim().toLowerCase();
  if (d.includes('@')) d = d.slice(d.lastIndexOf('@') + 1);
  d = d.replace(/\.+$/, '');
  if (d.length < 3 || d.length > 253) return null;
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(d) ? d : null;
}

/** The domain half of an email address, lowercased, or null if there is none. */
export function emailDomain(email: string | null | undefined): string | null {
  if (!email) return null;
  const at = email.lastIndexOf('@');
  if (at < 1 || at === email.length - 1) return null;
  return email.slice(at + 1).trim().toLowerCase() || null;
}

/** Normalises an email for matching staff records: trimmed and lowercased. */
export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Is the university's licence in force at `now`?
 *
 * Paused, not yet started, and expired all answer false. The dates are the
 * contract; is_active is the switch for "they have not paid yet" or "stop this
 * now" without editing the contract dates.
 */
export function isLicenceActive(inst: Pick<InstitutionLicence, 'is_active' | 'licence_starts_at' | 'licence_ends_at'>, now: Date = new Date()): boolean {
  if (!inst.is_active) return false;
  const start = Date.parse(inst.licence_starts_at);
  const end = Date.parse(inst.licence_ends_at);
  if (Number.isNaN(start) || Number.isNaN(end)) return false;
  const t = now.getTime();
  return t >= start && t < end;
}

/**
 * Whether the member's usage counter belongs to an earlier licence period.
 *
 * A renewal is recorded by moving licence_starts_at forward. Comparing
 * timestamps rather than strings, because Postgres and JavaScript format the
 * same instant differently.
 */
export function isNewPeriod(inst: Pick<InstitutionLicence, 'licence_starts_at'>, member: Pick<MemberUsage, 'licence_period_start'>): boolean {
  return Date.parse(inst.licence_starts_at) !== Date.parse(member.licence_period_start);
}

/**
 * How many university-paid attempts the student has left right now.
 *
 * A member whose counter is from a previous period has the full allowance: the
 * reset itself happens when the next attempt is reserved.
 */
export function licenceAttemptsRemaining(inst: InstitutionLicence, member: MemberUsage, now: Date = new Date()): number {
  if (!isLicenceActive(inst, now)) return 0;
  const used = isNewPeriod(inst, member) ? 0 : member.attempts_used;
  return Math.max(0, inst.attempts_per_student - used);
}

// ── Licence dates ─────────────────────────────────────────────────────────
//
// The admin form works in whole days ("1 Oct 2026 to 30 Sep 2027"); the
// database stores instants. The licence runs from the start of the first day
// to the END of the last day, so the stored end is midnight (UTC) after it and
// isLicenceActive compares with "<". These four functions are the only place
// that conversion happens, so the two can never disagree.

const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_INPUT = /^\d{4}-\d{2}-\d{2}$/;

/** "2026-10-01" → "2026-10-01T00:00:00.000Z", or null if not a real date. */
export function licenceStartFromDateInput(date: string): string | null {
  if (!DATE_INPUT.test(date)) return null;
  const t = Date.parse(`${date}T00:00:00.000Z`);
  if (Number.isNaN(t) || new Date(t).toISOString().slice(0, 10) !== date) return null;
  return new Date(t).toISOString();
}

/** "2027-09-30" → "2027-10-01T00:00:00.000Z": the instant the last day ends. */
export function licenceEndFromDateInput(date: string): string | null {
  const start = licenceStartFromDateInput(date);
  return start ? new Date(Date.parse(start) + DAY_MS).toISOString() : null;
}

/** Stored start → the date the admin form shows. */
export function dateInputFromLicenceStart(iso: string): string {
  return new Date(Date.parse(iso)).toISOString().slice(0, 10);
}

/** Stored end → the last day of the licence, as the admin form shows it. */
export function dateInputFromLicenceEnd(iso: string): string {
  return new Date(Date.parse(iso) - DAY_MS).toISOString().slice(0, 10);
}

/** Where the licence stands, for the admin list. */
export function licenceStatus(
  inst: Pick<InstitutionLicence, 'is_active' | 'licence_starts_at' | 'licence_ends_at'>,
  now: Date = new Date()
): 'active' | 'paused' | 'not_started' | 'expired' {
  if (!inst.is_active) return 'paused';
  const t = now.getTime();
  if (t < Date.parse(inst.licence_starts_at)) return 'not_started';
  if (t >= Date.parse(inst.licence_ends_at)) return 'expired';
  return 'active';
}

// ── Dashboard aggregation ─────────────────────────────────────────────────
//
// The university sees totals, never a person. MIN_GROUP_SIZE is the smallest
// group any breakdown may show: below it, a count can point at an individual
// ("the one student who picked Healthcare"), so it is folded into "other" or
// withheld. The headline totals are shown regardless — "12 students joined" is
// not about anyone in particular.

export const MIN_GROUP_SIZE = 5;

export type ResultForSummary = {
  user_id: string;
  created_at: string;
  top_clusters: { cluster: string; percentage: number }[] | null;
  has_main_report: boolean;
  has_followup_report: boolean;
};

export type InstitutionSummary = {
  membersJoined: number;
  studentsWithResults: number;
  reportsGenerated: number;
  roadmapsGenerated: number;
  /** Null when fewer than MIN_GROUP_SIZE students have a report. */
  topCareerAreas: { cluster: string; students: number }[] | null;
  /** Students whose top area was in a group too small to show on its own. */
  otherCareerAreasStudents: number;
  /** Reports per month, oldest first. Months under the threshold show null. */
  reportsByMonth: { month: string; reports: number | null }[];
  /** Average 1–5 rating, or null when fewer than MIN_GROUP_SIZE ratings. */
  averageRating: number | null;
  ratingsCount: number;
  minGroupSize: number;
};

export function summariseInstitution(input: {
  membersJoined: number;
  results: ResultForSummary[];
  ratings: number[];
  minGroupSize?: number;
}): InstitutionSummary {
  const k = input.minGroupSize ?? MIN_GROUP_SIZE;
  const withReport = input.results.filter((r) => r.has_main_report);

  // Each student counted once, by the top area of their most recent report.
  const latestByStudent = new Map<string, ResultForSummary>();
  for (const r of withReport) {
    const prev = latestByStudent.get(r.user_id);
    if (!prev || Date.parse(r.created_at) > Date.parse(prev.created_at)) {
      latestByStudent.set(r.user_id, r);
    }
  }

  let topCareerAreas: InstitutionSummary['topCareerAreas'] = null;
  let otherCareerAreasStudents = 0;
  if (latestByStudent.size >= k) {
    const counts = new Map<string, number>();
    for (const r of latestByStudent.values()) {
      const top = r.top_clusters?.[0]?.cluster;
      if (!top) continue;
      counts.set(top, (counts.get(top) ?? 0) + 1);
    }
    topCareerAreas = [];
    for (const [cluster, students] of counts) {
      if (students >= k) topCareerAreas.push({ cluster, students });
      else otherCareerAreasStudents += students;
    }
    topCareerAreas.sort((a, b) => b.students - a.students || a.cluster.localeCompare(b.cluster));
  }

  const monthCounts = new Map<string, number>();
  for (const r of withReport) {
    const month = r.created_at.slice(0, 7); // YYYY-MM
    monthCounts.set(month, (monthCounts.get(month) ?? 0) + 1);
  }
  const reportsByMonth = [...monthCounts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, reports]) => ({ month, reports: reports >= k ? reports : null }));

  const ratings = input.ratings.filter((n) => Number.isInteger(n) && n >= 1 && n <= 5);
  const averageRating =
    ratings.length >= k
      ? Math.round((ratings.reduce((s, n) => s + n, 0) / ratings.length) * 10) / 10
      : null;

  return {
    membersJoined: input.membersJoined,
    studentsWithResults: latestByStudent.size,
    reportsGenerated: withReport.length,
    roadmapsGenerated: input.results.filter((r) => r.has_followup_report).length,
    topCareerAreas,
    otherCareerAreasStudents,
    reportsByMonth,
    averageRating,
    ratingsCount: ratings.length,
    minGroupSize: k,
  };
}
