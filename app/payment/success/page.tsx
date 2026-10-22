// app/payment/success/page.tsx
import { Suspense } from 'react';
import PaymentSuccessClient from './PaymentSuccessClient';
import { pageMetadata } from '@/lib/i18n/server';

export function generateMetadata() {
  return pageMetadata('meta.paymentSuccess.title');
}

// Suspense wrapper required because the client component uses useSearchParams()
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <PaymentSuccessClient />
    </Suspense>
  );
}