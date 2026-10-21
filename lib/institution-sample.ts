// lib/institution-sample.ts
//
// Invented numbers for /university/sample, the dashboard a careers team sees
// once around 200 students have used ADAQNO. A pilot with a handful of
// students shows "< 5" everywhere (the five-student rule), which tells a
// prospective university nothing, so the pitch shows this instead.
//
// The figures agree with each other the way real ones would: the career
// areas add up to the students with a report, and the months add up to the
// reports. Dates follow the current academic year so the page never looks
// stale.

import { MIN_GROUP_SIZE, type InstitutionSummary } from '@/lib/institution-rules';

const STUDENTS_WITH_REPORT = 187;
const REPORTS = 243;

const AREAS: { cluster: string; students: number }[] = [
  { cluster: 'Business', students: 46 },
  { cluster: 'Sales', students: 31 },
  { cluster: 'Entrepreneurship', students: 27 },
  { cluster: 'Analytical', students: 22 },
  { cluster: 'IT', students: 18 },
  { cluster: 'Creative', students: 15 },
  { cluster: 'Hospitality', students: 11 },
];

/** Relative activity per month of the academic year, September first. */
const MONTH_WEIGHTS = [38, 97, 108, 64, 52, 71, 88, 45, 20, 12, 6, 4];

export type SampleDashboard = {
  licence: {
    start: string;
    end: string;
    status: 'active';
    attemptsPerStudent: number;
    followupIncluded: boolean;
  };
  summary: InstitutionSummary;
  generatedAt: string;
};

function isoDate(y: number, m: number, d: number): string {
  return new Date(Date.UTC(y, m, d)).toISOString().slice(0, 10);
}

/** Split `total` across `weights`, rounding so the parts still add up. */
export function distribute(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (w / sum) * total);
  const parts = raw.map(Math.floor);
  let left = total - parts.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => [r - Math.floor(r), i] as const).sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) {
    if (left <= 0) break;
    parts[i] += 1;
    left -= 1;
  }
  return parts;
}

export function buildSampleDashboard(now: Date = new Date()): SampleDashboard {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth(); // 0 = January
  const startYear = month >= 8 ? year : year - 1; // academic year starts in September

  // September up to and including the current month: never a month that has
  // not happened yet.
  const monthsSoFar = Math.min(12, (year - startYear) * 12 + month - 8 + 1);
  const counts = distribute(REPORTS, MONTH_WEIGHTS.slice(0, monthsSoFar));
  const reportsByMonth = counts.map((reports, i) => {
    const d = new Date(Date.UTC(startYear, 8 + i, 1));
    return { month: d.toISOString().slice(0, 7), reports };
  });

  const shown = AREAS.reduce((a, b) => a + b.students, 0);

  return {
    licence: {
      start: isoDate(startYear, 8, 1),
      end: isoDate(startYear + 1, 7, 31),
      status: 'active',
      attemptsPerStudent: 2,
      followupIncluded: true,
    },
    summary: {
      membersJoined: 214,
      studentsWithResults: STUDENTS_WITH_REPORT,
      reportsGenerated: REPORTS,
      roadmapsGenerated: 131,
      topCareerAreas: AREAS,
      otherCareerAreasStudents: STUDENTS_WITH_REPORT - shown,
      reportsByMonth,
      averageRating: 4.3,
      ratingsCount: 96,
      minGroupSize: MIN_GROUP_SIZE,
    },
    generatedAt: now.toISOString(),
  };
}
