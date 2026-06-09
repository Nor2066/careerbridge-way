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