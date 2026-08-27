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
//   node scripts/kill-switch.mjs status
//   node scripts/kill-switch.mjs off reports     stops report generation
//   node scripts/kill-switch.mjs on  reports     starts it again
//
// THE KEY EXISTING IS WHAT DISABLES THE SERVICE. Its value is ignored.
//
// That is deliberate, and it is the second design after the first one failed
// in the obvious way: the original read the value and expected the string
// "1", so a key created with the wrong name, or as a Redis Set instead of a
// string, silently did nothing — and a kill switch you believe is armed when
// it is not is worse than not having one. Presence is the one thing that
// cannot be got subtly wrong.
//
// Takes effect within CACHE_MS.

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
    // EXISTS rather than GET: it works whatever type the key was created as,
    // so an operator reaching for this under pressure cannot arm it wrongly.
    const present = await client.exists(`kill:${name}`);
    const value = present > 0;
    cache.set(name, { value, at: Date.now() });
    if (value) {
      console.warn(`KILL SWITCH: "${name}" is OFF — kill:${name} exists in Redis.`);
    }
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
