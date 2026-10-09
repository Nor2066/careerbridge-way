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
import { BRAND } from '@/lib/site';
import { getTranslator } from '@/lib/i18n/server';
import type { MessageKey } from '@/lib/i18n/messages';

// "Written and linked" is the standard, so every document that forms part of
// the agreement is listed here rather than only reachable from inside another
// one. The AI notice is in this list deliberately: it is the one a customer
// most needs before they buy, not after.
const LEGAL_LINKS: { href: string; label: MessageKey }[] = [
  { href: '/privacy', label: 'footer.link.privacy' },
  { href: '/terms', label: 'footer.link.terms' },
  { href: '/refunds', label: 'footer.link.refunds' },
  { href: '/cookies', label: 'footer.link.cookies' },
  { href: '/acceptable-use', label: 'footer.link.acceptableUse' },
  { href: '/ai-notice', label: 'footer.link.aiNotice' },
];

const PRODUCT_LINKS: { href: string; label: MessageKey }[] = [
  { href: '/assess', label: 'footer.link.assess' },
  { href: '/sample-report', label: 'footer.link.sample' },
  { href: '/pricing', label: 'footer.link.pricing' },
  { href: '/history', label: 'footer.link.history' },
  // Second route to the same place. Deleting your data should be findable
  // from anywhere on the site, not only from a nav item you have to notice.
  { href: '/account', label: 'footer.link.account' },
];

export default async function Footer() {
  const year = new Date().getFullYear();
  const detailsReady = legalDetailsComplete();
  const { t, locale } = await getTranslator();

  return (
    <footer className="mt-auto border-t border-white/10 bg-slate-950/80 px-5 py-10 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <p className="text-base font-semibold tracking-wider text-white">
              {COMPANY.tradingName}{' '}
              <span className="font-normal tracking-normal text-gray-400">{BRAND.descriptor}</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">
              {t('footer.blurb')}
            </p>
          </div>

          <nav aria-label={t('footer.product')} className="flex flex-col gap-2">
            <p className="font-mono text-xs uppercase tracking-widest text-gray-500">
              {t('footer.product')}
            </p>
            {PRODUCT_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-300 transition hover:text-white"
              >
                {t(link.label)}
              </Link>
            ))}
          </nav>

          <nav aria-label={t('footer.legal')} className="flex flex-col gap-2">
            <p className="font-mono text-xs uppercase tracking-widest text-gray-500">
              {t('footer.legal')}
            </p>
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-300 transition hover:text-white"
              >
                {t(link.label)}
              </Link>
            ))}
            {/* The legal documents are drafts under review and exist in English
                only; a translation of an unreviewed draft would be a second
                unreviewed document. Said plainly rather than left to surprise. */}
            {locale !== 'en' && (
              <p className="max-w-[12rem] text-xs leading-snug text-gray-500">{t('footer.legalEnglishOnly')}</p>
            )}
            {/* Only rendered once a real address exists. A live "Contact us"
                link opening a mail window addressed to TODO@example.com is
                worse than no link — it looks like the site is abandoned. */}
            {detailsReady && (
              <a
                href={`mailto:${CONTACT.support}`}
                className="text-sm text-gray-300 transition hover:text-white"
              >
                {t('footer.link.contact')}
              </a>
            )}
          </nav>
        </div>

        {/* Seller identity. Required for a site selling to consumers, and the
            thing a cautious buyer looks for before entering a card number. */}
        <div className="border-t border-white/10 pt-6 text-xs leading-relaxed text-gray-500">
          {detailsReady ? (
            <p>
              {t('footer.company', {
                trading: COMPANY.tradingName,
                legal: COMPANY.legalName,
                jurisdiction: COMPANY.jurisdiction,
                number: COMPANY.companyNumber,
                address: COMPANY.address,
              })}
              {COMPANY.vatNumber ? ` ${t('footer.vat', { vat: COMPANY.vatNumber })}` : ''}
            </p>
          ) : (
            <p className="text-amber-300/80">{t('footer.placeholders')}</p>
          )}
          <p className="mt-2">{t('footer.rights', { year, trading: COMPANY.tradingName })}</p>
        </div>
      </div>
    </footer>
  );
}
