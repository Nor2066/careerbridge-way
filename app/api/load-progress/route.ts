import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { getAuthenticatedUser } from '@/lib/supabase-server-auth';
import { saveResultLimiter, getIP } from '@/lib/rate-limit';

export async function GET(request: Request) {
  const ip = getIP(request);
  const { success } = await saveResultLimiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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