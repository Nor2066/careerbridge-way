// lib/fetchWithAuth.ts
import { supabase } from './supabase';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new Error('Not authenticated');
  }

  // IMPORTANT: Do NOT read response.text() or response.json() here.
  // Reading the body stream here would consume it, making it impossible
  // for the caller to read the response body afterwards.
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  });

  return response;
}