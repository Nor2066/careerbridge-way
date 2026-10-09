'use client';

// app/payment/success/PaymentSuccessClient.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { track } from '@/lib/analytics';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '@/components/I18nProvider';
import type { MessageKey } from '@/lib/i18n/messages';

type ProductType = 'basic' | 'full' | 'followup_unlock' | 'topup';

type VerifyState = 'verifying' | 'complete' | 'pending' | 'error' | 'unauthenticated';

const PRODUCT_LABELS: Record<ProductType, MessageKey> = {
  basic: 'payment.product.basic',
  full: 'payment.product.full',
  followup_unlock: 'payment.product.followup_unlock',
  topup: 'payment.product.topup',
};

const DESTINATION_LABELS: Record<string, MessageKey> = {
  '/assess': 'payment.dest./assess',
  '/followup': 'payment.dest./followup',
  '/history': 'payment.dest./history',
  '/pricing': 'payment.dest./pricing',
};

// Polling schedule for the verify call, in ms. Stripe's webhook normally
// lands within a second or two; this gives it roughly 25 seconds in total
// before we stop waiting and let the customer through anyway.
const RETRY_DELAYS = [1500, 2000, 3000, 4000, 6000, 8000];

export default function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { t, locale } = useI18n();

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
          // Kept as the server's English text; worded at render, where the
          // language is known.
          setErrorMessage(data.error || 'VERIFY');
          setState('error');
          return;
        }

        if (data.returnPath) setReturnPath(data.returnPath);
        if (data.productType) setProductType(data.productType);

        if (data.status === 'complete') {
          track('purchase_complete', { product: data.productType ?? null });
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
          setErrorMessage('UNREACHABLE');
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
  const destinationLabel = t((returnPath && DESTINATION_LABELS[returnPath]) || 'payment.dest.default');

  const heading =
    state === 'error' || state === 'unauthenticated'
      ? t('payment.heading.received')
      : t('payment.heading.success');

  const errorText =
    errorMessage === 'UNREACHABLE'
      ? t('payment.error.unreachable')
      : errorMessage === 'VERIFY' || locale !== 'en'
        ? t('payment.error.verify')
        : errorMessage;

  let bodyText: string;
  switch (state) {
    case 'verifying':
      bodyText = t('payment.body.verifying');
      break;
    case 'complete':
      bodyText = productType
        ? t('payment.body.completeProduct', { product: t(PRODUCT_LABELS[productType]), destination: destinationLabel })
        : t('payment.body.complete', { destination: destinationLabel });
      break;
    case 'pending':
      bodyText = t('payment.body.pending');
      break;
    case 'unauthenticated':
      bodyText = t('payment.body.unauthenticated');
      break;
    default:
      bodyText = errorText + t('payment.error.reassure');
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
              {t('payment.signInAgain')}
            </a>
          ) : (
            <button
              onClick={() => goToReturnPath()}
              disabled={state === 'verifying'}
              className="btn-primary w-full"
            >
              {state === 'verifying' ? t('common.pleaseWait') : t('payment.continueTo', { destination: destinationLabel })}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
