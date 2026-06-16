'use client';

// components/PricingContent.tsx
// Reusable pricing display + checkout trigger. Used both as a full page
// (/pricing) and as an overlay modal when a user hits a paywall.

import { useState } from 'react';

type ProductType = 'basic' | 'full' | 'topup' | 'followup_unlock';

interface PricingContentProps {
  // If true, renders compact (for modal use). If false, renders full page layout.
  compact?: boolean;
  // Current plan — hides Basic/Full if user already purchased one
  currentPlan?: 'free' | 'basic' | 'full';
  // For followup_unlock purchases — which result_id to unlock
  followupResultId?: string;
  // Called when user closes the modal (only relevant when compact)
  onClose?: () => void;
}

export default function PricingContent({
  compact = false,
  currentPlan = 'free',
  followupResultId,
  onClose,
}: PricingContentProps) {
  const [loadingProduct, setLoadingProduct] = useState<ProductType | null>(null);
  const [error, setError] = useState('');

  const startCheckout = async (productType: ProductType) => {
    setError('');
    setLoadingProduct(productType);
    try {
      // Remember where to return the user after Stripe checkout completes
      sessionStorage.setItem('checkoutReturnPath', window.location.pathname);

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

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError('Network error. Please try again.');
      setLoadingProduct(null);
    }
  };

  const hasPlan = currentPlan !== 'free';

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

          {/* ─── Followup unlock (only relevant if a resultId is passed) ── */}
          {hasPlan && currentPlan === 'basic' && followupResultId && (
            <div className="glass-card flex flex-col">
              <h3 className="text-xl font-bold text-white mb-1">Unlock Followup</h3>
              <p className="text-3xl font-bold text-white mb-4">
                €1.50 <span className="text-sm text-gray-400 font-normal">one-time</span>
              </p>
              <ul className="text-gray-300 text-sm space-y-2 mb-6 flex-1">
                <li>✓ Unlock the followup questionnaire for this attempt</li>
                <li>✓ Get your detailed career roadmap</li>
                <li>✓ Unlocking both attempts' followups grants +1 bonus attempt</li>
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

          {/* ─── Top-up (shown once user has a plan) ───────────────────── */}
          {hasPlan && (
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
        </div>

        {hasPlan && currentPlan === 'basic' && !followupResultId && (
          <p className="text-center text-gray-400 text-sm mt-6">
            To unlock a followup roadmap for a specific attempt, go to your{' '}
            <a href="/history" className="text-indigo-300 underline">history page</a>.
          </p>
        )}
      </div>
    </div>
  );
}