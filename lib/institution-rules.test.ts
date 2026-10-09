import { describe, it, expect } from 'vitest';
import {
  normaliseDomain,
  emailDomain,
  isLicenceActive,
  isNewPeriod,
  licenceAttemptsRemaining,
  licenceStartFromDateInput,
  licenceEndFromDateInput,
  dateInputFromLicenceStart,
  dateInputFromLicenceEnd,
  licenceStatus,
  summariseInstitution,
  MIN_GROUP_SIZE,
  type ResultForSummary,
} from '@/lib/institution-rules';

describe('email domains', () => {
  it('accepts what admins actually paste', () => {
    expect(normaliseDomain('alumnos.esic.edu')).toBe('alumnos.esic.edu');
    expect(normaliseDomain('  ESIC.EDU ')).toBe('esic.edu');
    expect(normaliseDomain('@esic.edu')).toBe('esic.edu');
    expect(normaliseDomain('someone@esic.edu')).toBe('esic.edu');
    expect(normaliseDomain('esic.edu.')).toBe('esic.edu');
  });

  it('rejects things that are not domains', () => {
    expect(normaliseDomain('esic')).toBeNull();
    expect(normaliseDomain('')).toBeNull();
    expect(normaliseDomain('esic .edu')).toBeNull();
    expect(normaliseDomain('-esic.edu')).toBeNull();
    expect(normaliseDomain('https://esic.edu')).toBeNull();
  });

  it('reads the domain of an email, case-insensitively', () => {
    expect(emailDomain('Ana.Garcia@Alumnos.ESIC.edu')).toBe('alumnos.esic.edu');
    expect(emailDomain('no-at-sign')).toBeNull();
    expect(emailDomain('trailing@')).toBeNull();
    expect(emailDomain(null)).toBeNull();
  });
});

describe('licence dates', () => {
  it('runs from the start of the first day to the end of the last', () => {
    expect(licenceStartFromDateInput('2026-10-01')).toBe('2026-10-01T00:00:00.000Z');
    expect(licenceEndFromDateInput('2027-09-30')).toBe('2027-10-01T00:00:00.000Z');
  });

  it('round-trips through the admin form', () => {
    const start = licenceStartFromDateInput('2026-10-01')!;
    const end = licenceEndFromDateInput('2027-09-30')!;
    expect(dateInputFromLicenceStart(start)).toBe('2026-10-01');
    expect(dateInputFromLicenceEnd(end)).toBe('2027-09-30');
  });

  it('rejects dates that do not exist', () => {
    expect(licenceStartFromDateInput('2026-02-30')).toBeNull();
    expect(licenceStartFromDateInput('01/10/2026')).toBeNull();
  });
});

const licence = {
  is_active: true,
  licence_starts_at: '2026-10-01T00:00:00.000Z',
  licence_ends_at: '2027-10-01T00:00:00.000Z',
  attempts_per_student: 2,
};

describe('whether a licence is in force', () => {
  it('is active between the dates', () => {
    expect(isLicenceActive(licence, new Date('2026-10-01T00:00:00Z'))).toBe(true);
    expect(isLicenceActive(licence, new Date('2027-09-30T23:59:59Z'))).toBe(true);
  });

  it('is not active before it starts, after it ends, or while paused', () => {
    expect(isLicenceActive(licence, new Date('2026-09-30T23:59:59Z'))).toBe(false);
    expect(isLicenceActive(licence, new Date('2027-10-01T00:00:00Z'))).toBe(false);
    expect(isLicenceActive({ ...licence, is_active: false }, new Date('2027-01-01T00:00:00Z'))).toBe(false);
  });

  it('labels each case for the admin list', () => {
    expect(licenceStatus(licence, new Date('2027-01-01T00:00:00Z'))).toBe('active');
    expect(licenceStatus(licence, new Date('2026-01-01T00:00:00Z'))).toBe('not_started');
    expect(licenceStatus(licence, new Date('2028-01-01T00:00:00Z'))).toBe('expired');
    expect(licenceStatus({ ...licence, is_active: false })).toBe('paused');
  });
});

describe('attempts a student has left', () => {
  const during = new Date('2027-01-01T00:00:00Z');

  it('counts down the allowance', () => {
    const member = { licence_period_start: licence.licence_starts_at, attempts_used: 1 };
    expect(licenceAttemptsRemaining(licence, member, during)).toBe(1);
    expect(licenceAttemptsRemaining(licence, { ...member, attempts_used: 2 }, during)).toBe(0);
    expect(licenceAttemptsRemaining(licence, { ...member, attempts_used: 5 }, during)).toBe(0);
  });

  it('gives nothing once the licence has lapsed', () => {
    const member = { licence_period_start: licence.licence_starts_at, attempts_used: 0 };
    expect(licenceAttemptsRemaining(licence, member, new Date('2028-01-01T00:00:00Z'))).toBe(0);
  });

  // A renewal moves the start date. Usage from last year must not eat into
  // this year's allowance.
  it('resets the allowance when the licence is renewed', () => {
    const renewed = { ...licence, licence_starts_at: '2027-10-01T00:00:00.000Z', licence_ends_at: '2028-10-01T00:00:00.000Z' };
    const lastYear = { licence_period_start: licence.licence_starts_at, attempts_used: 2 };
    expect(isNewPeriod(renewed, lastYear)).toBe(true);
    expect(licenceAttemptsRemaining(renewed, lastYear, new Date('2027-11-01T00:00:00Z'))).toBe(2);
  });

  it('treats the same instant written differently as the same period', () => {
    expect(isNewPeriod(licence, { licence_period_start: '2026-10-01T00:00:00+00:00' })).toBe(false);
  });
});

describe('the university dashboard summary', () => {
  const result = (user: string, cluster: string, createdAt: string, extra: Partial<ResultForSummary> = {}): ResultForSummary => ({
    user_id: user,
    created_at: createdAt,
    top_clusters: [{ cluster, percentage: 70 }],
    has_main_report: true,
    has_followup_report: false,
    ...extra,
  });

  it('shows nothing broken down until enough students have a report', () => {
    const results = ['a', 'b', 'c', 'd'].map((u) => result(u, 'Business', '2026-10-05T10:00:00Z'));
    const s = summariseInstitution({ membersJoined: 4, results, ratings: [5, 4] });
    expect(s.studentsWithResults).toBe(4);
    expect(s.topCareerAreas).toBeNull();
    expect(s.averageRating).toBeNull();
    // Headline totals are not about any one person, so they always show.
    expect(s.membersJoined).toBe(4);
    expect(s.reportsGenerated).toBe(4);
  });

  // The rule that protects students: an area with fewer than five people in
  // it could point at someone, so it is folded into "other".
  it('folds small groups into "other"', () => {
    const results = [
      ...['a', 'b', 'c', 'd', 'e'].map((u) => result(u, 'Business', '2026-10-05T10:00:00Z')),
      ...['f', 'g'].map((u) => result(u, 'Healthcare', '2026-10-06T10:00:00Z')),
    ];
    const s = summariseInstitution({ membersJoined: 9, results, ratings: [] });
    expect(s.topCareerAreas).toEqual([{ cluster: 'Business', students: 5 }]);
    expect(s.otherCareerAreasStudents).toBe(2);
  });

  it('counts each student once, by their most recent report', () => {
    const results = [
      ...['a', 'b', 'c', 'd', 'e'].map((u) => result(u, 'Business', '2026-10-05T10:00:00Z')),
      // Student "a" took it again later and came out differently.
      result('a', 'Healthcare', '2026-11-01T10:00:00Z'),
    ];
    const s = summariseInstitution({ membersJoined: 5, results, ratings: [] });
    expect(s.studentsWithResults).toBe(5);
    expect(s.reportsGenerated).toBe(6);
    // Business is now four students and Healthcare one: both under the
    // threshold, so all five land in "other".
    expect(MIN_GROUP_SIZE).toBe(5);
    expect(s.topCareerAreas).toEqual([]);
    expect(s.otherCareerAreasStudents).toBe(5);
  });

  it('hides small months and small rating groups', () => {
    const results = [
      ...['a', 'b', 'c', 'd', 'e'].map((u) => result(u, 'IT', '2026-10-05T10:00:00Z')),
      result('f', 'IT', '2026-11-02T10:00:00Z'),
    ];
    const s = summariseInstitution({ membersJoined: 6, results, ratings: [5, 4, 4, 3, 5] });
    expect(s.reportsByMonth).toEqual([
      { month: '2026-10', reports: 5 },
      { month: '2026-11', reports: null },
    ]);
    expect(s.averageRating).toBe(4.2);
  });

  it('ignores attempts that never produced a report', () => {
    const results = [result('a', 'IT', '2026-10-05T10:00:00Z', { has_main_report: false })];
    const s = summariseInstitution({ membersJoined: 1, results, ratings: [] });
    expect(s.studentsWithResults).toBe(0);
    expect(s.reportsGenerated).toBe(0);
  });
});
