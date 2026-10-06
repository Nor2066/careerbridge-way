// app/robots.ts
import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Keep private/admin/payment pages out of search results
        disallow: [
          '/admin',
          '/admin/',
          '/history',
          '/followup',
          '/account',
          // Reached only by clicking a one-time link from an email; there is
          // nothing to index and a crawler landing there is just noise.
          '/reset-password',
          '/payment/',
          '/api/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}