// lib/subscription-client.ts
//
// One place the browser asks "what has this account got?", with in-flight
// deduplication and a very short cache.
//
// THE PROBLEM THIS SOLVES
//
// Six components fetched /api/subscription-status independently, and the
// Navbar is one of them — so it renders on every page alongside whichever page
// component also wants the same answer. Opening /history fired two identical
// requests at the same instant; /assess did the same. Each one costs a session
// verification, a rate-limit check, and a Supabase round trip, and they were
// racing to tell the UI the same thing.
//
// WHY NOT CACHE THIS ON THE SERVER
//
// Because it is entitlement state. Attempts remaining decides whether someone
// gets a report they have paid for, and a stale server-side copy means either
// selling something twice or refusing something already bought. The safe place
// for a cache this short is the browser, where it only ever affects one
// person's view and is thrown away on navigation.
//
// STALENESS IS HANDLED BY INVALIDATION, NOT BY A SHORT TTL
//
// The TTL exists to collapse the simultaneous burst on page load. Anything
// that CHANGES entitlements — a purchase, generating a report, skipping a
// follow-up — calls invalidate() so the next read is fresh. Never rely on the
// TTL expiring to notice a purchase.

export type SubscriptionStatus = {
  plan: 'free' | 'basic' | 'full';
  mainAttemptsRemaining: number;
  followupsPaidCount: number;
  bonusAttemptGranted: boolean;
  followupBundlePurchased: boolean;
  currentAttemptStatus: 'none' | 'in_progress' | 'awaiting_followup_decision';
  currentAttemptResultId: string | null;
  canStartAssessment: boolean;
  cannotStartReason: string | null;
};

/**
 * Long enough to collapse the mount-time burst from several components,
 * short enough that it is never the reason someone sees stale state.
 */
const TTL_MS = 5_000;

let cached: { data: SubscriptionStatus; at: number } | null = null;
let inFlight: Promise<SubscriptionStatus | null> | null = null;

/**
 * Throw away what we know. Call after anything that changes what the account
 * is entitled to.
 */
export function invalidateSubscriptionStatus(): void {
  cached = null;
  inFlight = null;
}

/**
 * The current status, or null if the request failed.
 *
 * Returns null rather than throwing: every caller treats this as "show the
 * cautious version of the UI", and none of them wants to handle an exception
 * during render.
 */
export async function getSubscriptionStatus(
  { force = false }: { force?: boolean } = {}
): Promise<SubscriptionStatus | null> {
  if (force) invalidateSubscriptionStatus();

  if (cached && Date.now() - cached.at < TTL_MS) return cached.data;

  // A second caller arriving while the first request is open waits on the same
  // promise rather than opening its own. This is the half that removes the
  // duplicate request on page load; the TTL only helps afterwards.
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const res = await fetch('/api/subscription-status', { credentials: 'include' });
      if (!res.ok) return null;
      const data = (await res.json()) as SubscriptionStatus;
      cached = { data, at: Date.now() };
      return data;
    } catch {
      return null;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}
