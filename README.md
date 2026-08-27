# CareerBridge Way

An AI-assisted career assessment for students and graduates. Someone answers a
46-question assessment, gets a scored breakdown of their strongest career
clusters, and a written report explaining why they fit them. A paid follow-up
questionnaire produces a more detailed roadmap.

Next.js 16 (App Router) · Supabase (auth + Postgres) · Stripe · OpenAI ·
Upstash Redis · Sentry · deployed on Vercel.

---

## Running it locally

```bash
npm install
cp .env.example .env.local   # then fill it in
npm run dev
```

`.env.example` lists every variable with a note on what it is for. The app
starts without the optional ones — email and Stripe branding degrade quietly
rather than crashing.

```bash
npm run build        # production build
npm run test         # 152 tests
npx tsc --noEmit     # type check
npx eslint .         # lint
```

---

## Things worth knowing before changing anything

These are the decisions that look wrong until you know why. Each one has a
longer explanation in the file itself.

**The session is httpOnly and OAuth stays on one origin.** Browser JavaScript
never sees the access token; the client learns who it is from
`GET /api/auth/me`. Three different places used to write the auth cookies with
different flags and whichever ran last won, which is what made Google sign-in
work only on the second attempt. `lib/auth-cookies.ts` is now the single place
that decides. Do not "simplify" it back.

**Everything server-side uses the Supabase service role, which bypasses RLS.**
So route-level authorisation is the real protection, not the database policies:
every route takes the user id from the verified session and never from the
request body. RLS is the second layer beneath that, and the Data API is
disabled at table level above it. `scripts/rls-proof.mjs` checks all of it.

**Money is idempotent by database constraint.** The Stripe webhook and the
success page's verify call race each other by design; the UNIQUE constraint on
`payments.stripe_session_id` decides the winner. Grants are compare-and-swap
with a retry, because two payments settling at once used to overwrite each
other and credit the customer once for two purchases.

**A report attempt is a reservation, not a debit.** It is consumed before the
OpenAI call so two tabs cannot both generate, and handed back if generation
fails. Losing a paid attempt to a timeout is the most refund-worthy thing this
product can do.

**Pricing and attempt rules live only in `lib/plans.ts`.** The checkout route,
the webhook and the pricing UI all read from it. Changing what a product grants
means changing it there and nowhere else.

**The model has guardrails, and they are not decoration.** `lib/crisis.ts`
screens free-text answers for distress and puts support information above the
report. `lib/guardrails.ts` adds rules to every prompt that keep
recommendations lawful and redirect rather than lecture. Both have tests
pinning the behaviour, including the false positives they must not produce.

---

## Layout

```
app/
  api/            route handlers — auth, checkout, reports, account, admin
  assess/         the main questionnaire
  followup/       the paid follow-up questionnaire
  history/        past attempts and reports
  account/        data export and account deletion
  privacy|terms|refunds/   legal pages
lib/
  auth*.ts        session handling, CSRF, the one-origin rule
  plans.ts        pricing and what each product grants
  fulfillment.ts  turning a paid session into account credit
  scoring.ts      the cluster scoring model
  followup-questions.ts   the follow-up questionnaire
  crisis.ts       distress screening and support resources
  guardrails.ts   lawful-guidance rules for the model
  kill-switch.ts  the emergency brake
scripts/
  rls-proof.mjs      prove row level security actually holds
  kill-switch.mjs    turn report generation or checkout off and on
supabase/
  *.sql           audit queries and the migrations already applied
```

---

## Operations

**Turn something off in a hurry.** Reads a Redis key, so it takes effect in
about ten seconds with no deploy:

```bash
node scripts/kill-switch.mjs status
node scripts/kill-switch.mjs off reports
node scripts/kill-switch.mjs on all
```

**Check the database is still locked down.** Run after any policy change or
new table:

```bash
node scripts/rls-proof.mjs
node scripts/rls-proof.mjs --email you@example.com --password '…'
```

**Get into the admin area.** Nobody is an admin until a `profiles.role` is set
to `admin` or `superadmin` — run `supabase/admin-setup.sql` block 1 once. The
area is guarded three times over (proxy, server component, and the API route),
all reading the same role from `profiles`. Note `profiles.is_admin` is a legacy
column that nothing reads; setting it grants nothing.

**Fix a customer who paid but cannot reach what they bought.** Usually someone
who signed up with Google once and with email the next time, so the purchase
sits on a different account. Signed in as an admin:

```
GET  /api/admin/regrant?email=them@example.com     # find the payment
POST /api/admin/regrant  { paymentId, targetUserId, reason }
```

Lookup and grant are separate on purpose, so you see what you are about to do.
Every regrant is written to `audit_logs`.

**See where people give up.** `supabase/analytics-setup.sql` block 2 is the
funnel; block 3 shows which question number loses people.

---

## Before launch

`lib/legal.ts` still has placeholder company details, and every legal page
shows a banner saying so until they are filled in. The banner disappears on its
own. The remaining launch tasks live outside this repo: a domain, Stripe live
keys, a transactional email provider, and a spend cap on the OpenAI account.
