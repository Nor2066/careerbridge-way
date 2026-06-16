// app/payment/cancelled/page.tsx
import { Suspense } from 'react';
import PaymentCancelledClient from './PaymentCancelledClient';

export default function PaymentCancelledPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <PaymentCancelledClient />
    </Suspense>
  );
}