import { describe, it, expect } from 'vitest';
import { buildSampleDashboard, distribute } from '@/lib/institution-sample';
import { CLUSTER_LABELS } from '@/lib/i18n/options';

// The sample dashboard is shown to universities as "what you'd see". Numbers
// that contradict each other would undermine the pitch.

describe('distribute', () => {
  it('keeps the total exact after rounding', () => {
    expect(distribute(243, [38, 97]).reduce((a, b) => a + b, 0)).toBe(243);
    expect(distribute(10, [1, 1, 1]).reduce((a, b) => a + b, 0)).toBe(10);
  });
});

describe('buildSampleDashboard', () => {
  it('adds up like a real dashboard would', () => {
    const { summary } = buildSampleDashboard(new Date('2026-10-21T12:00:00Z'));
    const areas = summary.topCareerAreas!.reduce((a, b) => a + b.students, 0);
    expect(areas + (summary.otherCareerAreasStudents ?? 0)).toBe(summary.studentsWithResults);
    expect(summary.reportsByMonth.reduce((a, b) => a + (b.reports ?? 0), 0)).toBe(summary.reportsGenerated);
    expect(summary.studentsWithResults!).toBeLessThanOrEqual(summary.membersJoined!);
    // Every shown group is at least the five-student minimum.
    for (const a of summary.topCareerAreas!) expect(a.students).toBeGreaterThanOrEqual(summary.minGroupSize);
  });

  it('uses career areas the dashboard can translate', () => {
    const { summary } = buildSampleDashboard();
    for (const a of summary.topCareerAreas!) expect(Object.keys(CLUSTER_LABELS)).toContain(a.cluster);
  });

  it('follows the academic year it is viewed in', () => {
    const october = buildSampleDashboard(new Date('2026-10-21T12:00:00Z'));
    expect(october.licence).toMatchObject({ start: '2026-09-01', end: '2027-08-31' });
    expect(october.summary.reportsByMonth.map((m) => m.month)).toEqual(['2026-09', '2026-10']);

    const march = buildSampleDashboard(new Date('2027-03-05T12:00:00Z'));
    expect(march.licence.start).toBe('2026-09-01');
    expect(march.summary.reportsByMonth.map((m) => m.month)).toEqual([
      '2026-09', '2026-10', '2026-11', '2026-12', '2027-01', '2027-02', '2027-03',
    ]);

    // At the start of the year it shows only the month that has begun.
    expect(buildSampleDashboard(new Date('2026-09-02T12:00:00Z')).summary.reportsByMonth.map((m) => m.month)).toEqual(['2026-09']);
    // In August, the last month of the academic year, all twelve.
    expect(buildSampleDashboard(new Date('2027-08-15T12:00:00Z')).summary.reportsByMonth).toHaveLength(12);
  });
});
