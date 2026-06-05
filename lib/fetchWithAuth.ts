import { supabase } from './supabase';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  console.log('🔐 fetchWithAuth called with URL:', url);
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) {
    console.error('❌ No access token – user not authenticated');
    throw new Error('Not authenticated');
  }
  console.log('✅ Token obtained, first 20 chars:', token.substring(0, 20));
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
  console.log('📡 Response status:', response.status);
  if (!response.ok) {
    const text = await response.text();
    console.error('❌ Response error body:', text);
  }
  return response;
}