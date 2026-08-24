// lib/auth-cookies.ts
//
// ONE place that decides how Supabase auth cookies are written.
//
// Why this file exists: previously three different places wrote the same
// `sb-<ref>-auth-token` cookies with *different* flags — proxy.ts forced
// httpOnly:true, /api/auth/callback-exchange deliberately left it off, and
// the browser SDK wrote its own via document.cookie. Whichever ran last won,
// so whether you ended up logged in depended on request ordering. That is the
// bug behind "Google sign-in only works the second time".
//
// Policy: the session is httpOnly. Browser JavaScript never sees the access
// or refresh token, so an XSS bug can no longer steal a session. The client
// learns who it is from GET /api/auth/me instead.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { NextResponse } from 'next/server';

const isProd = process.env.NODE_ENV === 'production';

/**
 * Flags forced onto every auth cookie we write. Spread these LAST so they
 * always win over whatever @supabase/ssr suggested.
 *
 * sameSite must stay 'lax', not 'strict': the OAuth redirect back from
 * Google/Supabase and the return from Stripe Checkout are both cross-site
 * top-level GET navigations, and 'strict' would withhold the cookie on those
 * and bounce the user to /login. 'lax' still withholds it on cross-site
 * POST/PUT/DELETE, which is the actual CSRF surface.
 */
export const AUTH_COOKIE_FLAGS = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  path: '/',
} as const satisfies Partial<CookieOptions>;

/** A cookie write requested by @supabase/ssr. */
export type PendingCookie = {
  name: string;
  value: string;
  options?: CookieOptions;
};

/**
 * Creates a Supabase server client that BUFFERS its cookie writes into the
 * returned array instead of writing them immediately.
 *
 * This solves an ordering problem: routes like /api/auth/google don't know
 * their redirect target until after the Supabase call has already asked to
 * write the PKCE verifier cookie. Buffering lets us build the response first
 * and then flush.
 *
 * Always call `applyCookies(response, pending)` before returning.
 */
export function createBufferedServerClient(getRequestCookies: () => { name: string; value: string }[]) {
  const pending: PendingCookie[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: getRequestCookies,
        setAll: (cookiesToSet) => {
          pending.push(...cookiesToSet);
        },
      },
    }
  );

  return { supabase, pending };
}

/**
 * A PKCE verifier is only needed for the seconds between leaving for Google
 * and coming back. @supabase/ssr writes it with the same 400-day lifetime as a
 * session cookie; cap it so an abandoned sign-in doesn't leave one sitting in
 * the browser for over a year.
 */
const VERIFIER_MAX_AGE_SECONDS = 60 * 10;

/** Flush buffered cookie writes onto a response under our single policy. */
export function applyCookies(response: NextResponse, pending: PendingCookie[]) {
  for (const { name, value, options } of pending) {
    // Deletions arrive as value:'' with maxAge:0 — preserve that, since
    // AUTH_COOKIE_FLAGS deliberately says nothing about maxAge.
    let maxAge = options?.maxAge;
    if (name.endsWith('-code-verifier') && maxAge !== undefined && maxAge > VERIFIER_MAX_AGE_SECONDS) {
      maxAge = VERIFIER_MAX_AGE_SECONDS;
    }

    response.cookies.set(name, value, {
      ...options,
      ...AUTH_COOKIE_FLAGS,
      ...(maxAge !== undefined ? { maxAge } : {}),
    });
  }
}

/**
 * The origin to build our own redirect URLs from.
 *
 * Prefers the configured site URL over the incoming request's origin so a
 * spoofed Host header can't turn our redirects into a phishing hop.
 */
export function siteOrigin(request: Request): string {
  const requestOrigin = new URL(request.url).origin;

  // Locally the request origin is localhost and is the only correct answer —
  // using the configured production URL here would send a developer's Google
  // round trip off to the live site instead of back to their dev server.
  if (process.env.NODE_ENV !== 'production') return requestOrigin;

  const configured = process.env.NEXT_PUBLIC_URL;
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      console.error('NEXT_PUBLIC_URL is not a valid URL; falling back to the request origin');
    }
  }
  return requestOrigin;
}

/**
 * Open-redirect guard for `returnTo` values that arrive from query strings.
 *
 * Only same-site absolute paths are allowed. Rejects "https://evil.com",
 * protocol-relative "//evil.com", and anything that isn't a plain path.
 */
export function safeReturnTo(value: string | null | undefined, fallback = '/'): string {
  if (!value) return fallback;
  if (!value.startsWith('/')) return fallback;
  if (value.startsWith('//')) return fallback;
  if (value.includes('\\')) return fallback;
  return value;
}

/**
 * True when a state-changing request genuinely came from our own pages.
 *
 * SameSite=Lax already blocks cross-site POSTs from carrying our cookies, so
 * this is defence in depth rather than the only guard — it costs nothing and
 * closes the gap for browsers that treat SameSite differently.
 */
export function isSameOrigin(request: Request): boolean {
  const expected = siteOrigin(request);
  const origin = request.headers.get('origin');

  if (origin) return origin === expected;

  // Some browsers omit Origin on same-origin requests; fall back to Referer.
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      return new URL(referer).origin === expected;
    } catch {
      return false;
    }
  }

  // Neither header present — a browser fetch() always sends at least one.
  return false;
}

/** Responses carrying auth state must never be cached anywhere. */
export const NO_STORE_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, max-age=0, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
} as const;
