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
          You can cancel a purchase within 14 days of buying it and get a full refund &mdash;
          no reason needed. This right comes from the EU Consumer Rights Directive. We are a
          Hungarian company, so we apply it as Hungary has implemented it, in Government
          Decree 45/2014 (II. 26.), together with the consumer rules of the Hungarian Civil
          Code. We apply it the same way to everyone, wherever you live, and if the law of
          your own country gives you more, you get that too.
        </p>
        <p>
          The one exception, and it is an important one: digital content delivered
          immediately. When you buy attempts and then use one to generate a report, you have
          received the digital content, and the law lets you give up your cancellation right
          in exchange for getting it straight away.
        </p>
      </LegalSection>

      <LegalSection id="withdraw" title="Cancelling online">
        <p>
          The quickest way to cancel is the{' '}
          <a className="text-indigo-300 underline" href="/withdraw">
            Withdraw from contract here
          </a>{' '}
          link, at the bottom of every page and on your account page. Give your name and say
          which purchase, press <strong className="text-white">Confirm withdrawal</strong>, and
          we email you a confirmation of what you sent and when, straight away. You do not
          have to be signed in, and you do not have to give a reason.
        </p>
        <p>
          It is there for the 14 days after each purchase. A withdrawal sent before the end of
          the 14th day is on time, however long we then take to deal with it.
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
            <strong className="text-white">Partly used purchases:</strong>{' '}
            we refund the
            part you have not used. Buy three attempts, use one, change your mind in the
            first 14 days &mdash; you get two thirds back.
          </li>
          <li>
            <strong className="text-white">The follow-up bundle</strong> counts as used once
            you have generated any follow-up roadmap with it.
          </li>
          <li>
            <strong className="text-white">Access through your university</strong> is free to
            you, so there is nothing to refund. What the university paid is between it and us.
            If a report you got that way fails or is faulty, tell us and we will regenerate it
            or restore the attempt.
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
          Digital content you buy must be as described, fit for its purpose, and of the quality
          you would normally expect. This comes from the{' '}
          <strong className="text-white">EU Digital Content Directive</strong>{' '}&mdash; in
          Hungary, Government Decree 373/2021 and the consumer rules of the Civil Code, and
          elsewhere in the European Union, your own country&rsquo;s rules implementing the same
          directive. If it is not as it should be, you are entitled to:
        </p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            a <strong className="text-white">repair or replacement</strong>{' '}&mdash; for us,
            regenerating the report or restoring the attempt &mdash; within a reasonable time
            and without significant inconvenience to you; and
          </li>
          <li>
            a <strong className="text-white">price reduction</strong>, or to{' '}
            <strong className="text-white">
              end the contract and get your money back
            </strong>
            , if that does not work or is not possible.
          </li>
        </ul>
        <p>
          If our digital content damages your device or other content, and it would not have
          done had we taken reasonable care, you are entitled to compensation.
        </p>
        <p>
          Outside the European Union, you keep whatever rights the consumer law of your own
          country gives you if something is faulty.
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
          treated than €3. We will refund you outside those rules if:
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
          Within the 14 days, use the{' '}
          <a className="text-indigo-300 underline" href="/withdraw">
            withdrawal form
          </a>
          . Or, at any time, email{' '}
          <a className="text-indigo-300 underline" href={`mailto:${CONTACT.support}`}>
            {CONTACT.support}
          </a>{' '}
          from the address on your account, and tell us what you bought and roughly when.
          You do not need a reference number or a reason.
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
          You can get free, independent advice anywhere in the European Union from the{' '}
          <a
            className="text-indigo-300 underline"
            href="https://www.eccnet.eu"
            target="_blank"
            rel="noopener noreferrer"
          >
            European Consumer Centre
          </a>{' '}
          in your country, which helps for free with purchases from businesses abroad.
          Outside the European Union, your national consumer body can advise you.
        </p>
        <p>
          If you live in Hungary, you can also take the dispute to the{' '}
          <strong className="text-white">conciliation body (békéltető testület)</strong>{' '}
          for the county where you live. It is free, it is quicker than court, and we will
          take part in the procedure. In Budapest that is the Budapest Conciliation Board
          (Budapesti Békéltető Testület), 1016 Budapest, Krisztina körút 99; postal address
          1253 Budapest, Pf. 10; phone +36 1 488 2131;{' '}
          <a className="text-indigo-300 underline" href="mailto:bekelteto.testulet@bkik.hu">
            bekelteto.testulet@bkik.hu
          </a>
          ;{' '}
          <a
            className="text-indigo-300 underline"
            href="https://bekeltet.bkik.hu"
            target="_blank"
            rel="noopener noreferrer"
          >
            bekeltet.bkik.hu
          </a>
          .
        </p>
        <p>
          You can also ask your bank or card provider about a chargeback. We would much rather
          resolve it with you directly, and we will not close your account for raising one.
          Nothing here stops you going to court.
        </p>
      </LegalSection>

      <LegalSection id="cancellation-form" title="Model cancellation form">
        <p>
          You do not have to use this. It is here because EU consumer law requires us to make
          it available (in Hungary, Annex 2 to Government Decree 45/2014) &mdash; a plain email saying you want to cancel works just as
          well, and is faster.
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
