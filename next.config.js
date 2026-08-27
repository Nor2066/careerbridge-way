/** @type {import('next').NextConfig} */
// This file is loaded by Next.js as CommonJS before any transpilation, so
// require() is the only form that works here.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Tells the browser to refuse plain http for this domain from now on,
          // which closes the window where a first request over http could be
          // intercepted before the redirect to https. Two years, subdomains
          // included.
          //
          // Deliberately NOT preloaded: preloading is submitted to a browser
          // list and is slow and awkward to undo, and it would apply to every
          // subdomain — including the app.* and mail subdomains the launch plan
          // adds later. Worth doing once the domain layout has settled.
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains',
          },
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
  // Prevents source maps from being served publicly alongside JS bundles.
  // They are still uploaded to Sentry for error debugging, just not publicly accessible.
  hideSourceMaps: true,
  tunnelRoute: "/monitoring",
  webpack: {
    automaticVercelMonitors: true,
  },
});