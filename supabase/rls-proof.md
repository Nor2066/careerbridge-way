# Proving RLS actually holds

## Just run this

```bash
node scripts/rls-proof.mjs
```

Reads `.env.local`, connects with the **public anon key** — the one that ships
in the JavaScript of every page you serve — and reports what it can reach.

For the signed-in half:

```bash
node scripts/rls-proof.mjs --email you@example.com --password 'your password'
```

And to check one account cannot reach another's data, add a **different**
user's uuid (Supabase → Authentication → Users):

```bash
node scripts/rls-proof.mjs --email … --password … --other 00000000-0000-0000-0000-000000000000
```

Exit code is 0 when everything is locked down, 1 when something is not, so it
can go into CI later.

---

## Why not a browser console snippet

The first version of this document asked you to import `supabase-js` from
esm.sh in DevTools. That was wrong twice over, and the errors you got were both
your own security working:

- **`script-src 'self'` blocked the import.** Your Content Security Policy does
  not allow scripts from other hosts. Loading a third-party script into a page
  that holds a live session is exactly what a CSP exists to prevent, and it
  correctly refused.

- **It could never have tested the signed-in half anyway.** The session is an
  httpOnly cookie, deliberately unreadable by page JavaScript, so console code
  has no access token to send. That is the point of the design.

DevTools also warns before letting you paste — "this could allow attackers to
steal your identity or take control of your computer" — and that warning is
right. Do not paste code you have not read into a console on a site you are
logged into, including code from me.

---

## Result on 2026-08-26

All twelve tables refused an anonymous caller with **`42501`
insufficient_privilege**.

That code is worth understanding, because it is *stronger* than the answer I
expected. `42501` means the `anon` role has no table-level SELECT grant at all
— the request is rejected before row level security is even consulted. It
matches the **API DISABLED** badges on your Policies page: these tables are not
exposed through the Data API, so RLS is a second line of defence that nothing
currently reaches.

Two layers, and the outer one is holding. RLS still matters: it is what
protects you the day a table gets exposed to the Data API by accident.

---

## What still needs a signed-in run

The escalation checks are the ones that matter most, and they need credentials:

- Can the account set its own `main_attempts_remaining` to 999?
- Can it set its own `profiles.role` to `superadmin`? *(This is the hole that
  was open until we dropped the policy — worth confirming it is really shut.)*
- Can it flip `followup_bundle_purchased` to true for free?

Reading is protected far more often than writing, and writing is where the
attempts and the admin role live.

---

## Re-run this

After any change to policies, and after adding a table. A new table with RLS
enabled and no policies is safe; a new table with RLS forgotten is not, and
nothing in the application will tell you which one you have.
