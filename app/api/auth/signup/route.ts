// app/api/auth/signup/route.ts
//
// Server-side sign-up, so that when a project has email confirmation turned
// off (Supabase returns a session immediately) that session lands in httpOnly
// cookies like every other login path.
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import {
  createBufferedServerClient,
  applyCookies,
  isSameOrigin,
  siteOrigin,
  NO_STORE_HEADERS,
} from '@/lib/auth-cookies';
import { authLimiter, getIP } from '@/lib/rate-limit';
import { assessPassword, MAX_PASSWORD_LENGTH } from '@/lib/password';
import { recordTermsAcceptance } from '@/lib/terms-acceptance';
import { MINIMUM_AGE } from '@/lib/legal';

export const dynamic = 'force-dynamic';

const SignUpSchema = z.object({
  email: z.string().email().max(320),
  // Length and content rules live in lib/password.ts, checked below by
  // assessPassword — including the breached-password lookup, which needs a
  // network call and so cannot live in a Zod schema. Here we only bound the
  // input so an enormous body never reaches the hashing step.
  password: z.string().min(1).max(MAX_PASSWORD_LENGTH),
  // z.literal(true) rather than z.boolean(): the request is rejected unless
  // the value is actually true, so a caller cannot create an account by
  // sending false or leaving the field out. The form disables the button
  // until the box is ticked, but the form is not the security boundary —
  // anything can POST here.
  acceptedTerms: z.literal(true),
  confirmedAge: z.literal(true),
});

export async function POST(request: Request) {
  // Account creation triggers a confirmation email to an address the caller
  // chooses, so it gets the same cross-site guard as the other routes that
  // send mail or write a session.
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: 'Bad request' },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  const ip = getIP(request);
  const { success } = await authLimiter.limit(`signup_${ip}`);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many sign-up attempts. Please try again later.' },
      { status: 429, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const body = await request.json();
    const parsed = SignUpSchema.safeParse(body);
    if (!parsed.success) {
      // Zod renders a failed z.literal(true) as "Invalid literal value,
      // expected true", which tells a person nothing. The two consent fields
      // get their own message; everything else keeps Zod's.
      const failedConsent = parsed.error.issues.some(
        (issue) => issue.path[0] === 'acceptedTerms' || issue.path[0] === 'confirmedAge'
      );
      const message = failedConsent
        ? `Please confirm you are ${MINIMUM_AGE} or over and accept the terms.`
        : parsed.error.issues[0]?.message ?? 'Invalid email or password';
      return NextResponse.json({ error: message }, { status: 400, headers: NO_STORE_HEADERS });
    }

    // Pulled out by name rather than spread into signUp below: the consent
    // flags belong on our profile row, not in Supabase's auth payload.
    const { email, password } = parsed.data;

    // Checked before Supabase is called: no point creating an account and
    // then telling someone the password is unacceptable.
    const verdict = await assessPassword(password, email);
    if (!verdict.ok) {
      return NextResponse.json(
        { error: verdict.reason },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const cookieStore = await cookies();
    const { supabase, pending } = createBufferedServerClient(() => cookieStore.getAll());

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${siteOrigin(request)}/auth/callback` },
    });

    if (error) {
      console.error('Signup error:', error.message);
      // Don't echo the provider message back — "User already registered"
      // would turn this endpoint into an account-existence oracle.
      return NextResponse.json(
        { error: 'Could not create that account. Please try a different email.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    // Stamped now rather than on first sign-in: the agreement was made here,
    // and with email confirmation on it could otherwise be days before the
    // person comes back — or never. The profile row already exists by this
    // point, created by the on_auth_user_created trigger.
    //
    // Awaited, but it cannot fail the request: see lib/terms-acceptance.ts.
    if (data.user) await recordTermsAcceptance(data.user.id);

    const response = NextResponse.json(
      { needsConfirmation: !data.session },
      { headers: NO_STORE_HEADERS }
    );
    applyCookies(response, pending);
    return response;
  } catch (err) {
    Sentry.captureException(err);
    console.error('SIGNUP ERROR:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
