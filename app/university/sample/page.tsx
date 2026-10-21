// app/university/sample/page.tsx
//
// What a university's careers team would see once around 200 students have
// used ADAQNO, with invented numbers. Public on purpose: it is what the
// founders show a university before a pilot, and a real pilot's dashboard is
// mostly "< 5" until enough students join.

import type { Metadata } from 'next';
import { getTranslator } from '@/lib/i18n/server';
import { buildSampleDashboard } from '@/lib/institution-sample';
import SampleDashboard from './SampleDashboard';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t('uni.sample.title') };
}

export default function UniversitySamplePage() {
  return <SampleDashboard sample={buildSampleDashboard()} />;
}
