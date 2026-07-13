import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://careerbridge-way.vercel.app'),
  title: {
    default: 'CareerBridge Way — Free Career Assessment Test for Students',
    template: '%s | CareerBridge Way',
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
  authors: [{ name: 'CareerBridge Way' }],
  creator: 'CareerBridge Way',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://careerbridge-way.vercel.app',
    siteName: 'CareerBridge Way',
    title: 'CareerBridge Way — Free Career Assessment Test for Students',
    description:
      'Discover your ideal career path with our AI-powered assessment. Answer a few questions and get a personalised career report — free for students.',
    images: [
      {
        url: '/images/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'CareerBridge Way — Career Assessment',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CareerBridge Way — Free Career Assessment Test',
    description:
      'Not sure what career suits you? Get a free AI-powered career report in minutes.',
    images: ['/images/og-image.webp'],
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
      <body>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}