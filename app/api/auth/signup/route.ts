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

export const dynamic = 'force-dynamic';

const SignUpSchema = z.object({
  email: z.string().email().max(320),
  // Length and content rules live in lib/password.ts, checked below by
  // assessPassword — including the breached-password lookup, which needs a
  // network call and so cannot live in a Zod schema. Here we only bound the
  // input so an enormous body never reaches the hashing step.
  password: z.string().min(1).max(MAX_PASSWORD_LENGTH),
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
    const parsed = SignUpSchema.safeParse(await request.json());
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Invalid email or password';
      return NextResponse.json({ error: message }, { status: 400, headers: NO_STORE_HEADERS });
    }

    // Checked before Supabase is called: no point creating an account and
    // then telling someone the password is unacceptable.
    const verdict = await assessPassword(parsed.data.password, parsed.data.email);
    if (!verdict.ok) {
      return NextResponse.json(
        { error: verdict.reason },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const cookieStore = await cookies();
    const { supabase, pending } = createBufferedServerClient(() => cookieStore.getAll());

    const { data, error } = await supabase.auth.signUp({
      ...parsed.data,
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
