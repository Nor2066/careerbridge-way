import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserRole, isAdmin, isSuperAdmin } from '@/lib/roles';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing token' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid user' },
        { status: 401 }
      );
    }

    const role = await getUserRole(user.id);

    return NextResponse.json({
      ok: true,
      role,
      permissions: {
        canViewAdmin: isAdmin(role),
        canEdit: isAdmin(role),
        isSuperAdmin: isSuperAdmin(role),
      },
    });
  } catch (err) {
    console.error('CHECK ROLE ERROR:', err);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}