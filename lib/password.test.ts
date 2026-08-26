import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  assessPassword,
  isBreachedPassword,
  PasswordSchema,
  MIN_PASSWORD_LENGTH,
} from '@/lib/password';

// The breach check calls Have I Been Pwned. Tests must not depend on a third
// party being reachable, so fetch is stubbed everywhere — including for the
// cases that are meant to pass, where the stub returns "not breached".
function stubHibp(suffixes: string[] = []) {
  return vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      text: async () => suffixes.map((s) => `${s}:42`).join('\n'),
    }))
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('length', () => {
  it(`rejects anything under ${MIN_PASSWORD_LENGTH} characters`, () => {
    expect(PasswordSchema.safeParse('short').success).toBe(false);
    expect(PasswordSchema.safeParse('a'.repeat(MIN_PASSWORD_LENGTH - 1)).success).toBe(false);
  });

  it('accepts the minimum exactly', () => {
    expect(PasswordSchema.safeParse('a'.repeat(MIN_PASSWORD_LENGTH)).success).toBe(true);
  });

  // Bounded so an enormous body never reaches the hashing step.
  it('rejects an absurdly long password', () => {
    expect(PasswordSchema.safeParse('a'.repeat(5000)).success).toBe(false);
  });
});

describe('app-specific rejections', () => {
  it('refuses a password containing the email local part', async () => {
    stubHibp();
    const result = await assessPassword('jsmith-is-great', 'jsmith@example.com');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/email address/i);
  });

  it('refuses a password based on the site name', async () => {
    stubHibp();
    const result = await assessPassword('careerbridge2026', 'someone@example.com');
    expect(result.ok).toBe(false);
  });

  it('refuses a single repeated character', async () => {
    stubHibp();
    const result = await assessPassword('aaaaaaaaaaaa', 'someone@example.com');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/repetitive/i);
  });

  // A short local part would otherwise match inside almost any password.
  it('does not treat a two-letter local part as a substring rule', async () => {
    stubHibp();
    const result = await assessPassword('correct horse battery', 'jo@example.com');
    expect(result.ok).toBe(true);
  });
});

describe('breached password check', () => {
  // k-anonymity: SHA1("password123") is CBFDAC6008F9CAB4083784CBD1874F76618D2A97,
  // so the prefix sent is CBFDA and the suffix looked for is the remaining 35.
  it('spots a password whose hash suffix comes back from the range API', async () => {
    stubHibp(['C6008F9CAB4083784CBD1874F76618D2A97']);
    expect(await isBreachedPassword('password123')).toBe(true);
  });

  it('passes a password whose suffix is absent', async () => {
    stubHibp(['0000000000000000000000000000000000A']);
    expect(await isBreachedPassword('a-genuinely-unusual-passphrase')).toBe(false);
  });

  // Fails OPEN deliberately: refusing every signup because a third party is
  // down trades a small security gain for a total outage of registration.
  it('allows the password through when the service is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('network down'); }));
    expect(await isBreachedPassword('anything at all')).toBe(false);
  });

  it('allows the password through on a non-200 response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, text: async () => '' })));
    expect(await isBreachedPassword('anything at all')).toBe(false);
  });

  it('surfaces a breached password as a rejection with a usable reason', async () => {
    stubHibp(['C6008F9CAB4083784CBD1874F76618D2A97']);
    const result = await assessPassword('password123', 'someone@example.com');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/data breach/i);
  });
});

describe('a good password', () => {
  it('is accepted', async () => {
    stubHibp();
    const result = await assessPassword('velvet anchor plum ridge', 'someone@example.com');
    expect(result.ok).toBe(true);
  });

  // Cheap local rules run first so an obviously bad password never costs a
  // network round trip.
  it('does not call the breach API for a password that is already too short', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    await assessPassword('tiny', 'someone@example.com');
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
