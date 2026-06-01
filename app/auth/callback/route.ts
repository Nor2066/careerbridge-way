import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    // Exchange the code for a session using your existing supabase client
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to home page after successful login
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}