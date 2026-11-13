// components/LegalPage.tsx
//
// Shared shell for the privacy policy, terms, and refund policy.
//
// These read differently from the rest of the site on purpose. The marketing
// pages are glass cards over a photograph; a legal document is something
// people skim under stress — usually looking for one specific answer, often on
// a phone, sometimes just before deciding whether to trust you with a payment.
// So: high contrast, a measured line length, real headings, no background
// image competing with the text.

import Link from 'next/link';
import { COMPANY } from '@/lib/legal';
import { toSpanishDate } from '@/lib/legal-es';

export function LegalSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-10 first:mt-0">
      <h2 className="mb-3 text-xl font-semibold text-white">{title}</h2>
      <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-gray-300">
        {children}
      </div>
    </section>
  );
}

export default function LegalPage({
  title,
  lastUpdated,
  intro,
  children,
  locale = 'en',
}: {
  title: string;
  lastUpdated: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
  /** 'es' shows the Spanish frame and the note that the English text binds (Terms 13). */
  locale?: 'en' | 'es';
}) {
  const es = locale === 'es';
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-14" lang={es ? 'es' : undefined}>
      <article className="mx-auto w-full max-w-3xl">
        <Link
          href="/"
          className="text-sm text-indigo-300 underline underline-offset-4 hover:text-white"
        >
          &larr; {es ? 'Volver a' : 'Back to'} {COMPANY.tradingName}
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">{title}</h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-widest text-gray-500">
          {es ? `Última actualización: ${toSpanishDate(lastUpdated)}` : `Last updated ${lastUpdated}`}
        </p>

        {es && (
          <p className="mt-6 rounded-lg border border-white/15 bg-white/5 p-4 text-sm text-gray-300">
            Esta es una traducción al español para tu comodidad. El texto original está en
            inglés: si las dos versiones difieren, se aplica el inglés, salvo que la ley del
            lugar donde vives te dé derecho a basarte en la traducción. Para ver la versión en
            inglés, cambia el idioma a English con el selector de idioma.
          </p>
        )}

        {intro && (
          <div className="mt-6 flex flex-col gap-3 text-[15px] leading-relaxed text-gray-300">
            {intro}
          </div>
        )}

        <div className="mt-10 border-t border-white/10 pt-8">{children}</div>

        <p className="mt-14 border-t border-white/10 pt-6 text-sm text-gray-500">
          {es ? (
            <>
              Esta página forma parte del acuerdo entre tú y {COMPANY.tradingName}. Si algo no
              está claro, pregúntanos antes de comprar y no después: preferimos explicarlo a
              discutirlo más tarde.
            </>
          ) : (
            <>
              This page is part of the agreement between you and {COMPANY.tradingName}. If
              anything here is unclear, ask us before you buy rather than after &mdash; we would
              rather explain it than argue about it later.
            </>
          )}
        </p>
      </article>
    </main>
  );
}
