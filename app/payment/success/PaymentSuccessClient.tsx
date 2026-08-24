'use client';

// app/payment/success/PaymentSuccessClient.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type ProductType = 'basic' | 'full' | 'followup_unlock' | 'topup';

type VerifyState = 'verifying' | 'complete' | 'pending' | 'error' | 'unauthenticated';

const PRODUCT_LABELS: Record<ProductType, string> = {
  basic: 'Basic plan — 2 assessment attempts added',
  full: 'Full plan — 3 complete attempts added',
  followup_unlock: 'All followups unlocked, plus 1 bonus attempt',
  topup: '3 extra attempts added',
};

const DESTINATION_LABELS: Record<string, string> = {
  '/assess': 'your assessment',
  '/followup': 'your followup questionnaire',
  '/history': 'your history',
  '/pricing': 'the pricing page',
};

// Polling schedule for the verify call, in ms. Stripe's webhook normally
// lands within a second or two; this gives it roughly 25 seconds in total
// before we stop waiting and let the customer through anyway.
const RETRY_DELAYS = [1500, 2000, 3000, 4000, 6000, 8000];

export default function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [state, setState] = useState<VerifyState>(sessionId ? 'verifying' : 'complete');
  const [productType, setProductType] = useState<ProductType | null>(null);
  // Only ever set from the verify response. sessionStorage is read at the
  // moment of navigating instead, so nothing here differs between the server
  // render and the first client render.
  const [returnPath, setReturnPath] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const navigatedRef = useRef(false);
  const attemptRef = useRef(0);

  // The path the customer came from. The server echoes back the copy it
  // stored in the Stripe session metadata, which is the reliable one —
  // sessionStorage is only a fallback for sessions created before this
  // existed, or if the metadata somehow went missing.
  const resolveReturnPath = useCallback(() => {
    if (returnPath) return returnPath;
    try {
      const stored = sessionStorage.getItem('checkoutReturnPath');
      if (stored && stored.startsWith('/') && !stored.startsWith('//')) return stored;
    } catch {
      /* private mode — fall through to the default */
    }
    return '/assess';
  }, [returnPath]);

  const goToReturnPath = useCallback(() => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    const path = resolveReturnPath();
    try {
      sessionStorage.removeItem('checkoutReturnPath');
    } catch {
      /* private mode — nothing to clean up */
    }
    // Full browser navigation (not router.push) — a client-side transition
    // was occasionally landing users on /login right after a successful
    // payment, since the server component's auth check could run before
    // the session cookie was fully ready. A full navigation always sends
    // the current, complete set of cookies with the request.
    window.location.href = path;
  }, [resolveReturnPath]);

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const verify = async () => {
      try {
        const res = await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;

        if (res.status === 401) {
          setState('unauthenticated');
          return;
        }

        if (!res.ok) {
          setErrorMessage(data.error || 'We could not confirm your payment automatically.');
          setState('error');
          return;
        }

        if (data.returnPath) setReturnPath(data.returnPath);
        if (data.productType) setProductType(data.productType);

        if (data.status === 'complete') {
          setState('complete');
          return;
        }

        // Still pending — try again unless we've run out of patience.
        if (attemptRef.current < RETRY_DELAYS.length) {
          const delay = RETRY_DELAYS[attemptRef.current];
          attemptRef.current += 1;
          timer = setTimeout(verify, delay);
        } else {
          setState('pending');
        }
      } catch {
        if (cancelled) return;
        if (attemptRef.current < RETRY_DELAYS.length) {
          const delay = RETRY_DELAYS[attemptRef.current];
          attemptRef.current += 1;
          timer = setTimeout(verify, delay);
        } else {
          setErrorMessage('We could not reach the server to confirm your payment.');
          setState('error');
        }
      }
    };

    verify();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [sessionId]);

  // Once the purchase is confirmed on the account, take the customer straight
  // back to where they started. The button below stays as a manual fallback.
  useEffect(() => {
    if (state !== 'complete') return;
    const timer = setTimeout(() => goToReturnPath(), 1500);
    return () => clearTimeout(timer);
  }, [state, goToReturnPath]);

  // Before the verify call answers, the destination is still unknown — the
  // neutral wording covers that, and the click handler resolves the real
  // path from sessionStorage if the server never supplied one.
  const destinationLabel = (returnPath && DESTINATION_LABELS[returnPath]) || 'where you left off';

  const heading =
    state === 'error' || state === 'unauthenticated'
      ? 'Payment received'
      : 'Payment Successful!';

  let bodyText: string;
  switch (state) {
    case 'verifying':
      bodyText = 'Confirming your payment and setting up your account...';
      break;
    case 'complete':
      bodyText = productType
        ? `${PRODUCT_LABELS[productType]}. Taking you back to ${destinationLabel}...`
        : `Your purchase has been applied to your account. Taking you back to ${destinationLabel}...`;
      break;
    case 'pending':
      bodyText =
        "Your payment is still being processed by your bank. It usually clears within a few minutes — you can carry on, and your purchase will appear on your account as soon as it settles.";
      break;
    case 'unauthenticated':
      bodyText =
        'Your payment went through, but your sign-in session expired while you were on Stripe. Sign in again and your purchase will be waiting on your account.';
      break;
    default:
      bodyText =
        errorMessage +
        ' Your payment was not lost — if the purchase does not show up within a few minutes, contact us with your receipt and we will sort it out.';
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/bg-assess.webp')" }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 max-w-md w-full">
        <div className="glass-card text-center">
          <div
            className={`inline-block p-3 rounded-full mb-4 ${
              state === 'error' || state === 'pending' || state === 'unauthenticated'
                ? 'bg-amber-100'
                : 'bg-green-100'
            }`}
          >
            {state === 'error' || state === 'pending' || state === 'unauthenticated' ? (
              <svg className="w-8 h-8 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{heading}</h1>
          <p className="text-gray-300 mb-6">{bodyText}</p>

          {state === 'unauthenticated' ? (
            <a
              href={`/login?returnTo=${encodeURIComponent(returnPath || '/assess')}`}
              className="btn-primary w-full block"
            >
              Sign in again
            </a>
          ) : (
            <button
              onClick={() => goToReturnPath()}
              disabled={state === 'verifying'}
              className="btn-primary w-full"
            >
              {state === 'verifying' ? 'Please wait...' : `Continue to ${destinationLabel}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
