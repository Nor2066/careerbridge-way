// app/page.tsx
import dynamic from 'next/dynamic';

const HomeContent = dynamic(() => import('@/app/HomeContent'), { ssr: false });

export default function Home() {
  return <HomeContent />;
}