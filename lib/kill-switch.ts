// lib/kill-switch.ts
//
// The emergency brake from the launch checklist: turn off report generation or
// checkout without shipping code, and leave the rest of the site up.
//
// WHY REDIS AND NOT AN ENV VAR
//
// Changing an environment variable on Vercel does nothing until you redeploy,
// which is several minutes you will not want to spend while the OpenAI bill is
// climbing. A Redis key flips instantly from the Upstash console, from a phone,
// with no build.
//
// FAILS OPEN, ON PURPOSE
//
// If Redis is unreachable the service stays ON. This is an availability
// control, not a security one: an Upstash blip taking down checkout would
// cause the exact outage the switch exists to prevent. The one thing that must
// never happen is the site going dark because the thing that turns it off
// broke.
//
// HOW TO USE IT
//
//   Upstash console → your database → Data Browser → set:
//     kill:reports  = "1"    stops report generation
//     kill:checkout = "1"    stops new purchases
//
//   Delete the key, or set anything other than "1", to turn it back on.
//   Takes effect within CACHE_MS.

import { Redis } from '@upstash/redis';

export type Switch = 'reports' | 'checkout';

/**
 * How stale a reading may be.
 *
 * A per-request Redis round trip on the hot path would be a real cost for a
 * value that changes about twice a year. Ten seconds is short enough that
 * flipping the switch feels immediate and long enough that it costs nothing.
 */
const CACHE_MS = 10_000;

const cache = new Map<Switch, { value: boolean; at: number }>();

let redis: Redis | null = null;
function getRedis(): Redis | null {
  if (redis) return redis;
  try {
    redis = Redis.fromEnv();
    return redis;
  } catch {
    // No Redis configured (local development, usually). Fail open.
    return null;
  }
}

/**
 * True when the named part of the service is currently switched off.
 */
export async function isDisabled(name: Switch): Promise<boolean> {
  // An env var still works as a permanent off, for a planned outage where a
  // deploy is happening anyway.
  if (process.env[`KILL_${name.toUpperCase()}`] === 'true') return true;

  const cached = cache.get(name);
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.value;

  const client = getRedis();
  if (!client) return false;

  try {
    const raw = await client.get<string | number | null>(`kill:${name}`);
    const value = raw === '1' || raw === 1;
    cache.set(name, { value, at: Date.now() });
    return value;
  } catch (err) {
    console.error(`KILL SWITCH: could not read kill:${name}, staying on —`, err);
    // Fail open. See the note at the top.
    return false;
  }
}

/** What the customer sees. Honest, and not their fault. */
export const DISABLED_MESSAGE: Record<Switch, string> = {
  reports:
    'Report generation is paused right now while we sort out a problem on our side. Your attempts have not been used and nothing has been lost — please try again shortly.',
  checkout:
    'Purchases are paused right now while we sort out a problem on our side. Nothing has been charged. Please try again shortly.',
};
