// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Single shared Redis instance — don't create one per limiter
const redis = Redis.fromEnv();

// ─── IP extraction ────────────────────────────────────────────────────────────
// On Vercel, x-forwarded-for can be a comma-separated list: "clientIP, proxy1, proxy2"
// We always take the LAST entry that Vercel itself appended, not the first
// (the first can be spoofed by a user adding their own x-forwarded-for header).
// Falls back to a fixed string so unauthenticated limiters still work locally.
export function getIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (!forwarded) return "127.0.0.1";

  const ips = forwarded.split(",").map((ip) => ip.trim());
  // Use the last IP — this is what Vercel's edge appended and can't be spoofed
  const ip = ips[ips.length - 1];

  // Basic sanity check — must look like an IP address
  const ipv4 = /^\d{1,3}(\.\d{1,3}){3}$/;
  const ipv6 = /^[a-fA-F0-9:]+$/;
  if (ipv4.test(ip) || ipv6.test(ip)) return ip;

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

// AI report generation — expensive OpenAI calls, strict limit per user
// 3 reports per 10 minutes prevents abuse and cost overruns
export const generateReportLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "10 m"),
  analytics: true,
  prefix: "rl:gen_report",
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