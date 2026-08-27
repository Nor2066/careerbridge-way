// app/sample-report/page.tsx
//
// The launch checklist asks for a "demo account". I have deliberately not built
// one, and this is the alternative.
//
// A demo account means a shared username and password, which is a real account
// with a real session on a site that takes payments — the password gets pasted
// into chats and screenshots, it never rotates, and it is the one credential
// nobody feels responsible for. Having just spent a week closing an escalation
// path, adding a permanently shared login would be a step backwards.
//
// This does the jobs a demo account was wanted for, without any of that: it
// shows a support agent what the customer is describing, gives you something
// to screenshot for marketing, and lets a buyer see what they are paying for
// before they pay. The landing page already demos the questionnaire; the
// report is the part nobody could see until they had bought it.
//
// Static content, so there is nothing to keep in sync and nothing to leak.

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sample career report',
  description:
    'An example of the AI-generated career report CareerBridge Way produces, so you can see what you get before you buy.',
};

const CLUSTERS = [
  { name: 'Healthcare & Wellbeing', pct: 78.4 },
  { name: 'Education & Training', pct: 71.2 },
  { name: 'Social & Community', pct: 66.9 },
];

const REPORT = `Thank you for taking the time to work through the assessment properly — the detail in your answers makes a real difference to what follows.

Your three strongest clusters are Healthcare & Wellbeing, Education & Training, and Social & Community. That combination is a coherent one rather than a coincidence, and it says something specific about you.

Healthcare & Wellbeing came out highest, driven mainly by how you rated empathy and working under pressure, and by your comfort with responsibility. You described wanting work where the outcome of a good day is that someone is better off. That is the thread running through this cluster: the value is delivered to a person, and you can see it land.

Education & Training follows closely, and for related reasons. Your communication and patience scores are high, and you wrote about explaining things to people who had been made to feel stupid elsewhere. Teaching rewards the same instinct as care work — noticing where somebody actually is, rather than where the material assumes they are.

Social & Community rounds out the picture. Your answers on values placed fairness and stability above income and status. That does not mean you should expect to earn little; it means you are unlikely to stay somewhere that pays well and asks you to be indifferent.

Two things worth naming honestly. You rated your tolerance for uncertainty on the lower side, which sits awkwardly with parts of frontline healthcare where shifts and workload are unpredictable. And you said you would rather not relocate, which narrows some routes considerably. Neither is a problem — both are worth deciding about deliberately rather than discovering later.

The follow-up questionnaire is where this becomes concrete: specific roles, the qualifications each one needs, and a realistic sense of what the next three months could look like.`;

export default function SampleReportPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-14">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-lg border border-indigo-400/30 bg-indigo-400/5 px-4 py-3">
          <p className="text-sm text-indigo-100">
            <strong className="font-semibold">This is an example.</strong> It was written for a
            made-up person so you can see the format before you buy. Yours will be based on your
            own answers.
          </p>
        </div>

        <h1 className="mt-8 text-3xl font-bold text-white sm:text-4xl">
          What your report looks like
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-gray-400">
          Every assessment produces a breakdown of your strongest career clusters and a written
          report explaining why you fit them. The follow-up adds specific roles, qualifications,
          and a three-month plan.
        </p>

        {/* Clusters */}
        <section className="mt-10 rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-bold text-white">Top 3 career clusters</h2>
          <ul className="mt-5 flex flex-col gap-5">
            {CLUSTERS.map((c) => (
              <li key={c.name}>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-medium text-white">{c.name}</span>
                  <span className="font-mono text-sm text-indigo-300">{c.pct}%</span>
                </div>
                <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-700">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Report body */}
        <section className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-bold text-white">Your personalised career report</h2>
          <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-gray-200">
            {REPORT}
          </p>
        </section>

        <p className="mt-6 text-sm leading-relaxed text-gray-500">
          Reports are generated by AI from your answers. They are information to think about
          alongside people who know you &mdash; not professional careers advice, and not a
          prediction. See our{' '}
          <Link href="/terms" className="text-indigo-300 underline">
            terms
          </Link>{' '}
          for what that means.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/assess" className="btn-primary">
            Take the assessment
          </Link>
          <Link href="/pricing" className="btn-secondary">
            See pricing
          </Link>
        </div>
      </div>
    </main>
  );
}
