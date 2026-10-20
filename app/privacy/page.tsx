import type { Metadata } from 'next';
import LegalPage, { LegalSection } from '@/components/LegalPage';
import { COMPANY, CONTACT, LAST_UPDATED, MINIMUM_AGE, SUBPROCESSORS, RETENTION } from '@/lib/legal';
import { BRAND } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    `What ${BRAND.name} collects, why, who we share it with, what a partner university can see, how long we keep it, and how to get it deleted.`,
};

export default function PrivacyPolicyPage() {
  const privacyLink = (
    <a className="text-indigo-300 underline" href={`mailto:${CONTACT.privacy}`}>
      {CONTACT.privacy}
    </a>
  );

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
          <p>
            <strong className="text-white">
              We also study the answers and results we already hold in order to make the
              service better
            </strong>{' '}
            &mdash; which questions work, where the scoring is wrong, where reports are weak.
            Usually on figures rather than individuals, and sometimes using AI tools to do
            the reading.{' '}
            <a className="text-indigo-300 underline" href="#improving">
              How that works, and how to say no
            </a>
            .
          </p>
          <p>
            If your university gives you access, it pays for your account but{' '}
            <strong className="text-white">
              never sees your answers, your reports or your name
            </strong>{' '}
            &mdash; only anonymous totals for all its students together.{' '}
            <a className="text-indigo-300 underline" href="#universities">
              What it can see
            </a>
            .
          </p>
        </>
      }
    >
      <LegalSection id="who-we-are" title="Who we are">
        <p>
          {COMPANY.tradingName} is a trading name of {COMPANY.legalName}, a company
          registered in {COMPANY.jurisdiction} under company registration number
          (cégjegyzékszám) {COMPANY.companyNumber} by the {COMPANY.registryCourt}, with its
          registered seat at {COMPANY.address}. Our Hungarian tax number is{' '}
          {COMPANY.taxNumber}.
          {COMPANY.euVatNumber ? ` Our EU VAT number is ${COMPANY.euVatNumber}.` : ''}
        </p>
        <p>
          We are the <strong className="text-white">data controller</strong> for the personal
          data described on this page. That includes students who come to us through a
          partner university: you have your own account with us, and we decide how your data
          is used, not the university. For anything to do with your data, write to{' '}
          {privacyLink}.
        </p>
        <p>
          We offer the service to people in many countries. We are established in Hungary, in
          the European Union, so the EU General Data Protection Regulation (GDPR) governs how
          we handle your data wherever you live, and the Hungarian data protection authority,
          NAIH, is our lead supervisory authority. Where the law of your own country also
          protects your data, you keep that protection too &mdash; see{' '}
          <a className="text-indigo-300 underline" href="#your-rights">
            Your rights
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="what-we-collect" title="What we collect">
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            <strong className="text-white">Your email address</strong>, so you can sign in
            and so we can send you receipts, sign-in links and a note when your report is
            ready. If you sign in with Google, we receive your email address from Google
            &mdash; not your password.
          </li>
          <li>
            <strong className="text-white">Your assessment answers</strong>, including the
            free-text answers about your interests, values and ambitions, and your answers to
            the follow-up questionnaire if you take it.
          </li>
          <li>
            <strong className="text-white">The reports we generate for you</strong>, so you
            can read them again later from your history.
          </li>
          <li>
            <strong className="text-white">Ratings and comments</strong> you choose to leave
            about how accurate a report felt.
          </li>
          <li>
            <strong className="text-white">Your purchase history</strong>{' '}&mdash; what you
            bought, when, and for how much. We never see or store your card number; Stripe
            handles that.
          </li>
          <li>
            <strong className="text-white">Which partner university you joined through</strong>
            , if any. We work this out from the domain of your confirmed email address (the part
            after the @), and we use it to give you the university&rsquo;s free access and to
            count you in its anonymous totals.
          </li>
          <li>
            <strong className="text-white">Your language</strong>{' '}&mdash; English or Spanish
            &mdash; so the site and your report are written in it. If you pick one with the
            language switch, a cookie remembers it.
          </li>
          <li>
            <strong className="text-white">Your approximate country</strong>, worked out by
            our hosting provider from your connection, used only to show the right helplines
            if your answers suggest you may be struggling. We do not store it.
          </li>
          <li>
            <strong className="text-white">Technical records</strong>{' '}&mdash; your IP
            address and browser details, in server and error logs. We use these to keep the
            service running and to stop abuse.
          </li>
        </ul>
        <p>
          We do not ask for your date of birth, your home address, or any identity documents,
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
          that counts as <strong className="text-white">special category data</strong>{' '}
            under
          Article 9 of the GDPR &mdash; most often about health or disability.
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
          withdraw it at any time by deleting the answer or your account. None of it ever
          reaches your university.
        </p>
      </LegalSection>

      <LegalSection id="distress" title="Screening for signs of distress">
        <p>
          A questionnaire that asks students what they have failed at will sometimes receive
          answers describing real distress. So that the service does not respond to a
          disclosure of that kind by cheerfully listing job clusters,{' '}
          <strong className="text-white">
            your free-text answers are checked against a fixed list of phrases
          </strong>
          , in English and in Spanish, that may indicate self-harm or suicidal thoughts. If one
          matches, we show support information above your report and instruct the AI to write
          in a gentler register.
        </p>
        <p>You should know exactly what this is and is not:</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            It is a <strong className="text-white">keyword check, not an assessment</strong>.
            It will miss things, and it will sometimes fire on innocent phrasing.
          </li>
          <li>
            <strong className="text-white">The result is never stored.</strong>{' '}
            It exists for
            the length of one request and is then gone &mdash; not written to our database,
            not attached to your account, not visible to anyone, and never passed to your
            university.
          </li>
          <li>It does not block or delay your report, and it does not change your career results.</li>
          <li>
            <strong className="text-white">It does not alert us</strong>, and no human is
            notified. We do not monitor individuals.
          </li>
        </ul>
        <p>
          The helplines we show depend on where you are: the country of your partner
          university if you have one, otherwise the approximate country of your connection.
          Where we have no local list we show an international directory.
        </p>
        <p>
          We designed it this way deliberately: an inference about someone&rsquo;s mental
          health is special category data, and storing one would create a record about you
          that you never asked us to make.
        </p>
        <p>
          If you are in danger right now, call your local emergency number &mdash; 112
          anywhere in Europe, 999 in the UK.
        </p>
      </LegalSection>

      <LegalSection id="ai" title="We use AI to write your report">
        <p>
          <strong className="text-white">
            Your answers are processed by an artificial intelligence system.
          </strong>{' '}
          When you ask for a report, we send OpenAI your assessment answers, including the
          free text, your career scores, and the language you use the site in. For the
          follow-up roadmap we also send your follow-up answers and the first report, so the
          roadmap can build on it. If you came through a university, we tell the AI which
          country the university is in, so that its advice fits where you study. This is the
          core of what the product does, so there is no way to use the service without it.
        </p>
        <p>
          We do not send your name, your email address, your payment details, your account
          identifier or your IP address.
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

      <LegalSection id="improving" title="How we use your answers to improve the service">
        <p>
          A career questionnaire is only as good as the evidence behind it. The only evidence
          we have is what people actually answered and what they thought of the reports, so{' '}
          <strong className="text-white">
            we study the answers and results we already hold in order to make the service
            better.
          </strong>{' '}
          We would rather say so plainly here than describe it vaguely as
          &ldquo;analytics&rdquo;.
        </p>

        <p className="font-medium text-white">What we actually do with it</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            Find questions that are confusing, badly worded, or that nobody answers, and
            rewrite or remove them.
          </li>
          <li>
            Check whether the scoring model produces sensible results, and change the weights
            behind it where it does not.
          </li>
          <li>
            Look at where reports are weak, repetitive or unhelpful, and improve the
            instructions we give the AI that writes them.
          </li>
          <li>
            Read the ratings and comments people leave on reports, and work out what they have
            in common.
          </li>
          <li>Understand which parts of the service people give up on, and fix those parts.</li>
        </ul>

        <p className="font-medium text-white">How we do it</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            <strong className="text-white">
              Wherever the question can be answered with figures, we use figures
            </strong>{' '}
            &mdash; counts, averages and patterns across many people, not a tour through
            individual accounts.
          </li>
          <li>
            Where we do need to look at the content of answers, we work from{' '}
            <strong className="text-white">
              data with the identifying details stripped out
            </strong>
            : no email address, no name, no account identifier, no payment record.
          </li>
          <li>
            <strong className="text-white">We may use AI tools to do this reading.</strong> It
            is not practical to read thousands of free-text answers by hand, so we may ask an
            AI system to summarise themes and patterns across them. That goes to the same
            provider listed below, under the same terms, and it sees the answers without the
            details that identify you.
          </li>
          <li>
            Nothing we learn is published in a form that could identify you, and no individual
            report or answer is ever shown to anyone outside {BRAND.name}.
          </li>
        </ul>

        <div className="rounded-lg border border-indigo-400/30 bg-indigo-400/10 p-4">
          <p className="text-sm text-indigo-100">
            <strong className="font-semibold">What we never do with it.</strong>{' '}
            We do not sell your data, or share it with anyone who wants to sell you
            something. We do not use it for advertising and we do not build a marketing
            profile from it. And we never use it to make a decision about you.
          </p>
          <p className="mt-3 text-sm text-indigo-100">
            <strong className="font-semibold">
              We do not train AI models on your data. Not ours, not our
              providers&rsquo;, not anyone&rsquo;s.
            </strong>{' '}
            Using an AI to read and summarise answers is not the same as training one: the
            model is given text, it answers, and it keeps nothing afterwards.
          </p>
          <p className="mt-3 text-sm text-indigo-100">
            If we ever decide we do want to train a model on what people have told us,{' '}
            <strong className="font-semibold">we will come and ask you first.</strong> We
            will not treat this policy, or the fact that you agreed to it once, as
            permission for that.
          </p>
        </div>

        <p className="font-medium text-white">Sensitive information is left out</p>
        <p>
          If you volunteered special category information in a free-text answer &mdash; most
          often about health or disability &mdash;{' '}
          <strong className="text-white">
            that is used only to write your own report, and is excluded from this work.
          </strong>{' '}
          You gave explicit consent for the first purpose and not for the second, and we are
          not going to treat the one as covering the other.
        </p>

        <p className="font-medium text-white">Why we are allowed to, and how to say no</p>
        <p>
          We rely on <strong className="text-white">legitimate interests</strong>. Our interest
          is in building a questionnaire that works; yours is in not being studied without
          being told. We have weighed them and concluded this does not override your rights,
          because the work runs on stripped or aggregated data, nothing about you is published,
          nobody outside {BRAND.name} sees your answers, and no decision is made about you.
        </p>
        <p>
          <strong className="text-white">You can object, and we will stop.</strong> Write to{' '}
          {privacyLink} and we will exclude your answers and results from this work. It costs
          you nothing: your reports, your history and your access are unaffected, and we will
          not ask you to justify it.
        </p>
        <p>
          This applies to everyone in the same way,{' '}
          <strong className="text-white">
            whether you pay for your own access or a university pays for it
          </strong>
          . It is a separate thing from the anonymous totals your university sees, which are
          explained next, and objecting to one does not object to the other &mdash; tell us if
          you want out of both.
        </p>
      </LegalSection>

      <LegalSection id="universities" title="If your university gives you access">
        <p>
          Some universities pay for their students to use {BRAND.name}. If you sign up with a
          confirmed email address on one of a partner university&rsquo;s domains, you are
          given that university&rsquo;s free access automatically. We use the domain of your
          email address to do this, and nothing else about you.
        </p>
        <p>
          <strong className="text-white">
            Your university never sees your answers, your reports, your comments or your name.
          </strong>{' '}
          The staff it names to us see a dashboard of totals for all of its students together:
          how many have joined, how many reports and roadmaps were generated and in which
          months, which career areas come up most often as students&rsquo; strongest, and the
          average rating students gave their reports.{' '}
          <strong className="text-white">
            Any figure based on fewer than five students is hidden
          </strong>
          , so a number cannot point at one person. These totals are anonymous: they do not
          identify you and they are not personal data about you.
        </p>
        <p>
          Your university is not given a way to look you up, and we do not send it anything
          about you individually &mdash; not whether you joined, not whether you finished, and
          not what you were advised. Our contract with each university forbids it from trying
          to identify students from the totals, and from using {BRAND.name} to make any
          decision about a student, such as admission, grading or discipline.
        </p>
        <p className="font-medium text-white">Why we may do this</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            Linking your account to your university, so you get the access it pays for, is
            part of providing the service you signed up for (contract).
          </li>
          <li>
            Counting you in the anonymous totals is in our legitimate interests and the
            university&rsquo;s: it shows the university that the access it pays for is being
            used, and which careers its students lean towards, without telling it anything
            about any one student.
          </li>
        </ul>
        <p>
          You can object to being counted. Write to {privacyLink}{' '}
          and we will take your
          results out of your university&rsquo;s figures; you keep your free access. If you
          would rather have no link to your university at all, use a personal email address
          and buy access yourself.
        </p>
        <p>
          Separately from the totals, your answers and results are also used to improve the
          service, in exactly the same way as for anyone who pays for their own access
          &mdash; no more because a university is involved, and no less.{' '}
          <a className="text-indigo-300 underline" href="#improving">
            How that works, and how to object
          </a>
          .
        </p>
        <p>
          <strong className="text-white">When a licence ends</strong>, your account and your
          reports stay yours. Only the free attempts stop; anything you bought yourself is
          unaffected.
        </p>
      </LegalSection>

      <LegalSection id="university-staff" title="If you work at a partner university">
        <p>
          If your university has named you as someone who may see its dashboard, it gave us
          your work email address. We use it only to let you sign in to that dashboard and to
          contact you about the university&rsquo;s licence. We rely on our legitimate interest
          in performing our agreement with your university.
        </p>
        <p>
          We keep your address until the university asks us to remove you, and for no more than
          12 months after its agreement with us ends. You have the same rights as anyone else
          on this page.
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
          Partner universities are not on this list because they receive no personal data
          from us, only the anonymous totals described above.
        </p>
        <p>
          Some of these companies process data outside the European Economic Area, mainly in
          the United States. Each transfer is covered by a recognised safeguard under Chapter V
          of the GDPR: an adequacy decision where one exists (including the EU&ndash;US Data
          Privacy Framework, where the company is certified), or otherwise the European
          Commission&rsquo;s standard contractual clauses. Where the law of another country
          also governs your data &mdash; for example if you live in the United Kingdom or
          Switzerland &mdash; we rely on that country&rsquo;s matching safeguards as well.
          Ask us for a copy of the safeguard that applies.
        </p>
      </LegalSection>

      <LegalSection id="lawful-basis" title="Why we are allowed to do this">
        <p>
          We rely on these grounds under Article 6 of the GDPR, and on the same grounds under
          the equivalent laws of other countries where they apply to you:
        </p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            <strong className="text-white">Contract</strong>{' '}&mdash; for your account, your
            assessment, your reports, your payments, and the free access a partner university
            gives you. We cannot deliver the service without processing this data.
          </li>
          <li>
            <strong className="text-white">Legitimate interests</strong>{' '}&mdash; for security
            logging, rate limiting and fixing faults; for{' '}
            <a className="text-indigo-300 underline" href="#improving">
              studying answers and results to improve the service
            </a>
            ; for counting you in your university&rsquo;s anonymous totals; for working out
            your approximate country to show the right helplines; and for university staff
            contact details. In each case the data involved is minimal and you can object.
          </li>
          <li>
            <strong className="text-white">Legal obligation</strong>{' '}&mdash; for keeping
            records of sales for tax purposes, and for handling and keeping a record of a
            purchase you cancel.
          </li>
          <li>
            <strong className="text-white">Explicit consent</strong>{' '}&mdash; only for special
            category information you choose to write into a free-text answer, as explained
            above.
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
          automated, and together they amount to profiling as data protection law uses that
          word.
        </p>
        <p>
          <strong className="text-white">Neither of them makes a decision about you.</strong>{' '}
          Nothing here determines whether you get a job, a place on a course, a grade, credit,
          a benefit or anything else. The output is information for you to consider, every
          decision stays with you, and partner universities are contractually forbidden from
          using it to decide anything about a student.
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
          Ask at {privacyLink}. The{' '}
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
          every report we generated for you, and your link to any partner university. It is
          immediate and it cannot be undone. Your university&rsquo;s totals simply stop
          counting you.
        </p>
        <p>
          Payment records are the one exception: Hungarian accounting law requires us to keep
          the records behind each sale for eight years. We strip your name and email from those records where we
          can, leaving only what the law requires. If you cancelled a purchase, we keep what
          you sent us for the same time, with your name, because it is the record that you
          cancelled in time and were refunded.
        </p>
      </LegalSection>

      <LegalSection id="your-rights" title="Your rights">
        <p>
          Under the GDPR &mdash; and under similar laws elsewhere, such as the UK GDPR if you
          live in the United Kingdom &mdash; you can ask us to:
        </p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>Give you a copy of your data &mdash; there is an export button in your account settings</li>
          <li>Correct anything that is wrong</li>
          <li>Delete your data</li>
          <li>Restrict or object to how we use it, including being counted in your university&rsquo;s totals</li>
          <li>Hand your data to another provider in a portable format</li>
        </ul>
        <p>
          We offer these rights to everyone, wherever you live. Email {privacyLink} and we will
          respond <strong className="text-white">within one month</strong>. If your request is
          complex, or you have made several, we may extend by up to two further months &mdash;
          and we will tell you within the first month if we do.
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
          If you think we have handled your data badly, you can complain to a data protection
          authority at any time, and you do not have to come to us first &mdash; though we
          would rather you told us so we can put it right.
        </p>
        <p>
          Our lead supervisory authority is Hungary&rsquo;s{' '}
          <strong className="text-white">
            Nemzeti Adatvédelmi és Információszabadság Hatóság
          </strong>{' '}
          (NAIH, the National Authority for Data Protection and Freedom of Information), 1055
          Budapest, Falk Miksa utca 9&ndash;11, Hungary,{' '}
          <a className="text-indigo-300 underline" href="mailto:ugyfelszolgalat@naih.hu">
            ugyfelszolgalat@naih.hu
          </a>
          ,{' '}
          <a
            className="text-indigo-300 underline"
            href="https://naih.hu"
            target="_blank"
            rel="noopener noreferrer"
          >
            naih.hu
          </a>
          . You can also complain to the authority in the country where you live or work
          &mdash; in Spain, the{' '}
          <a
            className="text-indigo-300 underline"
            href="https://www.aepd.es"
            target="_blank"
            rel="noopener noreferrer"
          >
            Agencia Española de Protección de Datos
          </a>
          ; outside the European Economic Area, your national data protection authority, such
          as the{' '}
          <a
            className="text-indigo-300 underline"
            href="https://ico.org.uk"
            target="_blank"
            rel="noopener noreferrer"
          >
            Information Commissioner&rsquo;s Office
          </a>{' '}
          in the United Kingdom. You also have the right to go to court.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="Cookies and what we store on your device">
        <p>
          We use a small number of strictly necessary cookies to keep you signed in, one that
          remembers your language if you choose one, and a little browser session storage to
          carry your answers between pages. We use no advertising cookies and no cross-site
          tracking, which is why you do not see a cookie banner.
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
          You need to be at least {MINIMUM_AGE} to have an account, in every country. Some
          countries allow younger people to sign up to online services on their own; we have
          chosen {MINIMUM_AGE} everywhere because the questions are personal and the report is
          about life decisions. If you are under {MINIMUM_AGE}, ask a parent or guardian to
          set one up and use it with you.
        </p>
        <p>
          If you believe a child under {MINIMUM_AGE} has given us their data, email{' '}
          {privacyLink} and we will delete it.
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
