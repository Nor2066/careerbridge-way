// app/api/admin/assessments/route.ts
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/auth';
import { getUserRole, isAdmin } from '@/lib/roles';
import { adminReadLimiter, getUserIdentifier } from '@/lib/rate-limit';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const user = await requireAuth();

    const { success } = await adminReadLimiter.limit(getUserIdentifier(user.id));
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const role = await getUserRole(user.id);
    if (!isAdmin(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const filterRating = searchParams.get('rating');
    const sortBy = searchParams.get('sortBy') ?? 'created_at';
    const sortOrder = searchParams.get('sortOrder') ?? 'desc';

    const allowedSortFields = ['created_at', 'feedback_rating', 'email'];
    if (!allowedSortFields.includes(sortBy)) {
      return NextResponse.json({ error: 'Invalid sortBy field' }, { status: 400 });
    }

    let query = supabaseAdmin
      .from('assessments')
      .select('*')
      .order(sortBy, { ascending: sortOrder === 'asc' });

    if (filterRating && filterRating !== 'all') {
      const rating = Number(filterRating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return NextResponse.json({ error: 'Invalid rating filter' }, { status: 400 });
      }
      query = query.eq('feedback_rating', rating);
    }

    const { data, error: dbError } = await query;
    if (dbError) {
      console.error('ADMIN ASSESSMENTS DB ERROR:', dbError.message);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    Sentry.captureException(err);
    console.error('ADMIN ASSESSMENTS ERROR:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}