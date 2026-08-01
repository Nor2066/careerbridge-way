// lib/fetchWithAuth.ts
import { supabase } from './supabase';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let token: string | undefined;

  // Try to get a client-side session token, with one brief retry for the
  // common case of the Supabase client still rehydrating right after a
  // page load (e.g. returning from Stripe checkout).
  try {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token;

    if (!token) {
      await new Promise(r => setTimeout(r, 400));
      const { data: { session: retrySession } } = await supabase.auth.getSession();
      token = retrySession?.access_token;
    }
  } catch (err) {
    // Swallow — we still attempt the request below via cookie fallback.
    console.warn('fetchWithAuth: session lookup failed, falling back to cookie auth', err);
  }

  // ROOT FIX for persistent "Not authenticated" failures: previously, if no
  // client-side token was found, this function threw immediately and NEVER
  // attempted the request — even though the server's requireAuth() already
  // supports a cookie-based fallback (the httpOnly session cookie, sent
  // automatically via credentials: 'include'). That cookie is often still
  // valid even when the browser's in-memory Supabase session is temporarily
  // or persistently unavailable (e.g. after being backgrounded, or a token
  // refresh hiccup). We now always attempt the request — with a Bearer
  // token if we have one, and relying on the cookie alone if we don't —
  // and let the SERVER be the source of truth on whether the person is
  // really authenticated.
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // IMPORTANT: Do NOT read response.text() or response.json() here.
  // Reading the body stream consumes it, making it impossible for the
  // caller to read the response body afterwards.
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
}