'use client';

// app/payment/success/page.tsx
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    // Give the Stripe webhook a moment to process before we let the user continue.
    // The webhook usually fires within 1-2 seconds of checkout completion.
    const timer = setTimeout(() => setVerifying(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    // Return to where the user was. We use sessionStorage to remember
    // the "return path" — set this before redirecting to Stripe checkout.
    const returnPath = sessionStorage.getItem('checkoutReturnPath') || '/assess';
    sessionStorage.removeItem('checkoutReturnPath');
    router.push(returnPath);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/bg-assess.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 max-w-md w-full">
        <div className="glass-card text-center">
          <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
          <p className="text-gray-300 mb-6">
            {verifying
              ? 'Setting up your account...'
              : 'Your purchase has been applied to your account.'}
          </p>
          <button
            onClick={handleContinue}
            disabled={verifying}
            className="btn-primary w-full"
          >
            {verifying ? 'Please wait...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}