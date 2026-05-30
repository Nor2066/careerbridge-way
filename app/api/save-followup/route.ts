import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const { userId, answers } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { error } = await supabaseServer.from('followup_answers').insert({
      user_id: userId,
      answers,
    });
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}