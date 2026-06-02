if (typeof window !== 'undefined') {
  throw new Error('supabaseServer can only be used on the server');
}
import { createClient } from '@supabase/supabase-js';

// Use service role key on server (never exposed to browser)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseServer = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});