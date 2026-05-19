import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const apiSecret = process.env.NEXT_PUBLIC_ADMIN_API_SECRET;

  if (!supabaseUrl || !serviceKey || !apiSecret) {
    console.error('Missing env vars:', { 
      hasUrl: !!supabaseUrl, 
      hasServiceKey: !!serviceKey, 
      hasApiSecret: !!apiSecret 
    });
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Verify authorization token
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (token !== apiSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filterRating = searchParams.get('rating');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build the query
    let query = supabaseAdmin
      .from('assessments')
      .select('*')
      .order(sortBy, { ascending: sortOrder === 'asc' });

    if (filterRating && filterRating !== 'all') {
      const ratingNum = parseInt(filterRating);
      if (!isNaN(ratingNum)) {
        query = query.eq('feedback_rating', ratingNum);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}