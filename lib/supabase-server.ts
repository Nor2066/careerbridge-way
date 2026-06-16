if (typeof window !== 'undefined') {
  throw new Error('supabaseServer can only be used on the server');
}

import { createClient } from '@supabase/supabase-js';

// NEXT_PUBLIC_SUPABASE_URL is used here intentionally — despite the NEXT_PUBLIC_
// prefix, this file is server-only (guarded by the window check above).
// SUPABASE_URL (without prefix) is not set in this project.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');

export const supabaseServer = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});