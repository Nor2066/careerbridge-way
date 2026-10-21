import { describe, it, expect } from 'vitest';
import { formatPercent } from '@/lib/i18n/format';

describe('formatPercent', () => {
  it('writes scores the way each language does', () => {
    expect(formatPercent(53.6, 'en')).toBe('53.6%');
    // Spanish uses a decimal comma and a (non-breaking) space before the sign.
    expect(formatPercent(53.6, 'es').replace(/\s/g, ' ')).toBe('53,6 %');
  });

  it('drops a trailing zero rather than printing "78.0%"', () => {
    expect(formatPercent(78, 'en')).toBe('78%');
  });
});
