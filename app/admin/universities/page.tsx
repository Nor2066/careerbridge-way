// app/admin/universities/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getUserRole, isAdmin } from '@/lib/roles';
import UniversitiesAdmin from './UniversitiesAdmin';

// Same two layers as /admin: proxy.ts turns away anyone who is not an admin,
// and this checks again before rendering.
export default async function AdminUniversitiesPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const role = await getUserRole(user.id);
  if (!isAdmin(role)) redirect('/');

  return <UniversitiesAdmin />;
}
