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
    <main
      className="relative min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-start px-4 py-12"
      style={{ backgroundImage: "url('/images/bg-landing.jpg')" }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/30 z-0" />

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <GlassTextLogo />
          <div className="mt-8 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Stop guessing your future. Your ideal career is closer than you think.
            </h2>
            <p className="text-gray-200 text-lg max-w-2xl mx-auto">
              Answer a few questions and discover careers that match your strengths, interests, and ambitions.
            </p>
            <p className="text-gray-300">Let us help you find and plan your future!</p>
            {!quizStarted && !quizCompleted && (
              <button
                onClick={handleStartQuiz}
                className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium px-8 py-3 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Start Assessment →
              </button>
            )}
          </div>
        </div>

        {/* Bait Quiz or Completion */}
        {quizStarted && (
          <div className="w-full max-w-2xl mx-auto mb-16">
            <div className="glass-card">
              <BaitQuiz onComplete={handleBaitComplete} />
            </div>
          </div>
        )}

        {quizCompleted && (
          <div className="w-full max-w-2xl mx-auto mb-16">
            <div className="glass-card text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Thank you for trying the demo quiz</h2>
              <p className="text-gray-200 mb-6">
                The demo quiz is just an introduction – it cannot provide reliable, science‑based career recommendations.
                For a comprehensive assessment that analyses your skills, interests, and values, please proceed to our full Career Planner.
                With that you will receive: our recommendation of which career path suits you best, followed by detailed suggestions of which fields would be suitable for you.
              </p>
              <button
                onClick={handleFullAssessment}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium px-8 py-3 rounded-full transition-all"
              >
                Go to Career Planner →
              </button>
            </div>
          </div>
        )}

        {/* Additional sections – only shown when quiz hasn't started */}
        {!quizStarted && !quizCompleted && (
          <>
            {/* Who We Are */}
            <div className="glass-card mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Who We Are</h2>
              <div className="space-y-4 text-gray-200">
                <p>• We’re students, just like you – Currently at university. We’ve faced the same uncertainty, stress, and confusion about “what comes next.”</p>
                <p>• Built from real, recent experience – This questionnaire comes directly from the struggles we wish we’d had help with. It’s not theoretical or corporate advice—it’s peer-driven, practical, and tested through our own career exploration.</p>
                <p>• We’ve lived the problem we’re solving – From choosing the wrong direction to feeling lost among endless options, we know how overwhelming it can be. This tool exists because we needed it ourselves.</p>
                <p>• Made by students, for students – No jargon, no judgment, and no “expert” distance. Just a clear, honest framework designed to help you avoid the trial-and-error we went through.</p>
                <p>• Our mission – To make it easier for students like you to find a future career that actually fits. We created this hoping it would save you time, reduce anxiety, and give you a plan you can believe in.</p>
              </div>
            </div>

            {/* Why This Questionnaire? */}
            <div className="glass-card mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Why This Questionnaire?</h2>
              <div className="grid md:grid-cols-2 gap-6 text-gray-200">
                <div>
                  <p className="font-semibold text-indigo-300">Gain a Clear Career Roadmap, Not Just Advice</p>
                  <p className="text-sm">Instead of vague suggestions, you’ll receive a structured, step-by-step plan tailored to your unique goals and situation.</p>
                </div>
                <div>
                  <p className="font-semibold text-indigo-300">Turn a Rough Idea into a Full Actionable Plan</p>
                  <p className="text-sm">We capture your initial idea and then build a strategy to deliver a complete, detailed blueprint so you know exactly what to do next.</p>
                </div>
                <div>
                  <p className="font-semibold text-indigo-300">Eliminate Confusion and Self-Doubt</p>
                  <p className="text-sm">The in-depth analysis removes guesswork, giving you confidence that every move you make is informed and intentional.</p>
                </div>
                <div>
                  <p className="font-semibold text-indigo-300">Uncover Hidden Gaps & Opportunities</p>
                  <p className="text-sm">Go beyond surface-level thinking. You’ll get a nuanced breakdown of your strengths, risks, and milestones most people overlook.</p>
                </div>
                <div className="md:col-span-2">
                  <p className="font-semibold text-indigo-300">Stop Wasting Time on Trial & Error</p>
                  <p className="text-sm">With a personalized, three-part roadmap, you move faster, avoid common pitfalls, and stay focused on what truly matters for your career.</p>
                </div>
              </div>
            </div>

            {/* Still Feeling Unsure? Contact Us */}
            <div className="glass-card">
              <h2 className="text-2xl font-bold text-white mb-4 text-center">Still Feeling Unsure? Contact Us – We're Here to Help</h2>
              <p className="text-gray-200 text-center mb-6">
                Because every journey is different – your situation might have unique challenges the questionnaire couldn't fully capture.
                That's exactly why we've left the door open to talk.
              </p>
              <p className="text-gray-200 text-center">
                <strong>How to reach us:</strong> [Insert your contact details]. Just send a message saying you took the questionnaire
                and need a little more guidance.
              </p>
              <p className="text-gray-200 text-center mt-4 italic">
                We genuinely want to help – This project came from our own struggles. If we can help even one student feel more confident about their future,
                it was worth it.
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
