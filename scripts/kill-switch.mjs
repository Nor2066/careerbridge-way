// scripts/kill-switch.mjs
//
// Operate the emergency brake without touching the Upstash console.
//
//   node scripts/kill-switch.mjs status
//   node scripts/kill-switch.mjs off reports     stop generating reports
//   node scripts/kill-switch.mjs off checkout    stop taking payments
//   node scripts/kill-switch.mjs on  reports     start again
//   node scripts/kill-switch.mjs on  all
//
// This exists because the console version went wrong on the first attempt:
// it is easy to create a key with the name and value merged together, or as a
// Redis Set rather than a string, and end up with a switch that looks armed
// and does nothing. Here there is one word to type and no shape to get wrong.
//
// "off" means the service is off. The key existing is what disables it.

import { readFileSync } from 'fs';
import { Redis } from '@upstash/redis';

const SWITCHES = ['reports', 'checkout'];

function loadEnv(path = '.env.local') {
  const env = {};
  try {
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {}
  return env;
}

const env = loadEnv();
const url = process.env.UPSTASH_REDIS_REST_URL ?? env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  console.error('Missing UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN.');
  console.error('Run this from the project root, where .env.local lives.');
  process.exit(1);
}

const redis = new Redis({ url, token });

const [action, targetArg] = process.argv.slice(2);
const targets =
  !targetArg || targetArg === 'all' ? SWITCHES : SWITCHES.filter((s) => s === targetArg);

if (targetArg && targetArg !== 'all' && targets.length === 0) {
  console.error(`Unknown switch "${targetArg}". Use: ${SWITCHES.join(', ')}, or all.`);
  process.exit(1);
}

async function status() {
  console.log('');
  for (const name of SWITCHES) {
    const present = await redis.exists(`kill:${name}`);
    console.log(
      present > 0
        ? `  \x1b[31mOFF\x1b[0m  ${name.padEnd(9)} — disabled; customers see a "paused" message`
        : `  \x1b[32mON\x1b[0m   ${name.padEnd(9)} — running normally`
    );
  }
  console.log('');
}

if (action === 'status' || !action) {
  await status();
} else if (action === 'off') {
  for (const name of targets) {
    await redis.set(`kill:${name}`, '1');
    console.log(`Disabled ${name}.`);
  }
  console.log('Takes effect within about 10 seconds.');
  await status();
} else if (action === 'on') {
  for (const name of targets) {
    await redis.del(`kill:${name}`);
    console.log(`Re-enabled ${name}.`);
  }
  console.log('Takes effect within about 10 seconds.');
  await status();
} else {
  console.error(`Unknown action "${action}". Use: status, off, on.`);
  process.exit(1);
}
