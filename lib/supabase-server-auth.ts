import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from './supabase-server-client';

export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    console.error('Auth error:', error);
    return null;
  }
  return user;
}
export async function getAuthenticatedUser() {
  // Cast to any to bypass TypeScript's incorrect inference
  const cookieStore = (await cookies()) as any;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
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