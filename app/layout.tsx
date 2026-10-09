import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BRAND, BRAND_FULL, SITE_URL } from '@/lib/site';
import { I18nProvider } from '@/components/I18nProvider';
import { getLocale } from '@/lib/i18n/server';
import './globals.css';

// Search and link-preview text in each language. Crawlers that send
// Accept-Language: es get the Spanish version.
const META_TEXT = {
  en: {
    title: 'Free Career Assessment Test for Students',
    description:
      'Not sure what career suits you? Take our free AI-powered career assessment test and discover the best career path based on your skills, interests, and values. Built for students and graduates.',
    ogDescription:
      'Discover your ideal career path with our AI-powered assessment. Answer a few questions and get a personalised career report — free for students.',
    twitterTitle: 'Free Career Assessment Test',
    twitterDescription: 'Not sure what career suits you? Get a free AI-powered career report in minutes.',
    ogLocale: 'en_US',
    keywords: [
      'career assessment test',
      'what career suits me',
      'career path quiz',
      'career guidance for students',
      'what job should I do',
      'free career test',
      'career planner',
      'AI career advice',
      'career quiz for students',
      'best career for me',
    ],
  },
  es: {
    title: 'Test de orientación profesional gratis para estudiantes',
    description:
      '¿No sabes qué carrera profesional encaja contigo? Haz nuestra evaluación gratuita con IA y descubre el mejor camino según tus habilidades, intereses y valores. Pensada para estudiantes y titulados.',
    ogDescription:
      'Descubre tu camino profesional ideal con nuestra evaluación con IA. Responde unas preguntas y recibe un informe de carrera personalizado, gratis para estudiantes.',
    twitterTitle: 'Test de orientación profesional gratis',
    twitterDescription: '¿No sabes qué carrera te encaja? Recibe un informe de carrera con IA en minutos.',
    ogLocale: 'es_ES',
    keywords: [
      'test de orientación profesional',
      'qué carrera me conviene',
      'test vocacional',
      'orientación laboral para estudiantes',
      'qué trabajo me encaja',
      'test de carrera gratis',
      'orientación profesional con IA',
      'test vocacional universitarios',
    ],
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const m = META_TEXT[await getLocale()];
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${BRAND.name} — ${m.title}`,
      template: `%s | ${BRAND.name}`,
    },
    description: m.description,
    keywords: [...m.keywords],
    authors: [{ name: BRAND.name }],
    creator: BRAND.name,
    openGraph: {
      type: 'website',
      locale: m.ogLocale,
      url: SITE_URL,
      siteName: BRAND_FULL,
      title: `${BRAND_FULL} — ${m.title}`,
      description: m.ogDescription,
      // No images here: app/opengraph-image.png and app/twitter-image.png are
      // picked up by file convention, with their size and alt text. This used
      // to point at /images/og-image.webp, which did not exist, so every shared
      // link went out with no preview picture.
    },
    twitter: {
      card: 'summary_large_image',
      title: `${BRAND_FULL} — ${m.twitterTitle}`,
      description: m.twitterDescription,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // The visitor's language — their choice from the switcher, else their
  // browser's. Read here so the very first render is in the right language.
  const locale = await getLocale();

  return (
    <html lang={locale}>
      {/* min-h-screen + flex column keeps the footer at the bottom of short
          pages instead of floating halfway up. */}
      <body className="flex min-h-screen flex-col">
        <I18nProvider initialLocale={locale}>
          <AuthProvider>
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
