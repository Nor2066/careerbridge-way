import type { Metadata } from 'next';
import LegalPage, { LegalSection } from '@/components/LegalPage';
import { COMPANY, CONTACT, LAST_UPDATED, SUBPROCESSORS, RETENTION } from '@/lib/legal';
import { BRAND } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    `What ${BRAND.name} collects, why, who we share it with, how long we keep it, and how to get it deleted.`,
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

      <LegalSection id="sensitive" title="Sensitive information, and what you write in free text">
        <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-4">
          <p className="text-sm text-amber-100">
            <strong className="font-semibold">
              Please avoid putting special category information in a free-text answer if you
              can.
            </strong>{' '}
            You do not need to disclose a health condition, a disability, your religion, your
            ethnicity, your sexual orientation, your political views or your trade union
            membership to get a useful report.
          </p>
        </div>
        <p>
          The free-text questions ask what you have struggled with, what you are afraid of,
          and what you want your life to look like. Some people answer those with information
          that counts as <strong className="text-white">special category data</strong> under
          Article 9 of the UK GDPR &mdash; most often about health or disability.
        </p>
        <p>
          We do not ask for it, we do not want it, and nothing in the scoring model looks for
          it. But if you volunteer it, we necessarily process it in order to produce the
          report you asked for.
        </p>
        <p>
          Where that happens we rely on{' '}
          <strong className="text-white">your explicit consent</strong> under Article 9(2)(a),
          given by choosing to include that information after being asked here not to. You can
          withdraw it at any time by deleting the answer or your account.
        </p>
      </LegalSection>

      <LegalSection id="distress" title="Screening for signs of distress">
        <p>
          A questionnaire that asks students what they have failed at will sometimes receive
          answers describing real distress. So that the service does not respond to a
          disclosure of that kind by cheerfully listing job clusters,{' '}
          <strong className="text-white">
            your free-text answers are checked against a fixed list of phrases
          </strong>{' '}
          that may indicate self-harm or suicidal thoughts. If one matches, we show support
          information above your report and instruct the AI to write in a gentler register.
        </p>
        <p>You should know exactly what this is and is not:</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            It is a <strong className="text-white">keyword check, not an assessment</strong>.
            It will miss things, and it will sometimes fire on innocent phrasing.
          </li>
          <li>
            <strong className="text-white">The result is never stored.</strong> It exists for
            the length of one request and is then gone &mdash; not written to our database,
            not attached to your account, not visible to anyone.
          </li>
          <li>It does not block or delay your report, and it does not change your career results.</li>
          <li>
            <strong className="text-white">It does not alert us</strong>, and no human is
            notified. We do not monitor individuals.
          </li>
        </ul>
        <p>
          We designed it this way deliberately: an inference about someone&rsquo;s mental
          health is special category data, and storing one would create a record about you
          that you never asked us to make.
        </p>
        <p>
          If you are in danger right now, please call 999. Samaritans are free, 24 hours a
          day, on 116 123.
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

      {/* Added with university licences. Drafted to match what the code does;
          like the rest of this page it needs the legal review, in particular
          who is controller for students who come through a university. */}
      <LegalSection id="universities" title="If your university gives you access">
        <p>
          Some universities pay for their students to use {BRAND.name}. If you sign up with a
          confirmed email address on one of a partner university&apos;s domains, you are given
          that university&apos;s free access automatically. We use the domain of your email
          address to do this, and nothing else about you.
        </p>
        <p>
          <strong className="text-white">
            Your university never sees your answers, your reports, or your name.
          </strong>{' '}
          Its staff see only totals for all of its students together: how many have joined,
          how many reports were generated, which career areas come up most often, and the
          average rating people gave. Any group of fewer than five students is hidden, so a
          number can never point at one person.
        </p>
        <p>
          Your university is not given a way to look you up, and we do not send it anything
          about you individually. If you would rather it did not count you in its totals, use
          a personal email address instead and buy access yourself.
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

      <LegalSection
        id="automated"
        title="Automated processing, and whether a machine decides anything about you"
      >
        <p>
          Two automated things happen to your answers: a{' '}
          <strong className="text-white">fixed scoring model</strong> ranks career clusters,
          and an <strong className="text-white">AI system</strong> writes a report. Both are
          automated, and together they amount to profiling as the UK GDPR uses that word.
        </p>
        <p>
          <strong className="text-white">Neither of them makes a decision about you.</strong>{' '}
          Nothing here determines whether you get a job, a place on a course, credit, a
          benefit or anything else. The output is information for you to consider, and every
          decision stays with you.
        </p>
        <p>
          For that reason we do not consider Article 22 &mdash; the right not to be subject to
          a solely automated decision producing legal or similarly significant effects &mdash;
          to be engaged. We are telling you our reasoning rather than asking you to take it on
          trust, and if you disagree you are entitled to say so.
        </p>
        <p>Regardless of that analysis, and without accepting that we have to:</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>we will explain the logic of the scoring model in plain English if you ask;</li>
          <li>
            you may ask a person here to review a report or a set of scores and give you their
            own comment on it; and
          </li>
          <li>you may tell us you think a result is wrong, and we will look at it.</li>
        </ul>
        <p>
          Ask at{' '}
          <a className="text-indigo-300 underline" href={`mailto:${CONTACT.privacy}`}>
            {CONTACT.privacy}
          </a>
          . The{' '}
          <a className="text-indigo-300 underline" href="/ai-notice">
            AI Transparency and Disclaimer Notice
          </a>{' '}
          explains what the AI can and cannot do.
        </p>
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
          and we will respond <strong className="text-white">within one month</strong>. If
          your request is complex, or you have made several, we may extend by up to two
          further months &mdash; and we will tell you within the first month if we do.
        </p>
        <p>
          Exercising these rights is free. We may charge a reasonable fee, or refuse, only if
          a request is manifestly unfounded or excessive, and we will explain why if we ever
          do. If we cannot tell that a request came from you, we may ask you to confirm it
          from the address on the account &mdash; we will not demand identity documents.
        </p>
        <p>
          Some rights have limits. We cannot delete payment records the law requires us to
          keep, and we may keep a minimal note that you asked us to delete something, so we
          can show that we did.
        </p>
        <p>
          If you think we have handled your data badly, you can complain to the{' '}
          <strong className="text-white">Information Commissioner&rsquo;s Office</strong> at
          any time, and you do not have to come to us first &mdash; though we would rather you
          told us so we can put it right. Wycliffe House, Water Lane, Wilmslow, Cheshire SK9
          5AF. Helpline 0303 123 1113.{' '}
          <a
            className="text-indigo-300 underline"
            href="https://ico.org.uk"
            target="_blank"
            rel="noopener noreferrer"
          >
            ico.org.uk
          </a>
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="Cookies and what we store on your device">
        <p>
          We use a small number of strictly necessary cookies to keep you signed in, and a
          little browser session storage to carry your answers between pages. We use no
          advertising cookies and no cross-site tracking, which is why you do not see a
          cookie banner.
        </p>
        <p>
          The full list &mdash; names, purposes and lifetimes, including the cookies Stripe
          and Google set on their own pages &mdash; is in our{' '}
          <a className="text-indigo-300 underline" href="/cookies">
            Cookie Policy
          </a>
          .
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
