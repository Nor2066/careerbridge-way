// lib/email-locale.ts
//
// The language Supabase writes its emails in. Its templates
// (lib/auth-email-templates.ts) read it from the user's metadata as
// .Data.locale, so it has to be stored there: at sign-up, and again whenever
// someone signs in with the site set to the other language, so that a later
// password reset arrives in the language they actually use.

import type { Locale } from '@/lib/i18n/config';

type SessionLike = {
  access_token: string;
  user: { user_metadata?: Record<string, unknown> | null };
};

/**
 * Stores `locale` on the signed-in user if it differs. Best effort: a sign-in
 * never fails over this. Calls Supabase's user endpoint with the new session's
 * token directly, because the server client only reads the request's cookies
 * and so cannot see a session it created a moment ago.
 */
export async function rememberEmailLocale(session: SessionLike, locale: Locale): Promise<void> {
  if (session.user.user_metadata?.locale === locale) return;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      // Supabase merges `data` into the existing metadata.
      body: JSON.stringify({ data: { locale } }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error('EMAIL LOCALE: could not store the language', res.status);
  } catch (err) {
    console.error('EMAIL LOCALE: could not store the language:', err);
  }
}
