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

/**
 * The PKCE verifier has to survive a round trip through Supabase and Google
 * and come back on a cross-site navigation. SameSite=Lax is *supposed* to be
 * sent on a top-level GET, but browsers with strict tracking protection don't
 * reliably deliver it at the end of a multi-hop redirect chain — and a missing
 * verifier is precisely what makes the exchange fail. SameSite=None removes
 * that variable.
 *
 * Safe for this cookie specifically, unlike the session: it lives 10 minutes,
 * is HttpOnly, and on its own grants nothing — it's only useful alongside the
 * matching one-time auth code, which Supabase hands to our origin.
 *
 * Production only: SameSite=None requires Secure, and a Secure cookie is
 * dropped outright over plain http, which would break local development.
 */
function isVerifier(name: string) {
  return name.endsWith('-code-verifier');
}

/** Flush buffered cookie writes onto a response under our single policy. */
export function applyCookies(response: NextResponse, pending: PendingCookie[]) {
  for (const { name, value, options } of pending) {
    // Deletions arrive as value:'' with maxAge:0 — preserve that, since
    // AUTH_COOKIE_FLAGS deliberately says nothing about maxAge.
    let maxAge = options?.maxAge;
    if (isVerifier(name) && maxAge !== undefined && maxAge > VERIFIER_MAX_AGE_SECONDS) {
      maxAge = VERIFIER_MAX_AGE_SECONDS;
    }

    const crossSiteVerifier = isVerifier(name) && isProd;

    response.cookies.set(name, value, {
      ...options,
      ...AUTH_COOKIE_FLAGS,
      ...(crossSiteVerifier ? { sameSite: 'none' as const, secure: true } : {}),
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
/**
 * The origin the browser actually asked for.
 *
 * Read from the forwarding headers rather than `request.url`, which on Vercel
 * can carry an internal hostname. This is what tells us whether the visitor is
 * on the production domain or one of the per-branch preview deployments.
 */
export function requestOrigin(request: Request): string {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (host) {
    const proto = request.headers.get('x-forwarded-proto') ?? 'https';
    return `${proto}://${host}`;
  }
  return new URL(request.url).origin;
}

/**
 * The single origin the whole OAuth round trip must happen on.
 *
 * This MUST agree with the URL registered in Supabase's redirect allow-list,
 * because Supabase will only send the browser back to a URL on that list —
 * and preview deployment hostnames change per branch, so they can't all be
 * registered.
 */
export function siteOrigin(request: Request): string {
  // Locally the request origin is localhost and is the only correct answer —
  // using the configured production URL here would send a developer's Google
  // round trip off to the live site instead of back to their dev server.
  if (process.env.NODE_ENV !== 'production') return requestOrigin(request);

  const configured = process.env.NEXT_PUBLIC_URL;
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      console.error('NEXT_PUBLIC_URL is not a valid URL; falling back to the request origin');
    }
  }
  return requestOrigin(request);
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
  // Two acceptable answers, and the first one is the important one.
  //
  // requestOrigin is the host the browser actually connected to. That is what
  // "same origin" means, and checking against it is what makes this work on
  // every deployment: preview URLs change with each branch, and a custom
  // domain arrives before anyone remembers to update NEXT_PUBLIC_URL.
  //
  // Comparing only against the configured site origin — which is what this
  // did — rejected every request from a preview deployment with a 403, so the
  // one place you test changes before production was the one place sign-in,
  // sign-up and password reset could not work.
  //
  // This is not a weakening. For CSRF to be worth attempting the request must
  // reach OUR origin, because that is the only way our cookies are attached;
  // and once it does, the browser sets Origin to the attacker's page, which
  // cannot match. A hostile page on evil.com posting here still gets 403.
  const accepted = new Set([requestOrigin(request), siteOrigin(request)]);

  const origin = request.headers.get('origin');
  if (origin) return accepted.has(origin);

  // Some browsers omit Origin on same-origin requests; fall back to Referer.
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      return accepted.has(new URL(referer).origin);
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
