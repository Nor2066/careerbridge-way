'use client';

import { useAuth } from '@/lib/AuthContext';
import dynamic from 'next/dynamic';

const StyleEditor = dynamic(() => import('@/components/StyleEditor'), { ssr: false });

const allowedEmails = ['baknormi@gmail.com', 'adriandiss69@gmail.com'];

export default function StyleEditorWrapper() {
  const { user } = useAuth();

  if (!user || !allowedEmails.includes(user.email || '')) {
    return null;
  }

  return <StyleEditor />;
}