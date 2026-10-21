// app/assess/page.tsx
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import AssessClient from './AssessClient';
import { getTranslator } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t('meta.assess.title'), description: t('meta.assess.description') };
}

export default async function AssessPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?returnTo=/assess');

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center px-4"
      style={{ backgroundImage: `url('/images/bg-assess.webp')` }}
    >
      <div className="w-full max-w-2xl mx-auto text-white">
        <AssessClient />
      </div>
    </main>
  );
}