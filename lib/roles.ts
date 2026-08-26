// Fail fast if this module is ever pulled into a client bundle. Next.js does
// not inline non-NEXT_PUBLIC env vars into browser code, so the service-role
// key cannot leak this way — but it would arrive as undefined and produce a
// confusing runtime 403 instead of an obvious error. lib/supabase-server.ts
// has guarded this way for a while; these modules did not.
if (typeof window !== 'undefined') {
  throw new Error('This module is server-only and must not be imported by client code');
}

import { createClient } from '@supabase/supabase-js';

export type UserRole = 'superadmin' | 'admin' | 'moderator' | 'viewer';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Fetch user role from DB (single source of truth)
 */
export async function getUserRole(userId: string): Promise<UserRole> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data?.role) return 'viewer';

  return data.role as UserRole;
}

/**
 * Admin-level access (admin + superadmin)
 */
export function isAdmin(role: UserRole | null | undefined): boolean {
  return role === 'admin' || role === 'superadmin';
}

/**
 * Strict superadmin only
 */
export function isSuperAdmin(role: UserRole | null | undefined): boolean {
  return role === 'superadmin';
}

/**
 * Future-proof gate (universities etc later)
 */
export function canAccessAdmin(role: UserRole | null | undefined): boolean {
  return isAdmin(role);
}