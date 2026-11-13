import { describe, expect, it } from 'vitest';
import { CONCILIATION_BOARDS, LAST_UPDATED, RETENTION, SUBPROCESSORS } from '@/lib/legal';
import {
  RETENTION_ES,
  SUBPROCESSORS_ES,
  boardCoversEs,
  retentionEs,
  subprocessorsEs,
  toSpanishDate,
} from '@/lib/legal-es';

describe('Spanish legal data', () => {
  it('has a Spanish twin for every subprocessor', () => {
    for (const s of SUBPROCESSORS) expect(SUBPROCESSORS_ES[s.name], s.name).toBeDefined();
    expect(subprocessorsEs().map((s) => s.name)).toEqual(SUBPROCESSORS.map((s) => s.name));
  });

  it('has a Spanish twin for every retention row', () => {
    for (const r of RETENTION) expect(RETENTION_ES[r.what], r.what).toBeDefined();
    expect(retentionEs()).toHaveLength(RETENTION.length);
  });

  it('turns every last-updated date into Spanish', () => {
    for (const date of Object.values(LAST_UPDATED)) {
      expect(toSpanishDate(date)).toMatch(/^\d{1,2} de [a-z]+ de \d{4}$/);
    }
    expect(toSpanishDate('11 November 2026')).toBe('11 de noviembre de 2026');
    expect(toSpanishDate('not a date')).toBe('not a date');
  });

  it('says what each conciliation board covers in Spanish', () => {
    expect(boardCoversEs('Pest county')).toBe('condado de Pest');
    expect(boardCoversEs('Baranya, Somogy and Tolna')).toBe('Baranya, Somogy y Tolna');
    for (const b of CONCILIATION_BOARDS) expect(boardCoversEs(b.covers)).not.toMatch(/ and |county/);
  });
});
