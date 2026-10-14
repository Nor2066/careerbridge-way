import type { Metadata } from 'next';
import LegalPage, { LegalSection } from '@/components/LegalPage';
import { COMPANY, CONTACT, LAST_UPDATED, MINIMUM_AGE } from '@/lib/legal';
import { BRAND } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    `The agreement between you and ${BRAND.name}: what we provide, how university access works, what we do not promise, and where you stand if something goes wrong.`,
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      lastUpdated={LAST_UPDATED.terms}
      intro={
        <>
          <p>
            These terms are the agreement between you and {COMPANY.legalName} when you use{' '}
            {COMPANY.tradingName}. By creating an account you accept them. They apply in the
            same way whether you pay for access yourself or your university gives it to you.
          </p>
          <p>
            The two sections worth reading properly are{' '}
            <a className="text-indigo-300 underline" href="#what-this-is-not">
              what this service is not
            </a>{' '}
            and{' '}
            <a className="text-indigo-300 underline" href="#liability">
              our liability
            </a>
            . If your access comes from a university, read{' '}
            <a className="text-indigo-300 underline" href="#university-access">
              section 4
            </a>{' '}
            too. The rest is what you would expect.
          </p>
          <p>
            Five other documents form part of this agreement and are incorporated into it:
            the{' '}
            <a className="text-indigo-300 underline" href="/privacy">
              Privacy Policy
            </a>
            , the{' '}
            <a className="text-indigo-300 underline" href="/cookies">
              Cookie Policy
            </a>
            , the{' '}
            <a className="text-indigo-300 underline" href="/refunds">
              Refund and Cancellation Policy
            </a>
            , the{' '}
            <a className="text-indigo-300 underline" href="/acceptable-use">
              Acceptable Use Policy
            </a>{' '}
            and the{' '}
            <a className="text-indigo-300 underline" href="/ai-notice">
              AI Transparency and Disclaimer Notice
            </a>
            . Where they conflict, these terms take priority &mdash; except that the Privacy
            Policy governs anything about personal data, and the Refund Policy governs
            anything about refunds.
          </p>
        </>
      }
    >
      <LegalSection id="who-we-are" title="1. Who you are contracting with">
        <p>
          {COMPANY.tradingName} is a trading name of {COMPANY.legalName}, registered in{' '}
          {COMPANY.jurisdiction} under number {COMPANY.companyNumber}, registered office{' '}
          {COMPANY.address}. Contact us at{' '}
          <a className="text-indigo-300 underline" href={`mailto:${CONTACT.support}`}>
            {CONTACT.support}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="eligibility" title="2. Who can use it">
        <p>
          You must be at least {MINIMUM_AGE} years old to create an account, wherever you
          live. We ask you to confirm this when you sign up, and ticking that box is also how
          you accept these terms. If we learn an account belongs to someone under{' '}
          {MINIMUM_AGE}, we will close it and delete the data attached to it.
        </p>
        <p>
          If you are under 18, you should go through your results with a parent, guardian,
          teacher, or careers adviser rather than relying on them alone. Nothing here is
          designed to replace an adult who knows you.
        </p>
        <p>
          You may hold one account. You are responsible for what happens under it, so keep
          your sign-in details to yourself, and tell us straight away if you think someone
          else has got into it.
        </p>
      </LegalSection>

      <LegalSection id="what-we-provide" title="3. What we provide">
        <p>
          A questionnaire, a scoring model that groups your answers into career clusters,
          and an AI-generated written report based on those answers. Some attempts also
          include a follow-up questionnaire that produces a more detailed roadmap. The site
          and your reports are available in English and Spanish.
        </p>
        <p>
          You get attempts in one of two ways: by buying them, or through a partner
          university that pays for its students. What a purchase gives you is shown on the
          page you buy from before you pay.
        </p>
        <p>
          We may change, improve, or retire parts of the service. If we retire something you
          have already paid for and cannot deliver it, we will refund you for that part.
        </p>
      </LegalSection>

      <LegalSection id="university-access" title="4. Access through your university">
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            <strong className="text-white">How you get it.</strong>{' '}
            If you sign up with a
            confirmed email address on one of a partner university&rsquo;s domains, your
            account receives that university&rsquo;s access automatically. It is meant for the
            university&rsquo;s students and anyone else it gives an address on those domains.
          </li>
          <li>
            <strong className="text-white">What it includes.</strong>{' '}
            A number of free attempts
            for each licence period, and the follow-up roadmap if the university&rsquo;s plan
            includes it. Your account shows what you have. Free university attempts are used
            before any you bought yourself.
          </li>
          <li>
            <strong className="text-white">How long it lasts.</strong>{' '}
            For as long as the
            university&rsquo;s licence with us is active. When it renews you get a fresh
            allowance. Some licences cover a maximum number of students, and once that is
            reached new sign-ups do not get access.
          </li>
          <li>
            <strong className="text-white">When it ends.</strong> If the licence ends, the free
            attempts stop.{' '}
            <strong className="text-white">
              Your account, your reports, and anything you bought yourself stay yours.
            </strong>
          </li>
          <li>
            <strong className="text-white">What your university sees.</strong>{' '}
            Only anonymous
            totals for all its students together &mdash; never your answers, your reports,
            your comments or your name. The{' '}
            <a className="text-indigo-300 underline" href="/privacy#universities">
              Privacy Policy
            </a>{' '}
            explains exactly what.
          </li>
          <li>
            <strong className="text-white">Who your contract is with.</strong> With us. The
            university pays us under a separate agreement and is not a party to these terms.
            It cannot change your rights under them, and you do not need its permission to
            use or delete your account.
          </li>
          <li>
            <strong className="text-white">If something goes wrong.</strong> University access
            costs you nothing, so the Refund Policy does not apply to it. If a report you got
            through it fails or is faulty, tell us and we will regenerate it or restore the
            attempt.
          </li>
        </ul>
        <p>
          <strong className="text-white">If you are university staff</strong>{' '}
            with access to
          a university dashboard, you use it on your university&rsquo;s behalf under its
          agreement with us. You must not try to work out which student is behind a figure,
          and you must not use {BRAND.name} to make or support a decision about a student,
          such as admission, grading or discipline.
        </p>
      </LegalSection>

      <LegalSection id="what-this-is-not" title="5. What this service is not">
        <p>
          This matters more here than on most websites, so it is in plain words rather than
          buried in capital letters.
        </p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            <strong className="text-white">
              It is not professional careers advice or counselling.
            </strong>{' '}
            We are not a regulated careers service and your report is not produced or
            reviewed by a qualified careers adviser &mdash; even when a university gives you
            access.
          </li>
          <li>
            <strong className="text-white">
              It is not a psychological or psychometric assessment.
            </strong>{' '}
            The questionnaire is not a clinically validated instrument and it does not
            diagnose anything about you.
          </li>
          <li>
            <strong className="text-white">It is not medical or mental health advice.</strong>{' '}
            If you are struggling, please talk to a doctor or one of the support services we
            show you. Nothing here is a substitute for that.
          </li>
          <li>
            <strong className="text-white">It is not a guarantee of any outcome.</strong> We
            do not promise that following the report will get you a job, a place on a
            course, a salary, or a career you enjoy.
          </li>
          <li>
            <strong className="text-white">It is generated by AI, and AI gets things wrong.</strong>{' '}
            Reports can contain inaccurate, outdated, or simply mistaken statements about
            jobs, qualifications, and pay. Check anything important before you act on it. Our{' '}
            <a className="text-indigo-300 underline" href="/ai-notice">
              AI Transparency and Disclaimer Notice
            </a>{' '}
            explains the known failure modes properly, and is worth reading in full.
          </li>
        </ul>
        <p>
          Every decision about your education, your work, and your future stays yours. Treat
          the report as one input among several &mdash; alongside people who actually know
          you.
        </p>
      </LegalSection>

      <LegalSection id="payment" title="6. Payment">
        <p>
          Prices are shown before you pay, include any tax due, and are charged in the
          currency displayed at checkout. Payment is handled by Stripe; we never see your
          card details.
        </p>
        <p>
          What each product gives you is stated on the checkout page before you pay.
          Purchases are one-off &mdash; we do not run subscriptions, nothing renews
          automatically, and we will never charge you again without you choosing to buy
          something.
        </p>
        <p>
          What you buy is digital content supplied immediately. When you complete a purchase
          you <strong className="text-white">expressly ask</strong> us to make it available
          straight away, and you{' '}
          <strong className="text-white">acknowledge that you lose your 14-day right to
          cancel</strong>{' '}
          in respect of any part of it that is then supplied. You tick a box saying so at
          checkout, before paying &mdash; it is not buried on this page.
        </p>
        <p>
          Anything you have not used stays refundable for 14 days. Your full rights, and the
          cases where we refund even though we do not have to, are in our{' '}
          <a className="text-indigo-300 underline" href="/refunds">
            Refund and Cancellation Policy
          </a>
          , which forms part of these terms. That is separate from your rights if something
          is faulty &mdash; see{' '}
          <a className="text-indigo-300 underline" href="#liability">
            section 9
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="acceptable-use" title="7. How you may use it">
        <p>
          The full rules are in our{' '}
          <a className="text-indigo-300 underline" href="/acceptable-use">
            Acceptable Use Policy
          </a>
          , which forms part of these terms. In summary, please do not:
        </p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>Try to break, overload, or get unauthorised access to the service</li>
          <li>Use automated tools to submit assessments or generate reports in bulk</li>
          <li>Resell your reports, or present them as your own product</li>
          <li>Submit someone else&rsquo;s personal information as your answers</li>
          <li>Use an email address you are not entitled to in order to get university access</li>
          <li>
            Try to make the AI produce content unrelated to careers, or attempt to extract
            our prompts or other users&rsquo; data
          </li>
        </ul>
        <p>
          We may suspend or close an account that does these things. Where we reasonably can,
          we will tell you why first.
        </p>
      </LegalSection>

      <LegalSection id="your-content" title="8. Your answers and your report">
        <p>
          Your answers remain yours. You give us permission to process them to run the
          assessment and produce your report, as described in our{' '}
          <a className="text-indigo-300 underline" href="/privacy">
            Privacy Policy
          </a>
          .
        </p>
        <p>
          That permission also covers{' '}
          <strong className="text-white">
            studying the answers and results we hold in order to improve the service
          </strong>{' '}
          &mdash; fixing questions that do not work, correcting the scoring, and making the
          reports better. We do this on figures and on data with the identifying details
          removed wherever we can, and we may use AI tools to do the reading.{' '}
          <strong className="text-white">
            We do not sell your data and we do not use it for advertising. We do not train
            AI models on it &mdash; not ours, not our providers&rsquo;, not anyone&rsquo;s.
            If we ever want to, we will ask you first rather than relying on this clause.
          </strong>{' '}
          You can tell us to leave your data out of that work at any time, without losing
          anything:{' '}
          <a className="text-indigo-300 underline" href="/privacy#improving">
            how it works and how to object
          </a>
          .
        </p>
        <p>
          Your report is yours to use for your own purposes, including showing it to a
          university, an employer or an adviser if you choose to. Nobody can make you share
          it. The questionnaire, the scoring model, and the site itself remain ours.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="9. Our liability to you">
        <p>
          Nothing in these terms limits our liability for death or personal injury caused by
          our negligence, for fraud, or for anything else that the law where you live does not
          allow us to limit. Nothing in them takes away a right your local consumer law gives
          you.
        </p>
        <p className="font-medium text-white">Your rights if something is faulty</p>
        <p>
          Your report and the service must be{' '}
          <strong className="text-white">
            of satisfactory quality, fit for purpose, and as described.
          </strong>{' '}
          If they are not:
        </p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            <strong className="text-white">In the UK</strong>, the Consumer Rights Act 2015
            entitles you to have the problem repaired or the content replaced &mdash; for us,
            regenerating the report or restoring the attempt &mdash; and, if that is
            impossible or we do not manage it, a price reduction of up to the whole price. If
            our digital content damages a device or other content of yours through our lack of
            reasonable care, section 46 of that Act entitles you to a repair or compensation.
            Free advice:{' '}
            <a
              className="text-indigo-300 underline"
              href="https://www.citizensadvice.org.uk"
              target="_blank"
              rel="noopener noreferrer"
            >
              citizensadvice.org.uk
            </a>
            .
          </li>
          <li>
            <strong className="text-white">In the European Union</strong>, the national rules
            implementing the EU Digital Content Directive give you similar rights: to have
            the content brought into line with what was promised, and if that does not happen,
            a price reduction or to end the contract and get your money back. Free advice:
            the{' '}
            <a
              className="text-indigo-300 underline"
              href="https://www.eccnet.eu"
              target="_blank"
              rel="noopener noreferrer"
            >
              European Consumer Centres Network
            </a>
            .
          </li>
          <li>
            <strong className="text-white">Anywhere else</strong>, you keep whatever rights
            the consumer law of your country gives you.
          </li>
        </ul>
        <p>Subject to all of that:</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            <strong className="text-white">
              We are not liable for decisions you make based on a report.
            </strong>{' '}
            That includes choosing or leaving a course, job, or career path, and any loss of
            income, opportunity, or time that follows.
          </li>
          <li>
            We are not liable for loss that was not reasonably foreseeable, or for business
            losses &mdash; the service is for personal use.
          </li>
          <li>
            <strong className="text-white">
              Our total liability to you is capped at the greater of the amount you have paid
              us in the 12 months before the claim and £100.
            </strong>{' '}
            The fixed £100 floor is deliberate: purchases here are small, and university
            access is free to you, so a cap of &ldquo;what you paid&rdquo; alone would leave a
            remedy worth a few pounds or nothing, which would not be fair.
          </li>
          <li>
            We do not promise the service will be uninterrupted or error-free. It depends on
            third parties &mdash; hosting, payments, and an AI provider &mdash; and any of
            them can have a bad day.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="indemnity" title="10. Your liability to us">
        <p>
          If you use the service in a way these terms forbid &mdash; breaking the acceptable
          use rules, submitting someone else&rsquo;s personal data, or infringing someone
          else&rsquo;s rights &mdash; and that causes a third party to bring a claim against
          us, you agree to cover the reasonable costs and damages we incur as a result.
        </p>
        <p>
          This does not apply to anything arising from our own breach of these terms or our
          own negligence, and it does not apply to ordinary use of the service.
        </p>
      </LegalSection>

      <LegalSection id="termination" title="11. Ending the agreement">
        <p>
          You can close your account whenever you like, from your account settings. Deleting
          your account removes your data as described in the Privacy Policy, and unused
          attempts are lost when you do &mdash; so use or claim a refund on them first.
        </p>
        <p>
          We may end this agreement if you seriously or repeatedly break these terms, or if
          we stop operating the service. If we close your account for our own reasons rather
          than yours, we will refund anything you have paid for and not received.
        </p>
      </LegalSection>

      <LegalSection id="complaints" title="12. Complaints">
        <p>
          If something has gone wrong, email{' '}
          <a className="text-indigo-300 underline" href={`mailto:${CONTACT.support}`}>
            {CONTACT.support}
          </a>
          . We will reply within 3 working days and aim to give you a final answer within 14
          days. If you are not happy with it, say so, and a different person will look again.
          Nothing here stops you going to court or to a consumer body.
        </p>
      </LegalSection>

      <LegalSection id="law" title="13. Governing law and language">
        <p>
          These terms and any dispute arising from them are governed by the law of{' '}
          {COMPANY.jurisdiction}.
        </p>
        <p>
          If you are a consumer, that choice does not take away the protection of the
          mandatory consumer laws of the country where you live, and you may bring
          proceedings either in the courts of {COMPANY.jurisdiction} or in the courts where
          you live.
        </p>
        <p>
          These terms are written in English. If we publish a translation and the two differ,
          the English text applies, unless the law where you live gives you the right to rely
          on the translation.
        </p>
      </LegalSection>

      <LegalSection id="general" title="14. Odds and ends">
        <p>
          If a court finds part of these terms unenforceable, the rest stays in force. If we
          do not enforce something straight away, we have not given up the right to enforce
          it later. These terms are between you and us; nobody else, including a partner
          university, can enforce them.
        </p>
        <p>
          We may update these terms. If a change materially affects your rights, we will
          email you before it takes effect and the date at the top of this page will change.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
