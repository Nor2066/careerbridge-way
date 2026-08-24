'use client';

// app/payment/cancelled/PaymentCancelledClient.tsx
import { useSearchParams } from 'next/navigation';

// Same-site paths only — this value reaches us through a query string, so
// "https://evil.com" and protocol-relative "//evil.com" must not be followed.
function safePath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith('/')) return null;
  if (value.startsWith('//')) return null;
  if (value.includes('\\')) return null;
  return value;
}

const DESTINATION_LABELS: Record<string, string> = {
  '/assess': 'Back to my assessment',
  '/followup': 'Back to my followup',
  '/history': 'Back to my history',
  '/pricing': 'Back to Pricing',
};

export default function PaymentCancelledClient() {
  const searchParams = useSearchParams();

  // The query string is the reliable copy — it came back from Stripe with the
  // redirect, so it survives even when the return trip lands in a fresh tab
  // with no sessionStorage. It is also the same on the server and the client,
  // so it can be read during render without a hydration mismatch.
  const queryPath = safePath(searchParams.get('return'));

  const handleBack = () => {
    // sessionStorage is only consulted here, at click time, as a fallback for
    // checkout sessions created before the return path travelled in the URL.
    let target = queryPath;
    try {
      if (!target) target = safePath(sessionStorage.getItem('checkoutReturnPath'));
      sessionStorage.removeItem('checkoutReturnPath');
    } catch {
      /* private mode — nothing stored, nothing to clean up */
    }
    // Full navigation rather than router.push, for the same reason the
    // success page uses one: the destination pages are server components
    // with their own auth check, and a full request always carries the
    // complete, current cookie set.
    window.location.href = target || '/pricing';
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/bg-assess.webp')" }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 max-w-md w-full">
        <div className="glass-card text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Payment Cancelled</h1>
          <p className="text-gray-300 mb-6">
            No charge was made, and nothing you&apos;ve already answered was lost.
            You can pick up right where you left off whenever you&apos;re ready.
          </p>
          <button onClick={handleBack} className="btn-primary w-full">
            {(queryPath && DESTINATION_LABELS[queryPath]) || 'Go back'}
          </button>
        </div>
      </div>
    </div>
  );
}
