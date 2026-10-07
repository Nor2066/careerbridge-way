import type { Metadata } from 'next';
import LegalPage, { LegalSection } from '@/components/LegalPage';
import { COMPANY, CONTACT, LAST_UPDATED } from '@/lib/legal';
import { BRAND } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Refund and Cancellation Policy',
  description:
    `Your 14-day cancellation right, when it applies, and how to get a refund from ${BRAND.name}.`,
};

export default function RefundsPage() {
  return (
    <LegalPage
      title="Refund and Cancellation Policy"
      lastUpdated={LAST_UPDATED.refunds}
      intro={
        <>
          <p>
            You have a legal right to change your mind about most online purchases within 14
            days. This page explains how that works here, where it stops applying, and how to
            ask for your money back.
          </p>
          <p>
            <strong className="text-white">
              We do not run subscriptions and nothing renews automatically.
            </strong>{' '}
            Every purchase is a one-off. You will never be charged again unless you
            deliberately buy something else.
          </p>
        </>
      }
    >
      <LegalSection id="right-to-cancel" title="Your 14-day right to cancel">
        <p>
          Under the Consumer Contracts (Information, Cancellation and Additional Charges)
          Regulations 2013, you can cancel a purchase within 14 days of buying it and get a
          full refund &mdash; no reason needed.
        </p>
        <p>
          The one exception, and it is an important one: digital content delivered
          immediately. When you buy attempts and then use one to generate a report, you have
          received the digital content, and the law lets you give up your cancellation right
          in exchange for getting it straight away.
        </p>
      </LegalSection>

      <LegalSection id="how-it-works" title="What that means in practice">
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            <strong className="text-white">Unused attempts: full refund, 14 days.</strong>{' '}
            If you have bought a plan or top-up and not generated a report with it, ask
            within 14 days and we will refund you in full.
          </li>
          <li>
            <strong className="text-white">
              Attempts you have used: no automatic right to a refund.
            </strong>{' '}
            Once a report has been generated for you, that part of the purchase has been
            delivered, and you agreed at checkout to receive it immediately.
          </li>
          <li>
            <strong className="text-white">Partly used purchases:</strong> we refund the
            part you have not used. Buy three attempts, use one, change your mind in the
            first 14 days &mdash; you get two thirds back.
          </li>
          <li>
            <strong className="text-white">The follow-up bundle</strong> counts as used once
            you have generated any follow-up roadmap with it.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="faulty" title="Your separate rights if something is faulty">
        <div className="rounded-lg border border-indigo-400/30 bg-indigo-400/10 p-4">
          <p className="text-sm text-indigo-100">
            <strong className="font-semibold">
              The 14-day right and your faulty-content rights are two different things.
            </strong>{' '}
            The 14 days are about changing your mind. The rights below are about something
            being wrong, and they are not limited to 14 days.
          </p>
        </div>
        <p>
          Under the <strong className="text-white">Consumer Rights Act 2015</strong>, digital
          content you buy must be of satisfactory quality, fit for its purpose, and as
          described. If it is not, you are entitled to:
        </p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            a <strong className="text-white">repair or replacement</strong> &mdash; for us,
            regenerating the report or restoring the attempt &mdash; within a reasonable time
            and without significant inconvenience to you; and
          </li>
          <li>
            a <strong className="text-white">price reduction of up to the full amount</strong>{' '}
            if that does not work or is not possible.
          </li>
        </ul>
        <p>
          If our digital content damages your device or other content, and it would not have
          done had we taken reasonable care, section 46 of that Act entitles you to a repair
          or to compensation.
        </p>
        <p>
          <strong className="text-white">
            Nothing in this policy or in our terms takes those rights away
          </strong>
          , and we cannot ask you to give them up.
        </p>
      </LegalSection>

      <LegalSection id="beyond-the-rules" title="When we refund anyway">
        <p>
          The above is the legal minimum. We would rather have a person who felt fairly
          treated than £3. We will refund you outside those rules if:
        </p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            Something broke &mdash; your report failed to generate, came back empty, or an
            attempt was taken without you getting anything for it
          </li>
          <li>You were charged twice for the same thing</li>
          <li>
            The report you received is obviously not what was described on the page you
            bought from
          </li>
        </ul>
        <p>
          If an attempt was consumed and no report reached you, tell us and we will restore
          the attempt or refund it. You should not have to argue for that.
        </p>
      </LegalSection>

      <LegalSection id="how-to-ask" title="How to ask">
        <p>
          Email{' '}
          <a className="text-indigo-300 underline" href={`mailto:${CONTACT.support}`}>
            {CONTACT.support}
          </a>{' '}
          from the address on your account, and tell us what you bought and roughly when.
          You do not need a form, a reference number, or a reason.
        </p>
        <p>
          We will reply within 3 working days. Approved refunds go back to the card you paid
          with, through Stripe, within 14 days &mdash; usually much sooner. Your bank may
          take a few days after that to show it.
        </p>
      </LegalSection>

      <LegalSection id="cancelling-account" title="Closing your account">
        <p>
          You can delete your account at any time from your account settings. It takes one
          click and it is not hidden behind an email to us.
        </p>
        <p>
          Deleting your account does not automatically refund unused attempts, so if you want
          your money back, ask us before you delete &mdash; afterwards we no longer hold the
          records that let us work out what you were owed.
        </p>
      </LegalSection>

      <LegalSection id="problems" title="If you are not happy with the outcome">
        <p>
          Reply and say so, and a different person will look at it again. Most disagreements
          end here.
        </p>
        <p>
          You can get free, independent advice from{' '}
          <strong className="text-white">Citizens Advice</strong> at{' '}
          <a
            className="text-indigo-300 underline"
            href="https://www.citizensadvice.org.uk"
            target="_blank"
            rel="noopener noreferrer"
          >
            citizensadvice.org.uk
          </a>
          , or on <strong className="text-white">0808 223 1133</strong>.
        </p>
        <p>
          You can also ask your bank or card provider about a chargeback. We would much rather
          resolve it with you directly, and we will not close your account for raising one.
          Nothing here stops you going to court.
        </p>
      </LegalSection>

      <LegalSection id="cancellation-form" title="Model cancellation form">
        <p>
          You do not have to use this. It is here because the Consumer Contracts Regulations
          2013 require us to make it available &mdash; a plain email saying you want to cancel
          works just as well, and is faster.
        </p>
        <div className="rounded-lg border border-white/15 bg-white/5 p-4 font-mono text-xs leading-relaxed text-gray-300">
          <p>
            To: {COMPANY.legalName}, {COMPANY.address}
          </p>
          <p>Email: {CONTACT.support}</p>
          <p className="mt-3">
            I hereby give notice that I cancel my contract for the supply of the following
            service:
          </p>
          <p className="mt-3">Ordered on / received on: ................................</p>
          <p className="mt-2">Name of consumer: ........................................</p>
          <p className="mt-2">Address of consumer: .....................................</p>
          <p className="mt-2">Email address on the account: ............................</p>
          <p className="mt-2">
            Signature (only if notifying on paper): ..................
          </p>
          <p className="mt-2">Date: ....................................................</p>
        </div>
        <p>Complete and return this form only if you wish to withdraw from the contract.</p>
      </LegalSection>
    </LegalPage>
  );
}
