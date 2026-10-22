// app/payment/cancelled/page.tsx
import { Suspense } from 'react';
import PaymentCancelledClient from './PaymentCancelledClient';
import { pageMetadata } from '@/lib/i18n/server';

export function generateMetadata() {
  return pageMetadata('meta.paymentCancelled.title');
}

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