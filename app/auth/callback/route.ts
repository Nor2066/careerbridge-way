import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    // Exchange code for session
    await supabaseServer.auth.exchangeCodeForSession(code);
  }

  // Redirect to home page after successful login
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}