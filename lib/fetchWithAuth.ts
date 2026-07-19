// lib/fetchWithAuth.ts
import { supabase } from './supabase';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let token: string | undefined;

  const { data: { session } } = await supabase.auth.getSession();
  token = session?.access_token;

  // If no token on first check, wait briefly and retry once — this covers
  // the common case where the Supabase client is still rehydrating its
  // session right after a page load (e.g. returning from a Stripe checkout
  // redirect). This single internal retry makes every fetchWithAuth call
  // site more resilient without needing its own retry logic.
  if (!token) {
    await new Promise(r => setTimeout(r, 400));
    const { data: { session: retrySession } } = await supabase.auth.getSession();
    token = retrySession?.access_token;
  }

  if (!token) {
    // Do NOT redirect here — callers decide how to handle missing auth.
    throw new Error('Not authenticated');
  }

  // IMPORTANT: Do NOT read response.text() or response.json() here.
  // Reading the body stream consumes it, making it impossible for the
  // caller to read the response body afterwards.
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  });
}