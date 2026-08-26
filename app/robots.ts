// app/robots.ts
import { MetadataRoute } from 'next';

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
          '/payment/',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://careerbridge-way.vercel.app/sitemap.xml',
  };
}