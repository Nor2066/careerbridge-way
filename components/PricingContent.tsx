'use client';

// components/PricingContent.tsx

import { useState } from 'react';
import { track } from '@/lib/analytics';
import { formatPrice as formatPriceIn, TAX_NOTES } from '@/lib/prices';
import { useI18n } from '@/components/I18nProvider';

type ProductType = 'basic' | 'full' | 'topup' | 'followup_unlock';

type AttemptStatus = 'none' | 'in_progress' | 'awaiting_followup_decision';

const PLAN_NAME_KEYS = {
  free: 'pricing.planName.free',
  basic: 'pricing.planName.basic',
  full: 'pricing.planName.full',
} as const;

interface PricingContentProps {
  compact?: boolean;
  currentPlan?: 'free' | 'basic' | 'full';
  onClose?: () => void;
  mainAttemptsRemaining?: number;
  bonusAttemptGranted?: boolean;
  // Whether the account-wide followup bundle has already been purchased.
  // Replaces the old followupsPaidCount/followupResultId per-attempt model.
  followupBundlePurchased?: boolean;
  currentAttemptStatus?: AttemptStatus;
  onBeforeCheckout?: (productType: ProductType) => void;
  // Where Stripe should send the customer back to. Defaults to the page the
  // button was clicked on, which is right almost everywhere; the followup
  // decision screen overrides it.
  returnPath?: string;
  // When true, renders a plain-language explanation of why the customer is
  // stuck and which purchase actually gets them moving again. Off by default
  // so the plain "choose a plan" surfaces stay uncluttered.
  showReasonNotice?: boolean;
}

export default function PricingContent({
  compact = false,
  currentPlan = 'free',
  onClose,
  mainAttemptsRemaining = 0,
  bonusAttemptGranted = false,
  followupBundlePurchased = false,
  currentAttemptStatus = 'none',
  onBeforeCheckout,
  returnPath,
  showReasonNotice = false,
}: PricingContentProps) {
  const { t, locale } = useI18n();
  const formatPrice = (product: ProductType) => formatPriceIn(product, locale);
  const TAX_NOTE = TAX_NOTES[locale];
  const oneTime = t('pricing.oneTime');
  const [loadingProduct, setLoadingProduct] = useState<ProductType | null>(null);
  const [error, setError] = useState('');
  const [needsSignIn, setNeedsSignIn] = useState(false);

  const startCheckout = async (productType: ProductType) => {
    setError('');
    setNeedsSignIn(false);
    setLoadingProduct(productType);

    // Default: return to wherever this button was clicked from. Callers
    // (like the decision screen) can override this via the returnPath prop
    // or via onBeforeCheckout, which runs AFTER this default is set.
    let path = returnPath || window.location.pathname;
    try {
      sessionStorage.setItem('checkoutReturnPath', path);
    } catch {
      /* private mode — the server-side copy in the session metadata covers us */
    }
    track('checkout_start', { product: productType });
    onBeforeCheckout?.(productType);
    // onBeforeCheckout may have rewritten the stored path (the followup
    // decision screen does exactly that), so re-read it before sending it
    // to the server — the server copy must match the browser copy.
    try {
      path = sessionStorage.getItem('checkoutReturnPath') || path;
    } catch {
      /* keep the value we already have */
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productType, returnPath: path }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          setNeedsSignIn(true);
          setError(t('pricing.error.session'));
        } else {
          setError(locale === 'en' && data.error ? data.error : t('pricing.error.checkout'));
        }
        setLoadingProduct(null);
        return;
      }

      if (!data.url) {
        setError(t('pricing.error.checkout'));
        setLoadingProduct(null);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError(t('common.error.network'));
      setLoadingProduct(null);
    }
  };

  const hasPlan = currentPlan !== 'free';
  const outOfAttempts = mainAttemptsRemaining <= 0;

  // Followups count as unlocked for the Full plan, for anyone who bought the
  // account-wide bundle, and for legacy accounts that unlocked them under the
  // old per-attempt pricing (which is what set bonus_attempt_granted).
  const followupsUnlocked =
    currentPlan === 'full' || followupBundlePurchased || bonusAttemptGranted;

  // Followup bundle: Basic plan only, one-time account-wide purchase.
  const showFollowupBundle = hasPlan && currentPlan === 'basic' && !followupBundlePurchased;

  // Top-up: only once attempts are exhausted, and only once followups are
  // unlocked — selling extra attempts to a Basic customer whose followups are
  // still locked sells them attempts they can only half-use. The checkout
  // route enforces the same rule server-side.
  const showTopup = hasPlan && outOfAttempts && followupsUnlocked;

  const showBasePlans = !hasPlan;
  const nothingToBuy = !showBasePlans && !showFollowupBundle && !showTopup;
  const awaitingFollowup = currentAttemptStatus === 'awaiting_followup_decision';

  // ─── Why am I stuck? ──────────────────────────────────────────────────
  // The single most confusing moment in this flow is starting another
  // questionnaire with no attempts left: the customer gets blocked without
  // being told what would actually unblock them. This spells it out.
  let notice: { title: string; body: string } | null = null;
  if (showReasonNotice) {
    if (awaitingFollowup) {
      notice = { title: t('pricing.notice.finishTitle'), body: t('pricing.notice.finishBody') };
    } else if (hasPlan && outOfAttempts && !followupsUnlocked) {
      notice = { title: t('pricing.notice.basicUsedTitle'), body: t('pricing.notice.basicUsedBody') };
    } else if (hasPlan && outOfAttempts) {
      notice = { title: t('pricing.notice.allUsedTitle'), body: t('pricing.notice.allUsedBody') };
    } else if (!hasPlan) {
      notice = { title: t('pricing.notice.choosePlanTitle'), body: t('pricing.notice.choosePlanBody') };
    }
  }

  return (
    <div className={compact ? '' : 'min-h-screen px-4 py-12'}>
      <div className={compact ? '' : 'max-w-4xl mx-auto'}>
        {!compact && (
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{t('pricing.title')}</h1>
            <p className="text-gray-300">
              {t('pricing.subtitle')}
            </p>
          </div>
        )}

        {compact && onClose && (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">{t('pricing.title')}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">
              &times;
            </button>
          </div>
        )}

        {notice && (
          <div className="mb-5 p-4 bg-indigo-900/40 border border-indigo-400/50 rounded-xl text-left">
            <p className="text-white font-semibold mb-1">{notice.title}</p>
            <p className="text-gray-200 text-sm leading-relaxed">{notice.body}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-900/40 border border-red-500 rounded-lg text-red-200 text-sm">
            {error}
            {needsSignIn && (
              <>
                {' '}
                <a
                  href={`/login?returnTo=${encodeURIComponent(
                    typeof window !== 'undefined' ? window.location.pathname : '/pricing'
                  )}`}
                  className="underline font-semibold hover:text-white"
                >
                  {t('pricing.signIn')}
                </a>
              </>
            )}
          </div>
        )}

        <div className={`grid gap-4 ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>

          {/* ─── Basic Plan ─────────────────────────────────────────────── */}
          {showBasePlans && (
            <div className="glass-card flex flex-col">
              <h3 className="text-xl font-bold text-white mb-1">{t('pricing.basic.name')}</h3>
              <p className="text-3xl font-bold text-white mb-4">
                {formatPrice('basic')} <span className="text-sm text-gray-400 font-normal">{oneTime} · {TAX_NOTE}</span>
              </p>
              <ul className="text-gray-300 text-sm space-y-2 mb-6 flex-1">
                <li>{t('pricing.basic.f1')}</li>
                <li>{t('pricing.basic.f2')}</li>
                <li>{t('pricing.basic.f3', { price: formatPrice('followup_unlock') })}</li>
              </ul>
              <button
                onClick={() => startCheckout('basic')}
                disabled={loadingProduct !== null}
                className="btn-primary w-full"
              >
                {loadingProduct === 'basic' ? t('pricing.redirecting') : t('pricing.basic.cta')}
              </button>
            </div>
          )}

          {/* ─── Full Plan ──────────────────────────────────────────────── */}
          {showBasePlans && (
            <div className="glass-card flex flex-col border-2 border-indigo-400">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-xl font-bold text-white">{t('pricing.full.name')}</h3>
                <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full">{t('pricing.full.badge')}</span>
              </div>
              <p className="text-3xl font-bold text-white mb-4">
                {formatPrice('full')} <span className="text-sm text-gray-400 font-normal">{oneTime} · {TAX_NOTE}</span>
              </p>
              <ul className="text-gray-300 text-sm space-y-2 mb-6 flex-1">
                <li>{t('pricing.full.f1')}</li>
                <li>{t('pricing.full.f2')}</li>
                <li>{t('pricing.full.f3')}</li>
                <li>{t('pricing.full.f4')}</li>
              </ul>
              <button
                onClick={() => startCheckout('full')}
                disabled={loadingProduct !== null}
                className="btn-primary w-full"
              >
                {loadingProduct === 'full' ? t('pricing.redirecting') : t('pricing.full.cta')}
              </button>
            </div>
          )}

          {/* ─── Followup Bundle (account-wide) ────────────────────────── */}
          {showFollowupBundle && (
            <div className="glass-card flex flex-col">
              <h3 className="text-xl font-bold text-white mb-1">{t('pricing.bundle.name')}</h3>
              <p className="text-3xl font-bold text-white mb-4">
                {formatPrice('followup_unlock')} <span className="text-sm text-gray-400 font-normal">{oneTime} · {TAX_NOTE}</span>
              </p>
              <ul className="text-gray-300 text-sm space-y-2 mb-6 flex-1">
                <li>{t('pricing.bundle.f1')}</li>
                <li>{t('pricing.bundle.f2')}</li>
                <li>{t('pricing.bundle.f3')}</li>
                <li>{t('pricing.bundle.f4')}</li>
              </ul>
              <button
                onClick={() => startCheckout('followup_unlock')}
                disabled={loadingProduct !== null}
                className="btn-primary w-full"
              >
                {loadingProduct === 'followup_unlock' ? t('pricing.redirecting') : t('pricing.bundle.cta', { price: formatPrice('followup_unlock') })}
              </button>
            </div>
          )}

          {/* ─── Top-up ─────────────────────────────────────────────────── */}
          {showTopup && (
            <div className="glass-card flex flex-col">
              <h3 className="text-xl font-bold text-white mb-1">{t('pricing.topup.name')}</h3>
              <p className="text-3xl font-bold text-white mb-4">
                {formatPrice('topup')} <span className="text-sm text-gray-400 font-normal">{oneTime} · {TAX_NOTE}</span>
              </p>
              <ul className="text-gray-300 text-sm space-y-2 mb-6 flex-1">
                <li>{t('pricing.topup.f1')}</li>
                <li>{t('pricing.topup.f2')}</li>
                <li>{t('pricing.topup.f3')}</li>
              </ul>
              <button
                onClick={() => startCheckout('topup')}
                disabled={loadingProduct !== null}
                className="btn-primary w-full"
              >
                {loadingProduct === 'topup' ? t('pricing.redirecting') : t('pricing.topup.cta', { price: formatPrice('topup') })}
              </button>
            </div>
          )}

          {/* Nothing left to sell: the account already has everything it
              needs right now. Say so plainly instead of rendering an empty
              grid (which is what the pricing page used to do for a Full-plan
              customer with attempts still on the clock). */}
          {nothingToBuy && (
            <div className="glass-card text-center py-8 sm:col-span-2 md:col-span-2">
              <p className="text-white font-medium mb-1">
                {t('pricing.active.plan', { plan: t(PLAN_NAME_KEYS[currentPlan]) })}
              </p>
              <p className="text-gray-300 text-sm mb-1">
                {t('pricing.active.attempts', { count: mainAttemptsRemaining })}
                {followupsUnlocked ? t('pricing.active.followupsUnlocked') : ''}
              </p>
              <p className="text-gray-400 text-sm">
                {awaitingFollowup ? t('pricing.active.finishFollowup') : t('pricing.active.nothing')}
              </p>
              {/* Never offer "continue to my assessment" to someone who is
                  blocked from starting one — history is where the pending
                  followup actually lives. */}
              {awaitingFollowup ? (
                <a href="/history" className="btn-primary mt-5 inline-block">
                  {t('pricing.active.goHistory')}
                </a>
              ) : onClose ? (
                <button onClick={onClose} className="btn-primary mt-5">
                  {t('pricing.active.continue')}
                </button>
              ) : (
                <a href="/assess" className="btn-primary mt-5 inline-block">
                  {t('pricing.active.continueAssessment')}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
