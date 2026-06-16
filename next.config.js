/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  async headers() {
    return [
      // ─── Security headers on every page ─────────────────────────────────
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              // Added https://*.stripe.com for Stripe Checkout redirect
              // Added https://o*.ingest.sentry.io for Sentry error reporting
              "connect-src 'self' https://*.supabase.co https://api.openai.com https://*.stripe.com https://o*.ingest.sentry.io",
              "font-src 'self' data:",
              "frame-ancestors 'none'",
              // Allow Stripe Checkout iframe and Sentry tunnel
              "frame-src 'self' https://*.stripe.com",
              "base-uri 'self'",
              "form-action 'self' https://*.stripe.com",
              // Allow blob: workers for Sentry
              "worker-src 'self' blob:",
            ].join('; '),
          },
        ],
      },

      // ─── CORS lockdown on all API routes ────────────────────────────────
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_URL || 'https://careerbridge-way.vercel.app',
          },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

module.exports = withSentryConfig(nextConfig, {
  org: "careerbridge-way",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  automaticVercelMonitors: true,
});