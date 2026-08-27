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
import { legalDetailsComplete } from '@/lib/legal';

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
}: {
  title: string;
  lastUpdated: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
}) {
  const incomplete = !legalDetailsComplete();

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-14">
      <article className="mx-auto w-full max-w-3xl">
        <Link
          href="/"
          className="text-sm text-indigo-300 underline underline-offset-4 hover:text-white"
        >
          &larr; Back to CareerBridge Way
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">{title}</h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-widest text-gray-500">
          Last updated {lastUpdated}
        </p>

        {incomplete && (
          <div className="mt-6 rounded-lg border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-100">
            <strong className="font-semibold">This document is not finished.</strong>{' '}
            Company details are still placeholders in <code>lib/legal.ts</code>. Fill them
            in before launch — this banner disappears on its own once they are set.
          </div>
        )}

        {intro && (
          <div className="mt-6 flex flex-col gap-3 text-[15px] leading-relaxed text-gray-300">
            {intro}
          </div>
        )}

        <div className="mt-10 border-t border-white/10 pt-8">{children}</div>

        <p className="mt-14 border-t border-white/10 pt-6 text-sm text-gray-500">
          This page is part of the agreement between you and CareerBridge Way. If anything
          here is unclear, ask us before you buy rather than after &mdash; we would rather
          explain it than argue about it later.
        </p>
      </article>
    </main>
  );
}
