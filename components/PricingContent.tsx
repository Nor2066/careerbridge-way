'use client';

// components/PricingContent.tsx

import { useState } from 'react';

type ProductType = 'basic' | 'full' | 'topup' | 'followup_unlock';

interface PricingContentProps {
  compact?: boolean;
  currentPlan?: 'free' | 'basic' | 'full';
  followupResultId?: string;
  onClose?: () => void;
  followupsPaidCount?: number;
  mainAttemptsRemaining?: number;
  bonusAttemptGranted?: boolean;
  // Optional callback fired just before the Stripe redirect. Use it to
  // persist any sessionStorage data that needs to survive the redirect
  // (e.g. topClusters so the followup page can load after payment).
  onBeforeCheckout?: (productType: ProductType) => void;
}

export default function PricingContent({
  compact = false,
  currentPlan = 'free',
  followupResultId,
  onClose,
  followupsPaidCount = 0,
  mainAttemptsRemaining = 0,
  bonusAttemptGranted = false,
  onBeforeCheckout,
}: PricingContentProps) {
  const [loadingProduct, setLoadingProduct] = useState<ProductType | null>(null);
  const [error, setError] = useState('');

  const startCheckout = async (productType: ProductType) => {
    setError('');
    setLoadingProduct(productType);
    try {
      // Call the optional pre-checkout hook — lets the parent store any
      // sessionStorage data needed after the Stripe redirect (e.g. topClusters).
      onBeforeCheckout?.(productType);

      // For followup_unlock: redirect to /followup after payment so the user
      // lands directly in the followup questionnaire, not back on the page
      // they came from (history or assess). For all other products, return
      // to wherever the user was (assess page, pricing page, etc.).
      const returnPath = productType === 'followup_unlock' ? '/followup' : window.location.pathname;
      sessionStorage.setItem('checkoutReturnPath', returnPath);

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productType,
          ...(productType === 'followup_unlock' && followupResultId
            ? { resultId: followupResultId }
            : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Could not start checkout. Please try again.');
        setLoadingProduct(null);
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      setError('Network error. Please try again.');
      setLoadingProduct(null);
    }
  };

  const hasPlan = currentPlan !== 'free';

  // Top-up logic:
  // Full plan:  attempts exhausted → show top-up (already working, unchanged)
  // Basic plan: show top-up only after the user has truly exhausted everything —
  //             meaning they paid both followups (followupsPaidCount >= 2),
  //             the bonus attempt was granted AND used up (bonusAttemptGranted === true),
  //             and no attempts remain.
  //             Journey: Basic €3 (2 attempts) + followup ×2 €3 + bonus attempt used = €6 spent.
  const showTopup =
    hasPlan &&
    mainAttemptsRemaining === 0 &&
    (
      currentPlan === 'full' ||
      (currentPlan === 'basic' && followupsPaidCount >= 2 && bonusAttemptGranted)
    );

  const showFollowupUnlock =
    hasPlan &&
    currentPlan === 'basic' &&
    !!followupResultId;

  return (
    <div className={compact ? '' : 'min-h-screen px-4 py-12'}>
      <div className={compact ? '' : 'max-w-4xl mx-auto'}>
        {!compact && (
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Choose Your Plan</h1>
            <p className="text-gray-300">
              Unlock your personalized career assessment and AI-powered career roadmap.
            </p>
          </div>
        )}

        {compact && onClose && (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Choose Your Plan</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">
              &times;
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-900/40 border border-red-500 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>

          {/* ─── Basic Plan ─────────────────────────────────────────────── */}
          {!hasPlan && (
            <div className="glass-card flex flex-col">
              <h3 className="text-xl font-bold text-white mb-1">Basic</h3>
              <p className="text-3xl font-bold text-white mb-4">
                €3.00 <span className="text-sm text-gray-400 font-normal">one-time</span>
              </p>
              <ul className="text-gray-300 text-sm space-y-2 mb-6 flex-1">
                <li>✓ 2 main assessment attempts</li>
                <li>✓ AI career report for each attempt</li>
                <li>✓ Unlock followup roadmap per attempt for €1.50</li>
                <li>✓ Pay both followups (€6 total) → get +1 bonus attempt</li>
              </ul>
              <button
                onClick={() => startCheckout('basic')}
                disabled={loadingProduct !== null}
                className="btn-primary w-full"
              >
                {loadingProduct === 'basic' ? 'Redirecting...' : 'Choose Basic'}
              </button>
            </div>
          )}

          {/* ─── Full Plan ──────────────────────────────────────────────── */}
          {!hasPlan && (
            <div className="glass-card flex flex-col border-2 border-indigo-400">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-xl font-bold text-white">Full</h3>
                <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full">Best value</span>
              </div>
              <p className="text-3xl font-bold text-white mb-4">
                €4.50 <span className="text-sm text-gray-400 font-normal">one-time</span>
              </p>
              <ul className="text-gray-300 text-sm space-y-2 mb-6 flex-1">
                <li>✓ 3 complete assessment attempts</li>
                <li>✓ Main + followup questionnaires included</li>
                <li>✓ Both AI reports for every attempt</li>
                <li>✓ No additional unlocks needed</li>
              </ul>
              <button
                onClick={() => startCheckout('full')}
                disabled={loadingProduct !== null}
                className="btn-primary w-full"
              >
                {loadingProduct === 'full' ? 'Redirecting...' : 'Choose Full'}
              </button>
            </div>
          )}

          {/* ─── Followup unlock ────────────────────────────────────────── */}
          {showFollowupUnlock && (
            <div className="glass-card flex flex-col">
              <h3 className="text-xl font-bold text-white mb-1">Unlock Followup</h3>
              <p className="text-3xl font-bold text-white mb-4">
                €1.50 <span className="text-sm text-gray-400 font-normal">one-time</span>
              </p>
              <ul className="text-gray-300 text-sm space-y-2 mb-6 flex-1">
                <li>✓ Unlock the followup questionnaire for this attempt</li>
                <li>✓ Get your detailed career roadmap</li>
                {followupsPaidCount === 1 ? (
                  <li>✓ This is your 2nd unlock — grants +1 bonus attempt!</li>
                ) : (
                  <li>✓ Unlock both followups to earn a bonus attempt</li>
                )}
              </ul>
              <button
                onClick={() => startCheckout('followup_unlock')}
                disabled={loadingProduct !== null}
                className="btn-primary w-full"
              >
                {loadingProduct === 'followup_unlock' ? 'Redirecting...' : 'Unlock Followup — €1.50'}
              </button>
            </div>
          )}

          {/* ─── Top-up ─────────────────────────────────────────────────── */}
          {showTopup && (
            <div className="glass-card flex flex-col">
              <h3 className="text-xl font-bold text-white mb-1">Extra Attempt</h3>
              <p className="text-3xl font-bold text-white mb-4">
                €1.00 <span className="text-sm text-gray-400 font-normal">per attempt</span>
              </p>
              <ul className="text-gray-300 text-sm space-y-2 mb-6 flex-1">
                <li>✓ +1 complete attempt (main + followup)</li>
                <li>✓ Buy as many as you need</li>
                <li>✓ Use anytime, no expiry</li>
              </ul>
              <button
                onClick={() => startCheckout('topup')}
                disabled={loadingProduct !== null}
                className="btn-primary w-full"
              >
                {loadingProduct === 'topup' ? 'Redirecting...' : 'Buy Extra Attempt — €1.00'}
              </button>
            </div>
          )}

          {/* ─── Basic user with no resultId: direct to history ─────────── */}
          {hasPlan && currentPlan === 'basic' && !followupResultId && !showTopup && (
            <div className="glass-card flex flex-col items-center text-center">
              <h3 className="text-xl font-bold text-white mb-2">Unlock a Followup</h3>
              <p className="text-gray-300 text-sm mb-4">
                Go to your history page to unlock the followup questionnaire
                for a specific attempt (€1.50 each).
                {followupsPaidCount === 1 && (
                  <span className="block mt-2 text-indigo-300">
                    You have unlocked 1 of 2 — unlock the second to earn a bonus attempt!
                  </span>
                )}
              </p>
              <a href="/history" className="btn-primary">
                Go to History Page
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}