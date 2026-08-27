// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Single shared Redis instance — don't create one per limiter
const redis = Redis.fromEnv();

// ─── IP extraction ────────────────────────────────────────────────────────────
// Every part of x-forwarded-for is caller-supplied until a proxy you trust
// rewrites it, and which position ends up trustworthy depends on how many
// hops there are. Picking an index is therefore always a guess.
//
// Vercel removes the guesswork: it sets x-vercel-forwarded-for itself and
// strips any inbound copy, so its value is the real client address and cannot
// be spoofed. Prefer it, then x-real-ip, and only then fall back to parsing
// x-forwarded-for — where the FIRST entry is the conventional client position.
//
// Falls back to a fixed string so unauthenticated limiters still work locally.
const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;
const IPV6 = /^[a-fA-F0-9:]+$/;

function looksLikeIP(value: string): boolean {
  return IPV4.test(value) || IPV6.test(value);
}

export function getIP(request: Request): string {
  const trusted =
    request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-real-ip");
  if (trusted) {
    const ip = trusted.split(",")[0].trim();
    if (looksLikeIP(ip)) return ip;
  }

  const forwarded = request.headers.get("x-forwarded-for");
  if (!forwarded) return "127.0.0.1";

  const ip = forwarded.split(",")[0].trim();
  if (looksLikeIP(ip)) return ip;

  return "unknown";
}

// ─── Helper: get identifier ───────────────────────────────────────────────────
// For authenticated routes, prefer user ID (more accurate than IP — prevents
// users sharing an office IP from blocking each other).
// For unauthenticated routes (login, signup, magic-link), use IP only.
export function getUserIdentifier(userId: string): string {
  return `user_${userId}`;
}

// ─── Rate limiters ────────────────────────────────────────────────────────────
// Naming convention: prefix describes the route, limiter describes the policy.
// All use slidingWindow for smooth rate limiting without burst edges.

// Public assessment scoring — IP based (no auth required)
// 10 submissions per minute is generous for a quiz
export const assessLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
  prefix: "rl:assess",
});

// AI report generation — expensive OpenAI calls, strict limit per user.
//
// This one has to be keyed by USER, not IP. Keying it by IP had two failure
// modes at once: a whole university or office behind one NAT address shares a
// single allowance, so one student generating three reports locks out
// everyone else on campus — and an attacker with a pool of addresses simply
// walks around it. The user id is the thing that actually maps to the cost.
export const generateReportLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "10 m"),
  analytics: true,
  prefix: "rl:gen_report",
});

// Coarse IP gate in front of the per-user limit above. It runs before the
// session is verified, so it is the only thing standing between an
// unauthenticated flood and a Supabase round trip per request. Set generously
// enough that shared campus addresses are unaffected — the strict, meaningful
// limit is the per-user one.
export const generateReportIpLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "10 m"),
  analytics: true,
  prefix: "rl:gen_report_ip",
});

// Saving assessment results — per user, moderate limit
export const saveResultLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "60 s"),
  analytics: true,
  prefix: "rl:save_result",
});

// Progress saving — called frequently as user moves through questions
// Higher limit to not interrupt the assessment flow
export const saveProgressLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "60 s"),
  analytics: true,
  prefix: "rl:save_progress",
});

// Auth endpoints — IP based, strict to prevent brute force and spam
// 5 attempts per 15 minutes for login/signup/magic-link
export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
  prefix: "rl:auth",
});

// Admin login — extra strict, IP based
// 5 attempts per 30 minutes
export const adminLoginLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "30 m"),
  analytics: true,
  prefix: "rl:admin_login",
});

// Admin data reads — per user, moderate
export const adminReadLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "60 s"),
  analytics: true,
  prefix: "rl:admin_read",
});

// General authenticated read endpoints (history, results, progress)
// Per user, generous — just prevents scraping
export const readLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "60 s"),
  analytics: true,
  prefix: "rl:read",
});