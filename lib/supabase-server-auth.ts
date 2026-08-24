import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * The current user, or null. Verified against Supabase rather than decoded
 * from the cookie, so a forged cookie doesn't get through.
 *
 * Switched from the deprecated get/set/remove cookie adapter (which needed an
 * `as any` cast and couldn't read chunked cookies) to getAll / setAll.
 */
export async function getAuthenticatedUser() {
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
  if (error || !user) return null;
  return user;
}
