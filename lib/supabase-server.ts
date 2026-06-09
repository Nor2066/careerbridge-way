if (typeof window !== 'undefined') {
  throw new Error('supabaseServer can only be used on the server');
}

import { createClient } from '@supabase/supabase-js';

// Server-only Supabase client (secure)
const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseServer = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});