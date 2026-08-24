import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Read-only Supabase client bound to the current request's cookies.
 *
 * Removed the debug logging that printed every cookie name on the request
 * (and flagged Supabase ones by name) to the server console on each call —
 * that put the shape of the session into logs for no ongoing benefit.
 *
 * Also switched from the deprecated get/set/remove cookie adapter to getAll /
 * setAll. The old form couldn't see chunked cookies, so a session large enough
 * to be split across `sb-<ref>-auth-token.0` / `.1` looked to it like no
 * session at all.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        // Server components can't set cookies; refreshing is the proxy's job.
        setAll: () => {},
      },
    }
  );
}
