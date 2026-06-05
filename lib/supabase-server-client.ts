import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  // Debug: log all cookie names
  console.log('Server-side cookies:', cookieStore.getAll().map(c => c.name));
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const value = cookieStore.get(name)?.value;
          if (name.includes('supabase')) console.log(`Found supabase cookie: ${name}`);
          return value;
        },
        set() {},
        remove() {},
      },
    }
  );
}