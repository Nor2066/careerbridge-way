// app/pricing/page.tsx
//
// Open to everyone. It used to send signed-out visitors to the login page,
// although it is in the sitemap: someone deciding whether to start should
// see what it costs without making an account first.
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import PricingContent from '@/components/PricingContent';
import { getSubscription } from '@/lib/subscription';
import { getLicence } from '@/lib/institutions';
import { pageMetadata } from '@/lib/i18n/server';

export function generateMetadata() {
  return pageMetadata('meta.pricing.title', { index: true });
}

function Backdrop({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/bg-assess.webp')" }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

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
  if (!user) {
    return (
      <Backdrop>
        <PricingContent signedOut />
      </Backdrop>
    );
  }

  const [sub, licence] = await Promise.all([getSubscription(user.id), getLicence(user)]);

  return (
    <Backdrop>
      <PricingContent
        currentPlan={sub.plan}
        mainAttemptsRemaining={sub.main_attempts_remaining}
        bonusAttemptGranted={sub.bonus_attempt_granted}
        followupBundlePurchased={sub.followup_bundle_purchased}
        currentAttemptStatus={sub.current_attempt_status}
        showReasonNotice
        university={
          licence?.active && licence.attemptsRemaining > 0
            ? { name: licence.institution.name, attemptsRemaining: licence.attemptsRemaining }
            : null
        }
      />
    </Backdrop>
  );
}