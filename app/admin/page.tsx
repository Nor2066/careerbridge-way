// app/admin/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getUserRole, isAdmin } from '@/lib/roles';
import AdminDashboard from './AdminDashboard';

// Server component — verifies auth AND admin role before rendering anything.
// This is a second layer on top of proxy.ts — defence in depth.
export default async function AdminPage() {
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

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  // Same source of truth as proxy.ts and the /api/admin/* routes: the
  // profiles table. Reading app_metadata.role here meant a 'superadmin' was
  // turned away from a dashboard whose own API routes would have served them.
  const role = await getUserRole(user.id);
  if (!isAdmin(role)) redirect('/');

  return <AdminDashboard />;
}