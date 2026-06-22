// lib/fetchWithAuth.ts
import { supabase } from './supabase';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // getUser() validates the token server-side — unlike getSession() which can
  // return a stale cached session that appears valid but is actually expired.
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    // Session is genuinely gone — redirect to login instead of silently failing.
    // This fixes the case where the user appears logged out visually but stale
    // cookies still exist, causing API calls to fail with no feedback.
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Not authenticated');
  }

  // Get the current session for the Bearer token
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No access token');
  }

  // IMPORTANT: Do NOT read response.text() or response.json() here.
  // Reading the body stream here would consume it, making it impossible
  // for the caller to read the response body afterwards.
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  });
}