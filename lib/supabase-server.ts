if (typeof window !== 'undefined') {
  throw new Error('supabaseServer can only be used on the server');
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Log which keys are present at startup to help diagnose 403s
// (only logs key presence, never the actual key value)
if (!supabaseUrl) {
  console.error('MISSING ENV: NEXT_PUBLIC_SUPABASE_URL is not set');
}
if (!serviceRoleKey) {
  console.error('MISSING ENV: SUPABASE_SERVICE_ROLE_KEY is not set — falling back to anon key will cause 403s');
}

export const supabaseServer = createClient(
  supabaseUrl ?? '',
  serviceRoleKey ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);