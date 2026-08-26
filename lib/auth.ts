// lib/auth.ts
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { UnauthorizedError, EmailNotVerifiedError } from '@/lib/api-errors';

// Accepts EITHER a Bearer token from the Authorization header OR the session
// cookie. The cookie is now the normal path for everything in the browser:
// since the session is httpOnly, client code has no token to send and relies
// on `credentials: 'include'` instead. The Bearer branch is kept for
// server-to-server callers that hold a token of their own.
//
// Both branches verify the token with Supabase rather than decoding it
// locally, so neither a forged cookie nor a forged header gets through.
export async function requireAuth(request?: Request) {
  // ── Try Bearer token first ───────────────────────────────────────────
  if (request) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '').trim();

    if (token) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) return user;
    }
  }

  // ── Fall back to cookie-based session ───────────────────────────────
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  // Typed so callers can answer 401 for a missing session and keep 500 for a
  // genuine fault — see lib/api-errors.ts.
  if (error || !user) throw new UnauthorizedError();
  return user;
}

/**
 * Has this account proved it owns its email address?
 *
 * Supabase sets email_confirmed_at when the link is clicked -- and also
 * immediately at signup when "Confirm email" is switched off in the dashboard,
 * so this check is safe either way rather than locking everybody out if the
 * toggle is off. Google sign-ins arrive already confirmed, because Google has
 * done the proving.
 */
export function isEmailVerified(user: { email_confirmed_at?: string | null; confirmed_at?: string | null }): boolean {
  return Boolean(user.email_confirmed_at ?? user.confirmed_at);
}

/**
 * requireAuth, plus proof that the address is real.
 *
 * Used on the routes that spend money -- ours on OpenAI, or the customer's at
 * checkout. Without it, someone can sign up as notreal@nowhere.test and pay:
 * their receipt, their sign-in links, and every password reset then go to an
 * address that does not exist, and the first thing they do about it is call
 * their bank rather than us.
 *
 * Deliberately NOT applied to taking the questionnaire. Someone should be able
 * to try the product before proving anything; the gate belongs at the point
 * where a real address starts to matter.
 */
export async function requireVerifiedAuth(request?: Request) {
  const user = await requireAuth(request);
  if (!isEmailVerified(user)) throw new EmailNotVerifiedError();
  return user;
}
