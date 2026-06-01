'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BaitQuiz from '@/components/BaitQuiz';
import GlassTextLogo from '@/components/GlassTextLogo';

export default function LandingPage() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const router = useRouter();

  const handleStartQuiz = () => setQuizStarted(true);
  const handleBaitComplete = () => {
    setQuizStarted(false);
    setQuizCompleted(true);
  };
  const handleFullAssessment = () => router.push('/assess');

  return (
    <main className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center px-4"
      style={{ backgroundImage: `url('/images/bg-landing.jpg')` }}>
      <GlassTextLogo />
      <div className="w-full max-w-2xl mx-auto">
        {/* Hero / Start screen */}
        {!quizStarted && !quizCompleted && (
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
        )}

        {/* Bait quiz */}
        {quizStarted && (
          <div className="bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700">
            <BaitQuiz onComplete={handleBaitComplete} />
          </div>
        )}

        {/* Confirmation after bait quiz */}
        {quizCompleted && (
          <div className="bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-2xl p-8 text-center border border-gray-700">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Thank you for trying the demo quiz
            </h2>
            <p className="text-gray-300 mb-6">
                    The demo quiz is just an introduction, it cannot provide reliable, science‑based career recommendations. 
      For a comprehensive assessment that analyses your skills, interests, and values, please proceed to our full Career Planner. 
      With that you will receive the following: Our recommendation to which career path we are recommending. 
      After that a detailed recommendations of which fields would be suitable for you.
            </p>
            <button
              onClick={handleFullAssessment}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium px-8 py-3 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Go to Career Planner →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}