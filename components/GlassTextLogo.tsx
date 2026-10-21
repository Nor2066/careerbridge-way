'use client';

import { BRAND, BRAND_DESCRIPTOR } from '@/lib/site';
import { useI18n } from '@/components/I18nProvider';

export default function GlassTextLogo() {
  const { locale } = useI18n();
  return (
    <div className="text-center mb-8">
      <h1 className="text-5xl md:text-7xl font-bold tracking-[0.08em] bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-white to-purple-300 animate-float">
        {BRAND.name}
      </h1>
      <p className="mt-3 font-mono text-xs md:text-sm uppercase tracking-[0.4em] text-indigo-200/80">
        {BRAND_DESCRIPTOR[locale]}
      </p>
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}