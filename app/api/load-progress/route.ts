import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { getAuthenticatedUser } from '@/lib/supabase-server-auth';

export async function GET(request: Request) {
  try {
    // ========== DEBUGGING START ==========
    console.log('=== load-progress DEBUG ===');
    
    // Log all cookies (names only)
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    console.log('Cookies present:', allCookies.map(c => c.name));
    
    // Log the user from the authentication helper
    const user = await getAuthenticatedUser();
    console.log('Authenticated user:', user?.id || 'null');
    
    // If no user, return 401 with reason
    if (!user) {
      console.log('❌ No authenticated user – returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // ========== DEBUGGING END ==========

    // Original logic continues...
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabaseServer
      .from('user_progress')
      .select('answers, step')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json(data || { answers: null, step: null });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}