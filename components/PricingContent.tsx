'use client';

// components/PricingContent.tsx

import { useState } from 'react';

type ProductType = 'basic' | 'full' | 'topup' | 'followup_unlock';

type AttemptStatus = 'none' | 'in_progress' | 'awaiting_followup_decision';

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
          setError(data.error || 'Your session has expired. Please sign in again.');
        } else {
          setError(data.error || 'Could not start checkout. Please try again.');
        }
        setLoadingProduct(null);
        return;
      }

      if (!data.url) {
        setError('Could not start checkout. Please try again.');
        setLoadingProduct(null);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError('Network error. Please try again.');
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
      notice = {
        title: 'Finish your last assessment first',
        body:
          'One of your attempts still has its followup questionnaire waiting. Complete that followup (or skip it from your history page) and you can start a new assessment.',
      };
    } else if (hasPlan && outOfAttempts && !followupsUnlocked) {
      notice = {
        title: "You've used all the attempts on your Basic plan",
        body:
          'Top-ups aren’t available to you yet. Your followup questionnaires are still locked, so every attempt you’ve done is only half finished — you need to unlock and complete your followups before buying more attempts. The bundle below unlocks the followup for every attempt, adds a bonus attempt straight away, and opens up top-ups afterwards.',
      };
    } else if (hasPlan && outOfAttempts) {
      notice = {
        title: "You've used all your attempts",
        body:
          'Every attempt on your plan is done. A top-up pack adds 3 more complete attempts — main questionnaire and followup for each.',
      };
    } else if (!hasPlan) {
      notice = {
        title: 'Choose a plan to see your results',
        body:
          'Your answers are saved. Pick a plan and you’ll pick up at exactly the question you left off on.',
      };
    }
  }

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
                  Sign in
                </a>
              </>
            )}
          </div>
        )}

        <div className={`grid gap-4 ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>

          {/* ─── Basic Plan ─────────────────────────────────────────────── */}
          {showBasePlans && (
            <div className="glass-card flex flex-col">
              <h3 className="text-xl font-bold text-white mb-1">Basic</h3>
              <p className="text-3xl font-bold text-white mb-4">
                €3.00 <span className="text-sm text-gray-400 font-normal">one-time</span>
              </p>
              <ul className="text-gray-300 text-sm space-y-2 mb-6 flex-1">
                <li>✓ 2 main assessment attempts</li>
                <li>✓ AI career report for each attempt</li>
                <li>✓ Unlock both followup roadmaps for €3.00</li>
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
          {showBasePlans && (
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

          {/* ─── Followup Bundle (account-wide) ────────────────────────── */}
          {showFollowupBundle && (
            <div className="glass-card flex flex-col">
              <h3 className="text-xl font-bold text-white mb-1">Unlock All Followups</h3>
              <p className="text-3xl font-bold text-white mb-4">
                €3.00 <span className="text-sm text-gray-400 font-normal">one-time</span>
              </p>
              <ul className="text-gray-300 text-sm space-y-2 mb-6 flex-1">
                <li>✓ Unlocks the followup questionnaire for both attempts</li>
                <li>✓ Get your detailed career roadmap for each</li>
                <li>✓ Includes +1 bonus attempt, instantly</li>
                <li>✓ Required before top-up packs become available</li>
              </ul>
              <button
                onClick={() => startCheckout('followup_unlock')}
                disabled={loadingProduct !== null}
                className="btn-primary w-full"
              >
                {loadingProduct === 'followup_unlock' ? 'Redirecting...' : 'Unlock All Followups — €3.00'}
              </button>
            </div>
          )}

          {/* ─── Top-up ─────────────────────────────────────────────────── */}
          {showTopup && (
            <div className="glass-card flex flex-col">
              <h3 className="text-xl font-bold text-white mb-1">3 Extra Attempts</h3>
              <p className="text-3xl font-bold text-white mb-4">
                €3.00 <span className="text-sm text-gray-400 font-normal">one-time</span>
              </p>
              <ul className="text-gray-300 text-sm space-y-2 mb-6 flex-1">
                <li>✓ +3 complete attempts (main + followup each)</li>
                <li>✓ Buy as many packs as you need</li>
                <li>✓ Use anytime, no expiry</li>
              </ul>
              <button
                onClick={() => startCheckout('topup')}
                disabled={loadingProduct !== null}
                className="btn-primary w-full"
              >
                {loadingProduct === 'topup' ? 'Redirecting...' : 'Buy 3 Attempts — €3.00'}
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
                Your <span className="capitalize">{currentPlan}</span> plan is active.
              </p>
              <p className="text-gray-300 text-sm mb-1">
                {mainAttemptsRemaining} attempt{mainAttemptsRemaining !== 1 ? 's' : ''} remaining
                {followupsUnlocked ? ' · followups unlocked' : ''}
              </p>
              <p className="text-gray-400 text-sm">
                {awaitingFollowup
                  ? 'There’s nothing to buy — finishing that followup is all that’s left.'
                  : 'There’s nothing to buy right now — more options appear here once you run out of attempts.'}
              </p>
              {/* Never offer "continue to my assessment" to someone who is
                  blocked from starting one — history is where the pending
                  followup actually lives. */}
              {awaitingFollowup ? (
                <a href="/history" className="btn-primary mt-5 inline-block">
                  Go to my history
                </a>
              ) : onClose ? (
                <button onClick={onClose} className="btn-primary mt-5">
                  Continue
                </button>
              ) : (
                <a href="/assess" className="btn-primary mt-5 inline-block">
                  Continue to my assessment
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
