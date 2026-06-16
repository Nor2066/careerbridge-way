/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  async headers() {
    return [
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
              // Sentry uses /monitoring tunnel route (set in tunnelRoute above)
              // so we don't need to allowlist sentry.io directly —
              // requests go through our own domain. Stripe needs its own domain.
              "connect-src 'self' https://*.supabase.co https://api.openai.com https://api.stripe.com",
              "font-src 'self' data:",
              "frame-ancestors 'none'",
              "frame-src 'self' https://*.stripe.com",
              "base-uri 'self'",
              "form-action 'self' https://*.stripe.com",
              "worker-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
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