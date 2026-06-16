'use client';

// app/payment/cancelled/page.tsx
import { useRouter } from 'next/navigation';

export default function PaymentCancelledPage() {
  const router = useRouter();

  const handleBack = () => {
    const returnPath = sessionStorage.getItem('checkoutReturnPath') || '/pricing';
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
          <h1 className="text-2xl font-bold text-white mb-2">Payment Cancelled</h1>
          <p className="text-gray-300 mb-6">
            No charge was made. You can try again whenever you're ready.
          </p>
          <button onClick={handleBack} className="btn-primary w-full">
            Back to Pricing
          </button>
        </div>
      </div>
    </div>
  );
}