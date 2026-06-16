// app/api/admin/check-role/route.ts
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getUserRole, isAdmin, isSuperAdmin } from '@/lib/roles';
import { adminReadLimiter, getUserIdentifier } from '@/lib/rate-limit';

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);

    const { success } = await adminReadLimiter.limit(getUserIdentifier(user.id));
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
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
    Sentry.captureException(err);
    console.error('CHECK ROLE ERROR:', err);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}