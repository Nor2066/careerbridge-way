import { describe, it, expect } from 'vitest';
import { AUDIT_LOG_RETENTION_DAYS } from '@/lib/retention-rules';
import { RETENTION } from '@/lib/legal';
import { RETENTION_ES } from '@/lib/legal-es';

// The policy is prose; these catch someone changing a period in one place only.

describe('the periods the privacy policy states', () => {
  it('keeps the administrator log for two years, as the policy says', () => {
    expect(AUDIT_LOG_RETENTION_DAYS).toBe(730);
    const audit = RETENTION.find((r) => r.what.includes('administrators'));
    expect(audit?.how_long).toBe('2 years');
  });

  it('keeps an account until its owner deletes it, and says so in both languages', () => {
    const account = RETENTION.find((r) => r.what === 'Your account and assessment results');
    expect(account?.how_long).toMatch(/until you delete your account/i);
    expect(account?.how_long).toMatch(/never delete an account because it has not been used/i);
    expect(account?.how_long).not.toMatch(/years/);

    const es = RETENTION_ES['Your account and assessment results'];
    expect(es.how_long).toMatch(/hasta que elimines tu cuenta/i);
    expect(es.how_long).toMatch(/nunca eliminamos una cuenta/i);
    expect(es.how_long).not.toMatch(/años/);
  });
});
