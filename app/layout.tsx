import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BRAND, BRAND_FULL, SITE_URL } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND.name} — Free Career Assessment Test for Students`,
    template: `%s | ${BRAND.name}`,
  },
  description:
    'Not sure what career suits you? Take our free AI-powered career assessment test and discover the best career path based on your skills, interests, and values. Built for students and graduates.',
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
  authors: [{ name: BRAND.name }],
  creator: BRAND.name,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: BRAND_FULL,
    title: `${BRAND_FULL} — Free Career Assessment Test for Students`,
    description:
      'Discover your ideal career path with our AI-powered assessment. Answer a few questions and get a personalised career report — free for students.',
    // No images here: app/opengraph-image.png and app/twitter-image.png are
    // picked up by file convention, with their size and alt text. This used
    // to point at /images/og-image.webp, which did not exist, so every shared
    // link went out with no preview picture.
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND_FULL} — Free Career Assessment Test`,
    description:
      'Not sure what career suits you? Get a free AI-powered career report in minutes.',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* min-h-screen + flex column keeps the footer at the bottom of short
          pages instead of floating halfway up. */}
      <body className="flex min-h-screen flex-col">
        <AuthProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}