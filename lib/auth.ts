// lib/auth.ts
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

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
  if (error || !user) throw new Error('Unauthorized');
  return user;
}