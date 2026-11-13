import { describe, it, expect } from 'vitest';
import {
  inactivityAction,
  inactivityCutoff,
  deletionDate,
  activityTouchThreshold,
  holdsAttempts,
  INACTIVE_NOTICE_AFTER_DAYS,
  INACTIVE_DELETE_AFTER_NOTICE_DAYS,
  AUDIT_LOG_RETENTION_DAYS,
} from '@/lib/retention-rules';
import { RETENTION } from '@/lib/legal';

// These decide whether somebody's account is deleted without them asking, so
// every edge is pinned, and every doubtful case must come out as "leave it".

const NOW = new Date('2030-06-01T00:00:00Z');
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000).toISOString();
const FOUR_YEARS = 1461;

describe('inactivityAction', () => {
  it('leaves an account that was used within four years', () => {
    expect(inactivityAction({ lastActiveAt: daysAgo(1), noticeSentAt: null, role: null, now: NOW })).toBe('none');
    expect(inactivityAction({ lastActiveAt: daysAgo(730), noticeSentAt: null, role: null, now: NOW })).toBe('none');
    expect(inactivityAction({ lastActiveAt: daysAgo(FOUR_YEARS - 1), noticeSentAt: null, role: null, now: NOW })).toBe('none');
  });

  it('asks for a notice at four years exactly', () => {
    expect(inactivityAction({ lastActiveAt: daysAgo(FOUR_YEARS), noticeSentAt: null, role: null, now: NOW })).toBe('notify');
    expect(inactivityAction({ lastActiveAt: daysAgo(1600), noticeSentAt: null, role: 'viewer', now: NOW })).toBe('notify');
  });

  it('waits out the three months after the notice', () => {
    expect(inactivityAction({ lastActiveAt: daysAgo(1500), noticeSentAt: daysAgo(1), role: null, now: NOW })).toBe('wait');
    expect(inactivityAction({ lastActiveAt: daysAgo(1500), noticeSentAt: daysAgo(89), role: null, now: NOW })).toBe('wait');
  });

  it('deletes only once the three months are up', () => {
    expect(inactivityAction({ lastActiveAt: daysAgo(1600), noticeSentAt: daysAgo(90), role: null, now: NOW })).toBe('delete');
  });

  it('never deletes without a notice, however old the account', () => {
    expect(inactivityAction({ lastActiveAt: daysAgo(5000), noticeSentAt: null, role: null, now: NOW })).toBe('notify');
  });

  it('treats a notice from before the last use as void', () => {
    // Warned, came back, drifted away again: owed a fresh warning, not deletion
    // on the strength of the old one.
    expect(inactivityAction({ lastActiveAt: daysAgo(1470), noticeSentAt: daysAgo(2500), role: null, now: NOW })).toBe('notify');
  });

  it('is cancelled by using the account after the notice', () => {
    expect(inactivityAction({ lastActiveAt: daysAgo(10), noticeSentAt: daysAgo(60), role: null, now: NOW })).toBe('none');
    expect(inactivityAction({ lastActiveAt: daysAgo(10), noticeSentAt: daysAgo(200), role: null, now: NOW })).toBe('none');
  });

  it('never touches an administrator', () => {
    expect(inactivityAction({ lastActiveAt: daysAgo(5000), noticeSentAt: daysAgo(4000), role: 'superadmin', now: NOW })).toBe('exempt');
    expect(inactivityAction({ lastActiveAt: daysAgo(5000), noticeSentAt: null, role: 'admin', now: NOW })).toBe('exempt');
  });

  it('never touches an account that holds an attempt, however long it has been idle', () => {
    expect(inactivityAction({ lastActiveAt: daysAgo(5000), noticeSentAt: null, role: null, holdsAttempts: true, now: NOW })).toBe('keep');
    expect(inactivityAction({ lastActiveAt: daysAgo(5000), noticeSentAt: daysAgo(400), role: null, holdsAttempts: true, now: NOW })).toBe('keep');
  });

  it('leaves an account alone when it cannot tell when it was last used', () => {
    expect(inactivityAction({ lastActiveAt: null, noticeSentAt: daysAgo(400), role: null, now: NOW })).toBe('none');
    expect(inactivityAction({ lastActiveAt: undefined, noticeSentAt: null, role: null, now: NOW })).toBe('none');
    expect(inactivityAction({ lastActiveAt: 'not a date', noticeSentAt: daysAgo(400), role: null, now: NOW })).toBe('none');
  });

  it('asks for a fresh notice when the stored one is unreadable', () => {
    expect(inactivityAction({ lastActiveAt: daysAgo(1600), noticeSentAt: 'garbage', role: null, now: NOW })).toBe('notify');
  });
});

describe('holdsAttempts', () => {
  const nothing = { mainAttemptsRemaining: 0, followupCredits: 0, unusedFollowupUnlocks: 0, attemptStatus: 'none' };

  it('is false only when nothing at all is left', () => {
    expect(holdsAttempts(nothing)).toBe(false);
  });

  it('keeps an account with an attempt bought and not used', () => {
    expect(holdsAttempts({ ...nothing, mainAttemptsRemaining: 1 })).toBe(true);
    expect(holdsAttempts({ ...nothing, followupCredits: 2 })).toBe(true);
    expect(holdsAttempts({ ...nothing, unusedFollowupUnlocks: 1 })).toBe(true);
  });

  it('keeps an account with an attempt started and not finished', () => {
    expect(holdsAttempts({ ...nothing, attemptStatus: 'in_progress' })).toBe(true);
    expect(holdsAttempts({ ...nothing, attemptStatus: 'awaiting_followup_decision' })).toBe(true);
  });

  it('keeps an account whose holdings cannot be read', () => {
    expect(holdsAttempts(null)).toBe(true);
    expect(holdsAttempts(undefined)).toBe(true);
  });
});

describe('the dates around it', () => {
  it('puts the cutoff four years back and the deletion three months on', () => {
    expect(inactivityCutoff(NOW).toISOString()).toBe(daysAgo(FOUR_YEARS));
    expect(deletionDate(NOW).getTime() - NOW.getTime()).toBe(90 * 86_400_000);
  });

  it('moves "last used" at most once a day', () => {
    expect(NOW.getTime() - activityTouchThreshold(NOW).getTime()).toBe(86_400_000);
  });
});

describe('the periods the privacy policy states', () => {
  // The policy is prose; these catch someone changing a number in one place.
  it('match the numbers the job uses', () => {
    expect(INACTIVE_NOTICE_AFTER_DAYS).toBe(FOUR_YEARS);
    expect(INACTIVE_DELETE_AFTER_NOTICE_DAYS).toBe(90);
    expect(AUDIT_LOG_RETENTION_DAYS).toBe(730);

    const account = RETENTION.find((r) => r.what === 'Your account and assessment results');
    expect(account?.how_long).toMatch(/four years/);
    expect(account?.how_long).toMatch(/three months/);
    expect(account?.how_long).toMatch(/never delete/i);

    const audit = RETENTION.find((r) => r.what.includes('administrators'));
    expect(audit?.how_long).toBe('2 years');
  });
});
