'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BaitQuiz from '@/components/BaitQuiz';
import GlassTextLogo from '@/components/GlassTextLogo';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'CareerBridge Way',
  url: 'https://careerbridge-way.vercel.app',
  description: 'AI-powered career assessment platform that helps students and graduates discover their ideal career path through personalised questionnaires and reports.',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
    description: 'Free demo assessment available. Full assessment from €3.',
  },
  audience: {
    '@type': 'Audience',
    audienceType: 'Students and graduates seeking career guidance',
  },
};

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
      style={{ backgroundImage: "url('/images/bg-landing.webp')" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="absolute inset-0 bg-black/30 z-0" />

      <div className="relative z-10 w-full max-w-4xl mx-auto">

        {/* ── Hero ── */}
        <div className="text-center mb-16">
          <GlassTextLogo />
          <div className="mt-8 space-y-4">
            {/* Primary H1 — keyword rich for Google */}
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Free Career Assessment Test for Students & Graduates
            </h1>
            <p className="text-gray-200 text-lg max-w-2xl mx-auto">
              Not sure what career suits you? Answer a few questions and get an
              AI-powered career report that matches your skills, interests, and
              values to real career paths.
            </p>
            <p className="text-indigo-300 font-medium">
              Trusted by students exploring their future — takes under 15 minutes.
            </p>

            {!quizStarted && !quizCompleted && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <button
                  onClick={handleStartQuiz}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-8 py-3 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Try Free Demo →
                </button>
                <button
                  onClick={handleFullAssessment}
                  className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-3 rounded-full transition-all backdrop-blur-sm"
                >
                  Take Full Assessment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Stats bar ── */}
        {!quizStarted && !quizCompleted && (
          <div className="glass-card mb-12 py-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-indigo-300">15+</p>
                <p className="text-gray-300 text-sm mt-1">Career clusters analysed</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-indigo-300">46</p>
                <p className="text-gray-300 text-sm mt-1">In-depth questions</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-indigo-300">AI</p>
                <p className="text-gray-300 text-sm mt-1">Personalised report</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Bait Quiz ── */}
        {quizStarted && (
          <div className="w-full max-w-2xl mx-auto mb-16">
            <div className="glass-card">
              <BaitQuiz onComplete={handleBaitComplete} />
            </div>
          </div>
        )}

        {/* ── Quiz completed ── */}
        {quizCompleted && (
          <div className="w-full max-w-2xl mx-auto mb-16">
            <div className="glass-card text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Great work! Ready for the real thing?</h2>
              <p className="text-gray-200 mb-6">
                The demo gives you a taste — but our full career assessment goes
                much deeper. It analyses your skills, learning style, values, and
                ambitions across 46 questions, then generates a personalised AI
                career report with your top career clusters and why they fit you.
              </p>
              <button
                onClick={handleFullAssessment}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-8 py-3 rounded-full transition-all"
              >
                Start Full Career Assessment →
              </button>
            </div>
          </div>
        )}

        {/* ── Sections shown when quiz not active ── */}
        {!quizStarted && !quizCompleted && (
          <>
            {/* How it works */}
            <div className="glass-card mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                How the Career Assessment Works
              </h2>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-4xl mb-3">📝</div>
                  <h3 className="text-white font-semibold mb-2">1. Answer Questions</h3>
                  <p className="text-gray-300 text-sm">46 questions covering your skills, interests, work preferences, and values.</p>
                </div>
                <div>
                  <div className="text-4xl mb-3">🤖</div>
                  <h3 className="text-white font-semibold mb-2">2. Get Your AI Report</h3>
                  <p className="text-gray-300 text-sm">Our AI matches your profile to 15+ career clusters and explains why each fits you.</p>
                </div>
                <div>
                  <div className="text-4xl mb-3">🚀</div>
                  <h3 className="text-white font-semibold mb-2">3. Get Your Roadmap</h3>
                  <p className="text-gray-300 text-sm">Unlock a detailed career roadmap with job titles, courses, and a 3-month action plan.</p>
                </div>
              </div>
            </div>

            {/* Who We Are */}
            <div className="glass-card mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Who We Are</h2>
              <div className="space-y-4 text-gray-200">
                <p>• <strong className="text-white">We're students, just like you</strong> — currently at university. We've faced the same uncertainty, stress, and confusion about "what comes next."</p>
                <p>• <strong className="text-white">Built from real, recent experience</strong> — this questionnaire comes directly from the struggles we wish we'd had help with. It's peer-driven, practical, and tested through our own career exploration.</p>
                <p>• <strong className="text-white">Made by students, for students</strong> — no jargon, no judgment, and no "expert" distance. Just a clear, honest framework designed to help you avoid the trial-and-error we went through.</p>
                <p>• <strong className="text-white">Our mission</strong> — to make it easier for students to find a future career that actually fits. We created this to save you time, reduce anxiety, and give you a plan you can believe in.</p>
              </div>
            </div>

            {/* Why This Questionnaire */}
            <div className="glass-card mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Why Use CareerBridge Way?
              </h2>
              <div className="grid md:grid-cols-2 gap-6 text-gray-200">
                <div>
                  <p className="font-semibold text-indigo-300">✓ A Clear Career Roadmap, Not Just Advice</p>
                  <p className="text-sm mt-1">Instead of vague suggestions, you get a structured, step-by-step plan tailored to your unique goals and situation.</p>
                </div>
                <div>
                  <p className="font-semibold text-indigo-300">✓ Turn Uncertainty into a Concrete Plan</p>
                  <p className="text-sm mt-1">We capture your interests and build a complete blueprint so you know exactly what to do next.</p>
                </div>
                <div>
                  <p className="font-semibold text-indigo-300">✓ Eliminate Career Confusion and Self-Doubt</p>
                  <p className="text-sm mt-1">The in-depth analysis removes guesswork, giving you confidence that every step is informed and intentional.</p>
                </div>
                <div>
                  <p className="font-semibold text-indigo-300">✓ Uncover Hidden Strengths & Opportunities</p>
                  <p className="text-sm mt-1">Go beyond surface-level thinking. Get a nuanced breakdown of your strengths and the career paths most people overlook.</p>
                </div>
                <div className="md:col-span-2">
                  <p className="font-semibold text-indigo-300">✓ Stop Wasting Time on Trial & Error</p>
                  <p className="text-sm mt-1">With a personalised, AI-powered roadmap, you move faster, avoid common mistakes, and stay focused on what truly matters for your career.</p>
                </div>
              </div>
            </div>

            {/* CTA before contact */}
            <div className="glass-card mb-12 text-center">
              <h2 className="text-2xl font-bold text-white mb-3">
                Ready to Find Your Ideal Career Path?
              </h2>
              <p className="text-gray-300 mb-6">
                Join students who've already discovered careers that fit their strengths and ambitions.
              </p>
              <button
                onClick={handleFullAssessment}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-10 py-3 rounded-full transition-all shadow-lg hover:shadow-xl"
              >
                Start Your Free Career Assessment →
              </button>
            </div>

            {/* Contact */}
            <div className="glass-card">
              <h2 className="text-2xl font-bold text-white mb-4 text-center">Still Feeling Unsure? We're Here to Help</h2>
              <p className="text-gray-200 text-center mb-6">
                Every journey is different — your situation might have unique challenges the questionnaire couldn't fully capture.
                That's exactly why we've left the door open to talk.
              </p>
              <p className="text-gray-200 text-center">
                <strong className="text-white">How to reach us:</strong> [Insert your contact details]. Just send a message saying you took the questionnaire and need a little more guidance.
              </p>
              <p className="text-gray-200 text-center mt-4 italic">
                We genuinely want to help — this project came from our own struggles. If we can help even one student feel more confident about their future, it was worth it.
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}