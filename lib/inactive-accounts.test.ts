import { describe, it, expect } from 'vitest';
import {
  runInactiveAccountJob,
  type InactiveAccountDeps,
  type InactiveAccountRow,
} from '@/lib/inactive-accounts';

// The whole job against a fake database and a fake mail provider. What it
// must never do is delete an account that was not warned, or was used again.

const NOW = new Date('2030-06-01T00:00:00Z');
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000).toISOString();

function row(id: string, over: Partial<InactiveAccountRow> = {}): InactiveAccountRow {
  return { id, email: `${id}@example.com`, role: null, last_active_at: daysAgo(800), inactivity_notice_sent_at: null, ...over };
}

function fake(rows: InactiveAccountRow[], options: { ready?: boolean; sendOk?: boolean; deleteOk?: boolean; authEmail?: string | null } = {}) {
  const store = new Map(rows.map((r) => [r.id, { ...r }]));
  const log = { sent: [] as { to: string; deleteOn: string }[], deleted: [] as string[], audited: [] as { event: string; details: Record<string, unknown> }[] };

  const deps: InactiveAccountDeps = {
    async listCandidates(cutoffIso) {
      if (options.ready === false) return { ready: false, rows: [] };
      const due = [...store.values()].filter((r) => r.last_active_at !== null && r.last_active_at < cutoffIso);
      return { ready: true, rows: due.map((r) => ({ ...r })) };
    },
    async reload(id) {
      const r = store.get(id);
      return r ? { ...r } : null;
    },
    async emailFor() {
      return options.authEmail ?? null;
    },
    async claimNotice(id, previous, nowIso) {
      const r = store.get(id);
      if (!r || r.inactivity_notice_sent_at !== previous) return false;
      r.inactivity_notice_sent_at = nowIso;
      return true;
    },
    async releaseNotice(id, previous) {
      const r = store.get(id);
      if (r) r.inactivity_notice_sent_at = previous;
    },
    async sendNotice(to, deleteOn) {
      if (options.sendOk === false) return false;
      log.sent.push({ to, deleteOn: deleteOn.toISOString() });
      return true;
    },
    async deleteAccount(id) {
      if (options.deleteOk === false) return { ok: false, stage: 'content' };
      store.delete(id);
      log.deleted.push(id);
      return { ok: true };
    },
    async audit(event, details) {
      log.audited.push({ event, details });
    },
  };

  return { deps, store, log };
}

describe('the nightly job for unused accounts', () => {
  it('does nothing at all until the database has been prepared', async () => {
    const f = fake([row('a')], { ready: false });
    const s = await runInactiveAccountJob({ now: NOW, deps: f.deps });
    expect(s.status).toBe('not_ready');
    expect(f.log.sent).toEqual([]);
    expect(f.log.deleted).toEqual([]);
  });

  it('warns an account unused for two years, and records that it did', async () => {
    const f = fake([row('a'), row('recent', { last_active_at: daysAgo(10) })]);
    const s = await runInactiveAccountJob({ now: NOW, deps: f.deps });

    expect(s).toMatchObject({ status: 'ok', candidates: 1, notified: 1, deleted: 0 });
    expect(f.log.sent).toEqual([{ to: 'a@example.com', deleteOn: new Date(NOW.getTime() + 90 * 86_400_000).toISOString() }]);
    expect(f.store.get('a')?.inactivity_notice_sent_at).toBe(NOW.toISOString());
    expect(f.log.audited[0].event).toBe('inactive_account_notice');
    expect(f.log.deleted).toEqual([]);
  });

  it('does not count an account as warned when the email did not go out', async () => {
    const f = fake([row('a')], { sendOk: false });
    const s = await runInactiveAccountJob({ now: NOW, deps: f.deps });

    expect(s).toMatchObject({ notified: 0, failed: 1 });
    // Still unwarned, so it can never reach deletion on this run's account.
    expect(f.store.get('a')?.inactivity_notice_sent_at).toBeNull();
  });

  it('will not warn, and so will not delete, an account with no address', async () => {
    const f = fake([row('a', { email: null })], { authEmail: null });
    const s = await runInactiveAccountJob({ now: NOW, deps: f.deps });
    expect(s).toMatchObject({ notified: 0, failed: 1 });
    expect(f.store.get('a')?.inactivity_notice_sent_at).toBeNull();
  });

  it('falls back to the address on the sign-in record', async () => {
    const f = fake([row('a', { email: null })], { authEmail: 'real@example.com' });
    await runInactiveAccountJob({ now: NOW, deps: f.deps });
    expect(f.log.sent[0].to).toBe('real@example.com');
  });

  it('deletes three months after the warning, and not a day before', async () => {
    const f = fake([
      row('due', { inactivity_notice_sent_at: daysAgo(90) }),
      row('soon', { inactivity_notice_sent_at: daysAgo(89) }),
    ]);
    const s = await runInactiveAccountJob({ now: NOW, deps: f.deps });

    expect(f.log.deleted).toEqual(['due']);
    expect(s).toMatchObject({ deleted: 1, waiting: 1, notified: 0 });
    // The record of the deletion does not point at the person.
    const entry = f.log.audited.find((a) => a.event === 'inactive_account_deleted');
    expect(entry?.details).not.toHaveProperty('user_id');
  });

  it('keeps an account whose owner signed in while the job was running', async () => {
    const f = fake([row('a', { inactivity_notice_sent_at: daysAgo(100) })]);
    // The list is read first; the sign-in lands before the delete.
    const original = f.deps.listCandidates;
    f.deps.listCandidates = async (cutoff, limit) => {
      const result = await original(cutoff, limit);
      f.store.get('a')!.last_active_at = NOW.toISOString();
      return result;
    };

    const s = await runInactiveAccountJob({ now: NOW, deps: f.deps });
    expect(f.log.deleted).toEqual([]);
    expect(s.deleted).toBe(0);
  });

  it('never touches an administrator', async () => {
    const f = fake([row('boss', { role: 'superadmin', last_active_at: daysAgo(3000), inactivity_notice_sent_at: daysAgo(2000) })]);
    const s = await runInactiveAccountJob({ now: NOW, deps: f.deps });
    expect(s).toMatchObject({ exempt: 1, notified: 0, deleted: 0 });
    expect(f.log.sent).toEqual([]);
    expect(f.log.deleted).toEqual([]);
  });

  it('stops at the cap and leaves the rest for the next night', async () => {
    const many = Array.from({ length: 6 }, (_, i) => row(`n${i}`));
    const old = Array.from({ length: 5 }, (_, i) => row(`d${i}`, { inactivity_notice_sent_at: daysAgo(120) }));
    const f = fake([...many, ...old]);

    const s = await runInactiveAccountJob({ now: NOW, deps: f.deps, maxNotices: 4, maxDeletions: 2 });
    expect(s).toMatchObject({ notified: 4, deleted: 2, deferred: 5 });
    expect(f.log.sent).toHaveLength(4);
    expect(f.log.deleted).toHaveLength(2);
  });

  it('changes nothing on a dry run', async () => {
    const f = fake([row('a'), row('b', { inactivity_notice_sent_at: daysAgo(200) })]);
    const s = await runInactiveAccountJob({ now: NOW, dryRun: true, deps: f.deps });

    expect(s).toMatchObject({ dryRun: true, notified: 1, deleted: 1 });
    expect(f.log.sent).toEqual([]);
    expect(f.log.deleted).toEqual([]);
    expect(f.store.get('a')?.inactivity_notice_sent_at).toBeNull();
    expect(f.store.has('b')).toBe(true);
  });

  it('warns once when the scheduler calls twice', async () => {
    const f = fake([row('a')]);
    await runInactiveAccountJob({ now: NOW, deps: f.deps });
    await runInactiveAccountJob({ now: NOW, deps: f.deps });
    expect(f.log.sent).toHaveLength(1);
  });

  it('carries on after one account fails', async () => {
    const f = fake([
      row('bad', { inactivity_notice_sent_at: daysAgo(100) }),
      row('good'),
    ], { deleteOk: false });
    const s = await runInactiveAccountJob({ now: NOW, deps: f.deps });
    expect(s).toMatchObject({ failed: 1, notified: 1 });
    expect(f.store.has('bad')).toBe(true);
  });
});
