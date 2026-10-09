'use client';

import { useState, useEffect } from 'react';
import { track } from '@/lib/analytics';
import { useRouter } from 'next/navigation';
import BaitQuiz from '@/components/BaitQuiz';
import GlassTextLogo from '@/components/GlassTextLogo';
import { CONTACT } from '@/lib/legal';
import { BRAND, BRAND_FULL, SITE_URL, SOCIAL } from '@/lib/site';
import { formatPrice, PRICE_CURRENCY } from '@/lib/prices';
import { useI18n } from '@/components/I18nProvider';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: BRAND.name,
  alternateName: BRAND_FULL,
  url: SITE_URL,
  description: 'AI-powered career assessment platform that helps students and graduates discover their ideal career path through personalised questionnaires and reports.',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: PRICE_CURRENCY,
    description: `Free demo assessment available. Full assessment from ${formatPrice('basic')}.`,
  },
  audience: {
    '@type': 'Audience',
    audienceType: 'Students and graduates seeking career guidance',
  },
};

// The "Reach Us" card shows only channels we have confirmed are ours, and
// disappears entirely while there are none. See SOCIAL in lib/site.ts and
// CONTACT in lib/legal.ts.
const emailReady = !CONTACT.support.includes('TODO');
const hasContactChannel = emailReady || Object.values(SOCIAL).some(Boolean);

// ── Step icon set (unchanged from before) ───────────────────────────────
const ConstellationIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
    <path d="M8 30L17 15L24 21L32 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className="text-indigo-300" opacity="0.5" />
    <circle cx="8" cy="30" r="2" fill="currentColor" className="text-indigo-300" />
    <circle cx="17" cy="15" r="2" fill="currentColor" className="text-indigo-300" />
    <circle cx="32" cy="9" r="2" fill="currentColor" className="text-indigo-300" />
    <circle cx="24" cy="21" r="2.5" fill="currentColor" className="text-purple-300" />
  </svg>
);

const GuidingStarIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
    <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" className="text-indigo-300" opacity="0.35" />
    <path d="M20 8L22.5 17.5L32 20L22.5 22.5L20 32L17.5 22.5L8 20L17.5 17.5Z" fill="currentColor" className="text-purple-300" />
  </svg>
);

const TrailIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
    <path d="M6 32C6 32 14 30 18 24C21 19.5 23 15 24 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="0.5 4.5" className="text-indigo-300" opacity="0.7" />
    <circle cx="6" cy="32" r="1.8" fill="currentColor" className="text-indigo-300" />
    <circle cx="18" cy="24" r="1.8" fill="currentColor" className="text-indigo-300" />
    <path d="M28 7L29.5 11L34 12.5L29.5 14L28 18L26.5 14L22 12.5L26.5 11Z" fill="currentColor" className="text-purple-300" />
  </svg>
);

const StepBadge = ({ children }: { children: React.ReactNode }) => (
  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500/15 to-purple-500/10 border border-indigo-400/25 flex items-center justify-center">
    {children}
  </div>
);

const Spark = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M10 3L11.5 8.5L17 10L11.5 11.5L10 17L8.5 11.5L3 10L8.5 8.5Z" fill="currentColor" />
  </svg>
);

// ── Contact icon set ─────────────────────────────────────────────────────
// Original minimal pictograms (camera, envelope, note, connected nodes) in
// the site's own line-art style — not reproductions of the platforms'
// actual trademarked logos.
const InstagramIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
    <path d="M10 15h4l2-3h8l2 3h4a2 2 0 012 2v12a2 2 0 01-2 2H10a2 2 0 01-2-2V17a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="20" cy="23" r="5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
    <rect x="6" y="10" width="28" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 12l13 10 13-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
    <circle cx="14" cy="28" r="4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M18 28V9l12 3v5l-12-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
    <circle cx="12" cy="14" r="3" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="28" cy="14" r="3" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="20" cy="27" r="3" stroke="currentColor" strokeWidth="1.4" />
    <path d="M14.5 16.5L18 24.5M25.5 16.5L22 24.5" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

const ContactLink = ({ href, label, children }: { href: string; label: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex flex-col items-center gap-2 group"
  >
    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500/15 to-purple-500/10 border border-indigo-400/25 flex items-center justify-center text-indigo-300 transition-all group-hover:border-purple-300/60 group-hover:text-purple-300 group-hover:-translate-y-1">
      {children}
    </div>
    <span className="text-gray-300 text-sm group-hover:text-white transition-colors">{label}</span>
  </a>
);

export default function LandingPage() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const router = useRouter();
  const { t } = useI18n();

  // The top of the funnel. Everything else is measured as a fraction of this.
  useEffect(() => {
    track('landing_view');
  }, []);

  const handleStartQuiz = () => {
    track('demo_quiz_start');
    setQuizStarted(true);
  };
  const handleBaitComplete = () => {
    track('demo_quiz_complete');
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
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {t('home.hero.title')}
            </h1>
            <p className="text-gray-200 text-lg max-w-2xl mx-auto">
              {t('home.hero.lead')}
            </p>
            <p className="text-indigo-300 font-medium">
              {t('home.hero.trust')}
            </p>

            {!quizStarted && !quizCompleted && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <button
                  onClick={handleStartQuiz}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-8 py-3 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {t('home.cta.demo')}
                </button>
                <button
                  onClick={handleFullAssessment}
                  className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-3 rounded-full transition-all backdrop-blur-sm"
                >
                  {t('home.cta.full')}
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
                <p className="text-gray-300 text-sm mt-1">{t('home.stats.clusters')}</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-indigo-300">46</p>
                <p className="text-gray-300 text-sm mt-1">{t('home.stats.questions')}</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-indigo-300">{t('home.stats.ai')}</p>
                <p className="text-gray-300 text-sm mt-1">{t('home.stats.report')}</p>
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
              <h2 className="text-2xl font-bold text-white mb-4">{t('home.demoDone.title')}</h2>
              <p className="text-gray-200 mb-6">
                {t('home.demoDone.body')}
              </p>
              <button
                onClick={handleFullAssessment}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-8 py-3 rounded-full transition-all"
              >
                {t('home.demoDone.cta')}
              </button>
            </div>
          </div>
        )}

        {/* ── Sections shown when quiz not active ── */}
        {!quizStarted && !quizCompleted && (
          <>
            {/* How it works */}
            <div className="glass-card mb-12">
              <h2 className="text-2xl font-bold text-white mb-8 text-center">
                {t('home.how.title')}
              </h2>
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <StepBadge><ConstellationIcon /></StepBadge>
                  <h3 className="text-white font-semibold mb-2">{t('home.how.step1.title')}</h3>
                  <p className="text-gray-300 text-sm">{t('home.how.step1.body')}</p>
                </div>
                <div>
                  <StepBadge><GuidingStarIcon /></StepBadge>
                  <h3 className="text-white font-semibold mb-2">{t('home.how.step2.title')}</h3>
                  <p className="text-gray-300 text-sm">{t('home.how.step2.body')}</p>
                </div>
                <div>
                  <StepBadge><TrailIcon /></StepBadge>
                  <h3 className="text-white font-semibold mb-2">{t('home.how.step3.title')}</h3>
                  <p className="text-gray-300 text-sm">{t('home.how.step3.body')}</p>
                </div>
              </div>
            </div>

            {/* Who We Are */}
            <div className="glass-card mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">{t('home.who.title')}</h2>
              <div className="space-y-4 text-gray-200">
                <p><strong className="text-white">{t('home.who.p1.strong')}</strong>{t('home.who.p1.rest')}</p>
                <p>{t('home.who.p2.before')}<strong className="text-white">{t('home.who.p2.strong')}</strong>{t('home.who.p2.rest')}</p>
                <p>{t('home.who.p3.before')}<strong className="text-white">{t('home.who.p3.strong')}</strong>{t('home.who.p3.rest')}</p>
                <p><strong className="text-white">{t('home.who.p4.strong')}</strong>{t('home.who.p4.rest')}</p>
              </div>
            </div>

            {/* Why This Questionnaire */}
            <div className="glass-card mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                {t('home.why.title', { brand: BRAND.name })}
              </h2>
              <div className="grid md:grid-cols-2 gap-6 text-gray-200">
                <div>
                  <p className="font-semibold text-indigo-300 flex items-center gap-2">
                    <Spark className="w-3.5 h-3.5 text-purple-300 flex-shrink-0" />
                    {t('home.why.1.title')}
                  </p>
                  <p className="text-sm mt-1">{t('home.why.1.body')}</p>
                </div>
                <div>
                  <p className="font-semibold text-indigo-300 flex items-center gap-2">
                    <Spark className="w-3.5 h-3.5 text-purple-300 flex-shrink-0" />
                    {t('home.why.2.title')}
                  </p>
                  <p className="text-sm mt-1">{t('home.why.2.body')}</p>
                </div>
                <div>
                  <p className="font-semibold text-indigo-300 flex items-center gap-2">
                    <Spark className="w-3.5 h-3.5 text-purple-300 flex-shrink-0" />
                    {t('home.why.3.title')}
                  </p>
                  <p className="text-sm mt-1">{t('home.why.3.body')}</p>
                </div>
                <div>
                  <p className="font-semibold text-indigo-300 flex items-center gap-2">
                    <Spark className="w-3.5 h-3.5 text-purple-300 flex-shrink-0" />
                    {t('home.why.4.title')}
                  </p>
                  <p className="text-sm mt-1">{t('home.why.4.body')}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="font-semibold text-indigo-300 flex items-center gap-2">
                    <Spark className="w-3.5 h-3.5 text-purple-300 flex-shrink-0" />
                    {t('home.why.5.title')}
                  </p>
                  <p className="text-sm mt-1">{t('home.why.5.body')}</p>
                </div>
              </div>
            </div>

            {/* CTA before contact */}
            <div className="glass-card mb-12 text-center">
              <h2 className="text-2xl font-bold text-white mb-3">
                {t('home.cta2.title')}
              </h2>
              <p className="text-gray-300 mb-6">
                {t('home.cta2.body')}
              </p>
              <button
                onClick={handleFullAssessment}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-10 py-3 rounded-full transition-all shadow-lg hover:shadow-xl"
              >
                {t('home.cta2.button')}
              </button>
            </div>

            {/* Contact */}
            <div className="glass-card mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 text-center">{t('home.contact.title')}</h2>
              <p className="text-gray-200 text-center mb-6">
                {t('home.contact.body')}
              </p>
              <p className="text-gray-200 text-center italic">
                {t('home.contact.closing')}
              </p>
            </div>

            {/* Reach Us Anywhere — only once there is somewhere real to reach
                us. Every channel here is a link we have confirmed is ours. */}
            {hasContactChannel && (
              <div className="glass-card">
                <h2 className="text-2xl font-bold text-white mb-2 text-center">{t('home.reach.title')}</h2>
                <p className="text-gray-300 text-center mb-8 text-sm">{t('home.reach.body')}</p>
                <div className="flex flex-wrap justify-center gap-8">
                  {SOCIAL.instagram && (
                    <ContactLink href={SOCIAL.instagram} label="Instagram">
                      <InstagramIcon />
                    </ContactLink>
                  )}
                  {/* Appears once CONTACT.support in lib/legal.ts is a real
                      address on a domain we own. A guessed address sends
                      people's messages to whoever owns that domain. */}
                  {emailReady && (
                    <ContactLink href={`mailto:${CONTACT.support}`} label={t('home.reach.email')}>
                      <EmailIcon />
                    </ContactLink>
                  )}
                  {SOCIAL.tiktok && (
                    <ContactLink href={SOCIAL.tiktok} label="TikTok">
                      <TikTokIcon />
                    </ContactLink>
                  )}
                  {SOCIAL.linkedin && (
                    <ContactLink href={SOCIAL.linkedin} label="LinkedIn">
                      <LinkedInIcon />
                    </ContactLink>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}