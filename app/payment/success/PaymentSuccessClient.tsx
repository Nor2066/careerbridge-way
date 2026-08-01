'use client';

// app/payment/success/PaymentSuccessClient.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentSuccessClient() {
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVerifying(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    const returnPath = sessionStorage.getItem('checkoutReturnPath') || '/assess';
    sessionStorage.removeItem('checkoutReturnPath');
    // Full browser navigation (not router.push) — a client-side transition
    // was occasionally landing users on /login right after a successful
    // payment, since the server component's auth check could run before
    // the session cookie was fully ready. A full navigation always sends
    // the current, complete set of cookies with the request.
    window.location.href = returnPath;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/bg-assess.webp')" }}
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