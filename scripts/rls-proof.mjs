// scripts/rls-proof.mjs
//
// Proves whether row level security actually holds, from outside the app,
// using nothing but the anon key — the same key that ships in the JavaScript
// of every page you serve.
//
// Run it:
//
//   node scripts/rls-proof.mjs
//   node scripts/rls-proof.mjs --email you@example.com --password 'your password'
//   node scripts/rls-proof.mjs --email … --password … --other <OTHER-USER-UUID>
//
// Without credentials it runs the unauthenticated tests only, which still tell
// you the most important thing: what a stranger holding your public key can
// read. With credentials it also tries to escalate that account's privileges
// and steal another user's rows.
//
// WHY THIS IS NOT A BROWSER CONSOLE SNIPPET
//
// The first version of this test asked you to import supabase-js from esm.sh
// in DevTools. Your own Content Security Policy blocked it —
// script-src 'self' — which is the CSP doing its job, and my mistake for
// suggesting it. Running here sidesteps that entirely.
//
// It also could not have worked for the signed-in half: the session is an
// httpOnly cookie, deliberately unreadable by page JavaScript, so console code
// has no access token to send. This signs in directly instead.
//
// Nothing here writes anything that survives. The escalation attempts are
// expected to fail; if one succeeds the script says so loudly, and you should
// treat that as a live vulnerability.

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// ── Config ──────────────────────────────────────────────────────────────
function loadEnv(path = '.env.local') {
  const env = {};
  let raw;
  try {
    raw = readFileSync(path, 'utf8');
  } catch {
    return env;
  }
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
  return env;
}

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

const env = loadEnv();
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!URL || !ANON) {
  console.error('Could not find NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  console.error('Run this from the project root, where .env.local lives.');
  process.exit(1);
}

const email = arg('email');
const password = arg('password');
const otherUserId = arg('other');

// ── Reporting ───────────────────────────────────────────────────────────
let failures = 0;
const pass = (msg) => console.log(`  \x1b[32mPASS\x1b[0m  ${msg}`);
const fail = (msg) => { failures++; console.log(`  \x1b[31mFAIL\x1b[0m  ${msg}`); };
const note = (msg) => console.log(`  \x1b[90m·\x1b[0m     ${msg}`);
const heading = (msg) => console.log(`\n\x1b[1m${msg}\x1b[0m`);

const READ_TABLES = [
  'profiles', 'user_results', 'ai_main_reports', 'ai_followup_reports',
  'subscriptions', 'payments', 'followup_answers', 'followup_unlocks',
  'user_progress', 'assessments', 'user_roles', 'audit_logs',
];

// ── Test 1: no session at all ───────────────────────────────────────────
async function testAnonymous() {
  heading('1. What a stranger with your public key can read (no sign-in)');
  const anon = createClient(URL, ANON);

  for (const table of READ_TABLES) {
    const { data, error } = await anon.from(table).select('*').limit(5);
    if (error) {
      pass(`${table} — refused (${error.code ?? 'error'})`);
    } else if (data.length === 0) {
      pass(`${table} — 0 rows`);
    } else {
      fail(`${table} — LEAKED ${data.length} row(s) to an anonymous caller`);
    }
  }
}

// ── Test 2: signed in, trying to escalate ───────────────────────────────
async function testEscalation(client, userId) {
  heading('2. Can this account grant itself things it did not pay for?');

  const attempts = await client
    .from('subscriptions')
    .update({ main_attempts_remaining: 999 })
    .eq('user_id', userId)
    .select();

  if (attempts.error || (attempts.data ?? []).length === 0) {
    pass('subscriptions.main_attempts_remaining — blocked');
  } else {
    fail('subscriptions.main_attempts_remaining — CHANGED IT. Attempts are free for everyone.');
  }

  const role = await client
    .from('profiles')
    .update({ role: 'superadmin' })
    .eq('id', userId)
    .select();

  if (role.error || (role.data ?? []).length === 0) {
    pass('profiles.role — blocked');
  } else {
    fail('profiles.role — BECAME SUPERADMIN. This is the escalation; re-check security-fixes.sql block 1.');
  }

  const credits = await client
    .from('subscriptions')
    .update({ followup_bundle_purchased: true })
    .eq('user_id', userId)
    .select();

  if (credits.error || (credits.data ?? []).length === 0) {
    pass('subscriptions.followup_bundle_purchased — blocked');
  } else {
    fail('subscriptions.followup_bundle_purchased — UNLOCKED IT for free.');
  }
}

// ── Test 3: signed in, trying to reach another user ─────────────────────
async function testCrossUser(client, otherId) {
  heading('3. Can this account reach another user’s data?');

  for (const table of ['user_results', 'ai_main_reports', 'ai_followup_reports',
                       'subscriptions', 'payments', 'followup_answers', 'user_progress']) {
    const { data, error } = await client.from(table).select('*').eq('user_id', otherId);
    if (error) {
      pass(`${table} — refused (${error.code ?? 'error'})`);
    } else if (data.length === 0) {
      pass(`${table} — 0 rows`);
    } else {
      fail(`${table} — READ ${data.length} row(s) belonging to another user`);
    }
  }

  const planted = await client
    .from('user_results')
    .insert({ user_id: otherId, top_clusters: [], raw_scores: {}, answers: {} })
    .select();

  if (planted.error || (planted.data ?? []).length === 0) {
    pass('user_results insert as another user — blocked');
  } else {
    fail('user_results insert as another user — WROTE A ROW into their history.');
    note('Delete it: id ' + planted.data.map((r) => r.id).join(', '));
  }
}

// ── Run ─────────────────────────────────────────────────────────────────
console.log(`\nChecking ${URL} with the public anon key.`);

await testAnonymous();

if (email && password) {
  const client = createClient(URL, ANON);
  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    heading('Signed-in tests');
    fail(`Could not sign in: ${error?.message ?? 'no user returned'}`);
    note('If this says "Email not confirmed", confirm the address first, then re-run.');
  } else {
    await testEscalation(client, data.user.id);

    if (otherUserId) {
      await testCrossUser(client, otherUserId);
    } else {
      heading('3. Can this account reach another user’s data?');
      note('Skipped — pass --other <UUID> with a DIFFERENT user id to run this.');
      note('Find one in Supabase: Authentication → Users.');
    }

    await client.auth.signOut();
  }
} else {
  heading('Signed-in tests');
  note('Skipped — pass --email and --password to run the escalation checks.');
}

console.log(
  failures === 0
    ? '\n\x1b[32mAll checks passed.\x1b[0m Nothing reachable that should not be.\n'
    : `\n\x1b[31m${failures} check(s) failed.\x1b[0m Each one above is reachable with a public key.\n`
);

process.exit(failures === 0 ? 0 : 1);
