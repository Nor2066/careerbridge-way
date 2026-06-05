import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  // Use type assertion to bypass TypeScript's incomplete type
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return (cookieStore as any).get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}