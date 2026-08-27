// components/Footer.tsx
//
// There was no footer before this, which meant there was nowhere to put the
// legal pages. "Written and linked" is the standard — an unlinked policy does
// not count, and for a site that takes payment the seller's identity has to be
// reachable from every page.
//
// Server component on purpose: it holds no state, so there is no reason to
// ship it to the browser.

import Link from 'next/link';
import { COMPANY, CONTACT, legalDetailsComplete } from '@/lib/legal';

const LEGAL_LINKS = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/refunds', label: 'Refunds' },
];

const PRODUCT_LINKS = [
  { href: '/assess', label: 'Take the assessment' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/history', label: 'Your history' },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const detailsReady = legalDetailsComplete();

  return (
    <footer className="mt-auto border-t border-white/10 bg-slate-950/80 px-5 py-10 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <p className="text-base font-semibold text-white">{COMPANY.tradingName}</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">
              An AI-assisted career assessment for students and graduates. Your report is
              information to think about, not professional careers advice.
            </p>
          </div>

          <nav aria-label="Product" className="flex flex-col gap-2">
            <p className="font-mono text-xs uppercase tracking-widest text-gray-500">
              Product
            </p>
            {PRODUCT_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-300 transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <nav aria-label="Legal" className="flex flex-col gap-2">
            <p className="font-mono text-xs uppercase tracking-widest text-gray-500">
              Legal
            </p>
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-300 transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={`mailto:${CONTACT.support}`}
              className="text-sm text-gray-300 transition hover:text-white"
            >
              Contact us
            </a>
          </nav>
        </div>

        {/* Seller identity. Required for a site selling to consumers, and the
            thing a cautious buyer looks for before entering a card number. */}
        <div className="border-t border-white/10 pt-6 text-xs leading-relaxed text-gray-500">
          {detailsReady ? (
            <p>
              {COMPANY.tradingName} is a trading name of {COMPANY.legalName}, registered in{' '}
              {COMPANY.jurisdiction} (company no. {COMPANY.companyNumber}). Registered
              office: {COMPANY.address}.
              {COMPANY.vatNumber ? ` VAT no. ${COMPANY.vatNumber}.` : ''}
            </p>
          ) : (
            <p className="text-amber-300/80">
              Company details are still placeholders &mdash; fill them in at{' '}
              <code>lib/legal.ts</code> before launch.
            </p>
          )}
          <p className="mt-2">&copy; {year} {COMPANY.tradingName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
