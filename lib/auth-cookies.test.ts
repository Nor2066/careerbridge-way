import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isSameOrigin, safeReturnTo } from '@/lib/auth-cookies';

// isSameOrigin is the CSRF guard on every route that writes a session or sends
// mail, so it has two ways to be wrong and both are expensive: too strict and
// preview deployments 403 on sign-in, too loose and a hostile page can post
// with the visitor's cookies attached.

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  // NODE_ENV is typed read-only; siteOrigin() branches on it, so the test
  // has to set it the way the runtime actually does.
  (process.env as Record<string, string>).NODE_ENV = 'production';
  process.env.NEXT_PUBLIC_URL = 'https://careerbridge-way.vercel.app';
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

/** A request as Vercel presents it: the real host in x-forwarded-host. */
function req(host: string, headers: Record<string, string> = {}) {
  return new Request('https://internal.invalid/api/thing', {
    method: 'POST',
    headers: { 'x-forwarded-host': host, 'x-forwarded-proto': 'https', ...headers },
  });
}

describe('accepting our own pages', () => {
  it('accepts the configured production origin', () => {
    expect(
      isSameOrigin(
        req('careerbridge-way.vercel.app', { origin: 'https://careerbridge-way.vercel.app' })
      )
    ).toBe(true);
  });

  // The regression that sent this to production: a preview deployment serves
  // from a per-branch hostname that can never match NEXT_PUBLIC_URL, so every
  // sign-in and password reset there returned 403.
  it('accepts a preview deployment talking to itself', () => {
    const host = 'careerbridge-5ijy9eeuw-nor2066s-projects.vercel.app';
    expect(isSameOrigin(req(host, { origin: `https://${host}` }))).toBe(true);
  });

  it('accepts a custom domain before NEXT_PUBLIC_URL has caught up', () => {
    expect(
      isSameOrigin(req('careerbridge.co.uk', { origin: 'https://careerbridge.co.uk' }))
    ).toBe(true);
  });

  it('falls back to Referer when Origin is absent', () => {
    const host = 'careerbridge-way.vercel.app';
    expect(isSameOrigin(req(host, { referer: `https://${host}/login` }))).toBe(true);
  });
});

describe('rejecting everyone else', () => {
  it('rejects a hostile page posting to our production origin', () => {
    expect(
      isSameOrigin(req('careerbridge-way.vercel.app', { origin: 'https://evil.example' }))
    ).toBe(false);
  });

  it('rejects a hostile page posting to a preview deployment', () => {
    const host = 'careerbridge-5ijy9eeuw-nor2066s-projects.vercel.app';
    expect(isSameOrigin(req(host, { origin: 'https://evil.example' }))).toBe(false);
  });

  // A lookalike host is the whole reason this compares full origins rather
  // than checking a suffix.
  it('rejects a lookalike domain', () => {
    expect(
      isSameOrigin(
        req('careerbridge-way.vercel.app', { origin: 'https://careerbridge-way.vercel.app.evil.example' })
      )
    ).toBe(false);
  });

  it('rejects http where we expect https', () => {
    expect(
      isSameOrigin(
        req('careerbridge-way.vercel.app', { origin: 'http://careerbridge-way.vercel.app' })
      )
    ).toBe(false);
  });

  it('rejects a request carrying neither Origin nor Referer', () => {
    expect(isSameOrigin(req('careerbridge-way.vercel.app'))).toBe(false);
  });

  it('rejects an unparseable Referer', () => {
    expect(
      isSameOrigin(req('careerbridge-way.vercel.app', { referer: 'not-a-url' }))
    ).toBe(false);
  });
});

// Guards the returnTo values that ride through checkout and back.
describe('safeReturnTo', () => {
  it('keeps a plain same-site path', () => {
    expect(safeReturnTo('/assess')).toBe('/assess');
  });

  it('rejects an absolute URL', () => {
    expect(safeReturnTo('https://evil.example')).toBe('/');
  });

  it('rejects a protocol-relative URL', () => {
    expect(safeReturnTo('//evil.example')).toBe('/');
  });

  it('rejects a backslash smuggling attempt', () => {
    expect(safeReturnTo('/\\evil.example')).toBe('/');
  });

  it('falls back when the value is missing', () => {
    expect(safeReturnTo(null, '/pricing')).toBe('/pricing');
  });
});
