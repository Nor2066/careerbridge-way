import { describe, it, expect } from 'vitest';
import {
  inactivityAction,
  inactivityCutoff,
  deletionDate,
  activityTouchThreshold,
  INACTIVE_NOTICE_AFTER_DAYS,
  INACTIVE_DELETE_AFTER_NOTICE_DAYS,
  AUDIT_LOG_RETENTION_DAYS,
} from '@/lib/retention-rules';
import { RETENTION } from '@/lib/legal';

// These decide whether somebody's account is deleted without them asking, so
// every edge is pinned, and every doubtful case must come out as "leave it".

const NOW = new Date('2030-06-01T00:00:00Z');
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000).toISOString();

describe('inactivityAction', () => {
  it('leaves an account that was used within two years', () => {
    expect(inactivityAction({ lastActiveAt: daysAgo(1), noticeSentAt: null, role: null, now: NOW })).toBe('none');
    expect(inactivityAction({ lastActiveAt: daysAgo(729), noticeSentAt: null, role: null, now: NOW })).toBe('none');
  });

  it('asks for a notice at two years exactly', () => {
    expect(inactivityAction({ lastActiveAt: daysAgo(730), noticeSentAt: null, role: null, now: NOW })).toBe('notify');
    expect(inactivityAction({ lastActiveAt: daysAgo(900), noticeSentAt: null, role: 'viewer', now: NOW })).toBe('notify');
  });

  it('waits out the three months after the notice', () => {
    expect(inactivityAction({ lastActiveAt: daysAgo(800), noticeSentAt: daysAgo(1), role: null, now: NOW })).toBe('wait');
    expect(inactivityAction({ lastActiveAt: daysAgo(800), noticeSentAt: daysAgo(89), role: null, now: NOW })).toBe('wait');
  });

  it('deletes only once the three months are up', () => {
    expect(inactivityAction({ lastActiveAt: daysAgo(900), noticeSentAt: daysAgo(90), role: null, now: NOW })).toBe('delete');
  });

  it('never deletes without a notice, however old the account', () => {
    expect(inactivityAction({ lastActiveAt: daysAgo(5000), noticeSentAt: null, role: null, now: NOW })).toBe('notify');
  });

  it('treats a notice from before the last use as void', () => {
    // Warned, came back, drifted away again: owed a fresh warning, not deletion
    // on the strength of the old one.
    expect(inactivityAction({ lastActiveAt: daysAgo(740), noticeSentAt: daysAgo(1500), role: null, now: NOW })).toBe('notify');
  });

  it('is cancelled by using the account after the notice', () => {
    expect(inactivityAction({ lastActiveAt: daysAgo(10), noticeSentAt: daysAgo(60), role: null, now: NOW })).toBe('none');
    expect(inactivityAction({ lastActiveAt: daysAgo(10), noticeSentAt: daysAgo(200), role: null, now: NOW })).toBe('none');
  });

  it('never touches an administrator', () => {
    expect(inactivityAction({ lastActiveAt: daysAgo(5000), noticeSentAt: daysAgo(4000), role: 'superadmin', now: NOW })).toBe('exempt');
    expect(inactivityAction({ lastActiveAt: daysAgo(5000), noticeSentAt: null, role: 'admin', now: NOW })).toBe('exempt');
  });

  it('leaves an account alone when it cannot tell when it was last used', () => {
    expect(inactivityAction({ lastActiveAt: null, noticeSentAt: daysAgo(400), role: null, now: NOW })).toBe('none');
    expect(inactivityAction({ lastActiveAt: undefined, noticeSentAt: null, role: null, now: NOW })).toBe('none');
    expect(inactivityAction({ lastActiveAt: 'not a date', noticeSentAt: daysAgo(400), role: null, now: NOW })).toBe('none');
  });

  it('asks for a fresh notice when the stored one is unreadable', () => {
    expect(inactivityAction({ lastActiveAt: daysAgo(900), noticeSentAt: 'garbage', role: null, now: NOW })).toBe('notify');
  });
});

describe('the dates around it', () => {
  it('puts the cutoff two years back and the deletion three months on', () => {
    expect(inactivityCutoff(NOW).toISOString()).toBe(daysAgo(730));
    expect(deletionDate(NOW).getTime() - NOW.getTime()).toBe(90 * 86_400_000);
  });

  it('moves "last used" at most once a day', () => {
    expect(NOW.getTime() - activityTouchThreshold(NOW).getTime()).toBe(86_400_000);
  });
});

describe('the periods the privacy policy states', () => {
  // The policy is prose; these catch someone changing a number in one place.
  it('match the numbers the job uses', () => {
    expect(INACTIVE_NOTICE_AFTER_DAYS).toBe(730);
    expect(INACTIVE_DELETE_AFTER_NOTICE_DAYS).toBe(90);
    expect(AUDIT_LOG_RETENTION_DAYS).toBe(730);

    const account = RETENTION.find((r) => r.what === 'Your account and assessment results');
    expect(account?.how_long).toMatch(/two years/);
    expect(account?.how_long).toMatch(/three months/);

    const audit = RETENTION.find((r) => r.what.includes('administrators'));
    expect(audit?.how_long).toBe('2 years');
  });
});
