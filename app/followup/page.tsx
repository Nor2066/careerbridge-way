// app/followup/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import FollowUpClient from './FollowUpClient';

export default async function FollowUpPage() {
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

  // Pass returnTo so a payment-triggered redirect to login lands the user
  // back on /followup instead of the homepage — fixes the "dropped at main
  // questionnaire after followup payment" bug.
  if (!user) redirect('/login?returnTo=/followup');

  return <FollowUpClient />;
}