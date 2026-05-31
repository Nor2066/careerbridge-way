'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BaitQuiz from '@/components/BaitQuiz';
import GlassTextLogo from '@/components/GlassTextLogo';

export default function LandingPage() {
  const [quizStarted, setQuizStarted] = useState(false);
  const router = useRouter();

  const handleStartQuiz = () => setQuizStarted(true);
  const handleFullAssessment = () => router.push('/assess');

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex flex-col items-center justify-center px-4">
      <GlassTextLogo />
      <div className="w-full max-w-2xl mx-auto">
        {!quizStarted ? (
          <div className="bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-2xl p-8 text-center border border-gray-700">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Discover Your Ideal Career Path
            </h2>
            <p className="text-gray-300 mt-3 text-base">
              Take our quick 8‑question quiz to get personalized career insights. No sign‑up required.
            </p>
            <button
              onClick={handleStartQuiz}
              className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium px-8 py-3 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Start Assessment →
            </button>
          </div>
        ) : (
          <div className="bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700">
            <BaitQuiz onComplete={handleFullAssessment} />
          </div>
        )}
      </div>
    </main>
  );
}