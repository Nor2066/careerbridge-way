import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { createSupabaseServerClient } from '@/lib/supabase-server-client';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    // ========== DEBUG LOGGING START ==========
    console.log('=== load-progress API called ===');
    
    // Log all cookies received by the server
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    console.log('Cookies present:', allCookies.map(c => c.name));
    
    // Attempt to get authenticated user using the helper
    const supabaseClient = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    console.log('Authenticated user ID:', user?.id || 'null');
    if (authError) console.log('Auth error:', authError.message);
    
    if (!user) {
      console.log('❌ No authenticated user – returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // ========== DEBUG LOGGING END ==========

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabaseServer
      .from('user_progress')
      .select('answers, step')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || { answers: null, step: null });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}