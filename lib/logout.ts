import { supabase } from '@/lib/supabase';

export async function logout() {
  await supabase.auth.signOut();

  // hard cleanup (important for admin systems)
  localStorage.clear();
  sessionStorage.clear();

  // optional: force reload to reset state
  window.location.href = '/admin/login';
}