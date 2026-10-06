import { describe, it, expect, vi } from 'vitest';
import { resolveSiteUrl } from '@/lib/site';

// SITE_URL ends up in the sitemap, canonical metadata and Stripe's return
// URLs. A malformed value fails quietly: search engines index the wrong host
// and customers are sent back from payment to a 404.

describe('resolveSiteUrl', () => {
  it('uses the configured address', () => {
    expect(resolveSiteUrl('https://careerbridge.example')).toBe('https://careerbridge.example');
  });

  it('drops a trailing slash so joined paths do not double up', () => {
    expect(resolveSiteUrl('https://careerbridge.example/')).toBe('https://careerbridge.example');
  });

  it('keeps a port, which local development needs', () => {
    expect(resolveSiteUrl('http://localhost:3000')).toBe('http://localhost:3000');
  });

  it('falls back when unset', () => {
    expect(resolveSiteUrl(undefined)).toBe('https://careerbridge-way.vercel.app');
    expect(resolveSiteUrl('')).toBe('https://careerbridge-way.vercel.app');
  });

  it('falls back, loudly, when the value is not a URL', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(resolveSiteUrl('careerbridge.example')).toBe('https://careerbridge-way.vercel.app');
    expect(error).toHaveBeenCalledOnce();
    error.mockRestore();
  });
});
