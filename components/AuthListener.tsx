'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthListener() {
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_OUT') {
          window.location.href = '/admin/login';
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return null;
}