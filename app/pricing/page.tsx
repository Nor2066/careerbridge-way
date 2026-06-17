// app/pricing/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import PricingContent from '@/components/PricingContent';
import { getSubscription } from '@/lib/subscription';

export default async function PricingPage() {
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
  if (!user) redirect('/login');

  const sub = await getSubscription(user.id);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/bg-assess.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10">
        <PricingContent
          currentPlan={sub.plan}
          followupsPaidCount={sub.followups_paid_count}
          mainAttemptsRemaining={sub.main_attempts_remaining}
        />
      </div>
    </div>
  );
}