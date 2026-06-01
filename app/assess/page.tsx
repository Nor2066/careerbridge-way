// app/assess/page.tsx
'use client';

import dynamic from 'next/dynamic';

const HomeContent = dynamic(() => import('@/app/HomeContent'), { ssr: false });

export default function AssessPage() {
  return (
    <main className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center px-4"
          style={{ backgroundImage: `url('/images/bg-assess.jpg')` }}>
      <div className="w-full max-w-2xl mx-auto text-white">   {/* 👈 add text-white here */}
        <HomeContent />
      </div>
    </main>
  );
}