// lib/admin-gate.ts
//
// The check every /api/admin/* route makes before doing anything: a signed-in
// user, inside the admin rate limit, whose profiles.role is admin or
// superadmin. Returns either the user or the response to send back, so a route
// reads:
//
//   const gate = await requireAdmin(request);
//   if ('response' in gate) return gate.response;

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getUserRole, isAdmin, type UserRole } from '@/lib/roles';
import { adminReadLimiter, getUserIdentifier } from '@/lib/rate-limit';
import { NO_STORE_HEADERS } from '@/lib/auth-cookies';

type AdminUser = Awaited<ReturnType<typeof requireAuth>>;

export async function requireAdmin(
  request: Request
): Promise<{ user: AdminUser; role: UserRole } | { response: NextResponse }> {
  // requireAuth throws UnauthorizedError for a missing session; callers turn
  // that into a 401 with isUnauthorized(), as the other routes do.
  const user = await requireAuth(request);

  const { success } = await adminReadLimiter.limit(getUserIdentifier(user.id));
  if (!success) {
    return {
      response: NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: NO_STORE_HEADERS }),
    };
  }

  const role = await getUserRole(user.id);
  if (!isAdmin(role)) {
    return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: NO_STORE_HEADERS }) };
  }

  return { user, role };
}
