// app/university/page.tsx
//
// The dashboard a university's staff see. Access is checked here and again by
// /api/university/summary on every request: signed in, verified, and on the
// staff list of the university being shown.

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/supabase-server-auth';
import { getStaffInstitutions } from '@/lib/institutions';
import { getTranslator } from '@/lib/i18n/server';
import UniversityDashboard from './UniversityDashboard';

export const metadata: Metadata = {
  title: 'University dashboard',
  robots: { index: false, follow: false },
};

export default async function UniversityPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect('/login?returnTo=/university');

  const institutions = await getStaffInstitutions(user);

  if (institutions.length === 0) {
    const { t } = await getTranslator();
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-950 px-5 py-20">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-white">{t('uni.noAccess.title')}</h1>
          <p className="mt-4 text-gray-400">{t('uni.noAccess.body')}</p>
        </div>
      </main>
    );
  }

  return <UniversityDashboard institutions={institutions.map((i) => ({ id: i.id, name: i.name }))} />;
}
