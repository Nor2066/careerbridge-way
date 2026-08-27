import type { Metadata } from 'next';
import LegalPage, { LegalSection } from '@/components/LegalPage';
import { CONTACT, LAST_UPDATED } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Refund and Cancellation Policy',
  description:
    'Your 14-day cancellation right, when it applies, and how to get a refund from CareerBridge Way.',
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
          Reply and say so, and a person will look at it again. If we still cannot agree, you
          can contact your bank or card provider about a chargeback, or take the matter to a
          consumer dispute body. We would much rather sort it out directly.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
