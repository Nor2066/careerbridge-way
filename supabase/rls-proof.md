# Proving RLS actually holds

Query 7 could not be answered from the SQL editor, and this is the reason:
**the editor connects as the table owner, which bypasses row level security
entirely.** Every check run there passes whether the policies are right or
wrong. It is the single most common way people conclude their database is
locked down when it is not.

So this has to run as an ordinary signed-in user, through the anon key — the
same key that ships in the JavaScript of every page you serve.

---

## Setup

1. Create **two** accounts through your own signup form. Call them A and B.
2. Sign in as **A** and take an assessment, so there is a row to try to steal.
3. Find **B's** user id: Supabase dashboard → Authentication → Users.
4. Sign in as **A** in the browser, open DevTools → Console, and stay on a page
   of your own site so the Supabase client is loaded.

If `supabase` is not defined in the console, paste this first — the URL and
anon key are public by design, so there is no harm in having them there:

```js
const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_ANON_KEY');
// then sign in as A:
await supabase.auth.signInWithPassword({ email: 'a@example.com', password: '…' });
```

---

## Test 1 — can A read B's data?

Replace `B_USER_ID` with B's uuid.

```js
const B = 'B_USER_ID';
for (const table of ['user_results', 'ai_main_reports', 'ai_followup_reports',
                     'subscriptions', 'payments', 'followup_answers',
                     'user_progress', 'assessments']) {
  const { data, error } = await supabase.from(table).select('*').eq('user_id', B);
  console.log(table, '→', error ? `error: ${error.message}` : `${data.length} rows`);
}
```

**Expected: `0 rows` on every line.** Any table returning rows is a live data
leak. An error is also fine — it means the table refused outright.

---

## Test 2 — can A grant themselves things?

This is the half people forget. Reading is protected far more often than
writing, and writing is where the money is.

```js
const me = (await supabase.auth.getUser()).data.user.id;

// Attempts are what you sell. This must not work.
console.log('attempts:', await supabase
  .from('subscriptions').update({ main_attempts_remaining: 999 })
  .eq('user_id', me).select());

// The privilege escalation that was open until today. Must not work.
console.log('role:', await supabase
  .from('profiles').update({ role: 'superadmin' })
  .eq('id', me).select());

// Writing a row that claims to belong to somebody else.
console.log('foreign insert:', await supabase
  .from('user_results').insert({ user_id: B, top_clusters: [], raw_scores: {}, answers: {} }).select());
```

**Expected on all three: an error, or `data: []` with zero rows changed.**

If the role one returns a row with `role: 'superadmin'`, block 1 of
`security-fixes.sql` did not apply — check it again before doing anything else.

---

## Test 3 — the anon key with no session at all

Sign out first, then:

```js
await supabase.auth.signOut();
for (const table of ['profiles', 'user_results', 'subscriptions', 'payments',
                     'assessments', 'user_roles', 'audit_logs']) {
  const { data, error } = await supabase.from(table).select('*').limit(5);
  console.log(table, '→', error ? `blocked: ${error.message}` : `${data.length} rows LEAKED`);
}
```

**Expected: every line blocked or `0 rows`.** This is what an attacker sees
with nothing but the key from your page source.

---

## Afterwards

Delete the two test accounts (Authentication → Users), which also exercises
your delete-account flow for free.

Worth re-running this after any change to policies, and after adding a table.
A new table with RLS enabled and no policies is safe; a new table with RLS
forgotten is not, and nothing in the application will tell you which you have.
