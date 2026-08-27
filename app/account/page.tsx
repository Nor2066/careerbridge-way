// app/account/page.tsx
//
// Guarded server-side rather than in the client component: the page should
// never render for a signed-out visitor even for a frame, and redirecting here
// means no flash of an account screen belonging to nobody.

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/supabase-server-auth';
import { isEmailVerified } from '@/lib/auth';
import AccountClient from './AccountClient';

export const metadata: Metadata = {
  title: 'Your account',
  description: 'Download or delete your CareerBridge Way data.',
  // Nothing here should ever appear in a search result.
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect('/login?returnTo=/account');

  return <AccountClient email={user.email ?? ''} emailVerified={isEmailVerified(user)} />;
}
