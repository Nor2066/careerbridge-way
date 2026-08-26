// app/api/admin/check-role/route.ts
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { isUnauthorized, unauthorizedResponse } from '@/lib/api-errors';
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
    // An expired session is not a server fault — answer 401 so the client
    // can prompt a sign-in instead of showing an error.
    if (isUnauthorized(err)) return unauthorizedResponse();
    Sentry.captureException(err);
    console.error('CHECK ROLE ERROR:', err);
    // Reaching here means the role lookup itself failed, not that the caller
    // was unauthenticated — that case is answered above.
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}