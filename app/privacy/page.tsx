import type { Metadata } from 'next';
import LegalPage, { LegalSection } from '@/components/LegalPage';
import { COMPANY, CONTACT, LAST_UPDATED, SUBPROCESSORS, RETENTION } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'What CareerBridge Way collects, why, who we share it with, how long we keep it, and how to get it deleted.',
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated={LAST_UPDATED.privacy}
      intro={
        <>
          <p>
            <strong className="text-white">Yes, we collect your personal data.</strong> You
            cannot take a career assessment without telling us things about yourself, so
            this page explains exactly what we collect, what we do with it, and how to make
            us delete it.
          </p>
          <p>
            The short version: we collect your email address and your assessment answers, we
            send those answers to an AI provider to write your report, and we keep them
            until you tell us to stop. We do not sell anything to anyone, and we do not use
            your answers for advertising.
          </p>
        </>
      }
    >
      <LegalSection id="who-we-are" title="Who we are">
        <p>
          {COMPANY.tradingName} is a trading name of {COMPANY.legalName}, a company
          registered in {COMPANY.jurisdiction} under number {COMPANY.companyNumber}, with a
          registered office at {COMPANY.address}.
          {COMPANY.vatNumber ? ` Our VAT number is ${COMPANY.vatNumber}.` : ''}
        </p>
        <p>
          We are the data controller for the personal data described on this page. For
          anything to do with your data, write to{' '}
          <a className="text-indigo-300 underline" href={`mailto:${CONTACT.privacy}`}>
            {CONTACT.privacy}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="what-we-collect" title="What we collect">
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            <strong className="text-white">Your email address</strong>, so you can sign in
            and so we can send you your receipt and sign-in links. If you sign in with
            Google, we receive your email address from Google &mdash; not your password.
          </li>
          <li>
            <strong className="text-white">Your assessment answers</strong>, including the
            free-text answers about your interests, values, and ambitions.
          </li>
          <li>
            <strong className="text-white">The reports we generate for you</strong>, so you
            can read them again later from your history.
          </li>
          <li>
            <strong className="text-white">Your purchase history</strong> &mdash; what you
            bought, when, and for how much. We never see or store your card number; Stripe
            handles that.
          </li>
          <li>
            <strong className="text-white">Technical records</strong> &mdash; your IP
            address and browser details, in server and error logs. We use these to keep the
            service running and to stop abuse.
          </li>
        </ul>
        <p>
          We do not ask for your date of birth, your address, or any identity documents,
          and you should not put them in a free-text answer.
        </p>
      </LegalSection>

      <LegalSection id="ai" title="We use AI to write your report">
        <p>
          <strong className="text-white">
            Your answers are processed by an artificial intelligence system.
          </strong>{' '}
          When you ask for a report, we send the relevant parts of your assessment answers
          to OpenAI, which generates the text of the report. This is the core of what the
          product does, so there is no way to use the service without it.
        </p>
        <p>
          OpenAI processes this data on our instructions, as our processor. Under their API
          terms, data sent through the API is not used to train their models. Their
          processing takes place in the United States.
        </p>
        <p>
          AI-generated text can be wrong, and sometimes confidently so. Your report is
          information to think about, not professional careers advice, and never a
          prediction of what will happen to you. See our{' '}
          <a className="text-indigo-300 underline" href="/terms">
            Terms of Service
          </a>{' '}
          for what that means.
        </p>
      </LegalSection>

      <LegalSection id="third-parties" title="Who else touches your data">
        <p>
          These are every third party we send personal data to, and what each of them gets.
          We do not sell your data, and none of these companies may use it for their own
          purposes.
        </p>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full min-w-[34rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/20 text-left text-xs uppercase tracking-wider text-gray-400">
                <th className="py-2 pr-4 font-medium">Company</th>
                <th className="py-2 pr-4 font-medium">What for</th>
                <th className="py-2 pr-4 font-medium">What they get</th>
                <th className="py-2 font-medium">Where</th>
              </tr>
            </thead>
            <tbody>
              {SUBPROCESSORS.map((s) => (
                <tr key={s.name} className="border-b border-white/10 align-top">
                  <td className="py-3 pr-4 font-medium text-white">{s.name}</td>
                  <td className="py-3 pr-4 text-gray-300">{s.purpose}</td>
                  <td className="py-3 pr-4 text-gray-300">{s.data}</td>
                  <td className="py-3 text-gray-400">{s.region}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Where a company processes data outside the UK, that transfer is covered by the UK
          International Data Transfer Addendum or an equivalent safeguard.
        </p>
      </LegalSection>

      <LegalSection id="lawful-basis" title="Why we are allowed to do this">
        <p>Under UK GDPR we rely on:</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            <strong className="text-white">Contract</strong> &mdash; for your account, your
            assessment, your report, and your payment. We cannot deliver what you bought
            without processing this data.
          </li>
          <li>
            <strong className="text-white">Legitimate interests</strong> &mdash; for
            security logging, rate limiting, and fixing faults. Our interest is in keeping
            the service working and not being defrauded; the data involved is minimal.
          </li>
          <li>
            <strong className="text-white">Legal obligation</strong> &mdash; for keeping
            records of sales for tax purposes.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="retention" title="How long we keep it">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[30rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/20 text-left text-xs uppercase tracking-wider text-gray-400">
                <th className="py-2 pr-4 font-medium">What</th>
                <th className="py-2 pr-4 font-medium">How long</th>
                <th className="py-2 font-medium">Why</th>
              </tr>
            </thead>
            <tbody>
              {RETENTION.map((r) => (
                <tr key={r.what} className="border-b border-white/10 align-top">
                  <td className="py-3 pr-4 font-medium text-white">{r.what}</td>
                  <td className="py-3 pr-4 text-gray-300">{r.how_long}</td>
                  <td className="py-3 text-gray-400">{r.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection id="deletion" title="Deleting your data">
        <p>
          You can delete your account and everything attached to it from your account
          settings. It removes your profile, your assessment answers, your saved progress,
          and every report we generated for you. It is immediate and it cannot be undone.
        </p>
        <p>
          Payment records are the one exception: UK tax law requires us to keep a record of
          each sale for six years. We strip your name and email from those records where we
          can, leaving only what the law requires.
        </p>
      </LegalSection>

      <LegalSection id="your-rights" title="Your rights">
        <p>Under UK GDPR you can ask us to:</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>Give you a copy of your data &mdash; there is an export button in your account settings</li>
          <li>Correct anything that is wrong</li>
          <li>Delete your data</li>
          <li>Restrict or object to how we use it</li>
          <li>Hand your data to another provider in a portable format</li>
        </ul>
        <p>
          Email{' '}
          <a className="text-indigo-300 underline" href={`mailto:${CONTACT.privacy}`}>
            {CONTACT.privacy}
          </a>{' '}
          and we will respond within one month. If you think we have handled your data
          badly, you can complain to the Information Commissioner&rsquo;s Office at{' '}
          <a
            className="text-indigo-300 underline"
            href="https://ico.org.uk"
            target="_blank"
            rel="noopener noreferrer"
          >
            ico.org.uk
          </a>
          . We would rather you told us first so we can put it right.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="Cookies">
        <p>
          We use cookies to keep you signed in. That is the whole list. They are strictly
          necessary for a service you asked for, so we are not required to ask permission
          for them and we do not show you a banner about them.
        </p>
        <p>
          We do not use advertising cookies, and we do not let anyone track you across other
          websites. If that ever changes, we will ask you first and this page will say so.
        </p>
      </LegalSection>

      <LegalSection id="age" title="If you are under 18">
        <p>
          You need to be at least 16 to have an account. If you are under 16, ask a parent
          or guardian to set one up and use it with you.
        </p>
        <p>
          If you believe a child under 16 has given us their data, email{' '}
          <a className="text-indigo-300 underline" href={`mailto:${CONTACT.privacy}`}>
            {CONTACT.privacy}
          </a>{' '}
          and we will delete it.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Changes to this policy">
        <p>
          If we change how we use your data, we will update this page and change the date at
          the top. If the change is significant, we will email you about it rather than
          hoping you notice.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
