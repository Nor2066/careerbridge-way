// lib/fetchWithAuth.ts
import { supabase } from './supabase';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    // Do NOT redirect here — callers decide how to handle missing auth.
    // Redirecting here caused mid-questionnaire redirects when the session
    // hadn't loaded yet, breaking the assessment flow.
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