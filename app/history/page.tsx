// app/history/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import HistoryClient from './HistoryClient';

// This is a SERVER component — auth is verified before any HTML is sent to the browser.
// If the user is not logged in, they are redirected server-side and never see this page.
export default async function HistoryPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {}, // read-only in server components
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Server-side redirect — unauthenticated users never receive the page HTML
  if (!user) redirect('/login');

  // Pass the verified user id down to the client component
  return <HistoryClient userId={user.id} />;
}
