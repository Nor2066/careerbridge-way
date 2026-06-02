import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const adminAuth = cookieStore.get('admin_auth');
    if (!adminAuth || adminAuth.value !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filterRating = searchParams.get('rating');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    let query = supabaseAdmin
      .from('assessments')
      .select('*')
      .order(sortBy, { ascending: sortOrder === 'asc' });

    if (filterRating && filterRating !== 'all') {
      query = query.eq('feedback_rating', parseInt(filterRating));
    }

    const { data, error } = await query;
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.log('Fetched rows:', data?.length);
    return NextResponse.json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}