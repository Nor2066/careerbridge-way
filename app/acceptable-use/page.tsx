import type { Metadata } from 'next';
import LegalPage, { LegalSection } from '@/components/LegalPage';
import { CONTACT, LAST_UPDATED } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Acceptable Use Policy',
  description:
    'What you must not do with CareerBridge Way, what happens if you do, and how to report a security problem.',
};

/**
 * Pulled out of section 6 of the terms, where it was a five-line list.
 *
 * It earns its own page because the rules that matter most here are not the
 * usual ones. The clause worth reading is the prohibition on running the
 * assessment over somebody else: an unvalidated questionnaire with an AI
 * attached, used as a screening instrument, can do real harm and expose the
 * user to discrimination liability. That does not survive as a bullet in a
 * list of nine.
 */
export default function AcceptableUsePage() {
  return (
    <LegalPage
      title="Acceptable Use Policy"
      lastUpdated={LAST_UPDATED.acceptableUse}
      intro={
        <>
          <p>
            Use the service as a person looking for career ideas and none of this will ever
            concern you.
          </p>
          <p>
            It exists for the small number of people who try to attack the service, mine it,
            automate against it, or push other people&rsquo;s personal data through it. It
            forms part of our{' '}
            <a className="text-indigo-300 underline" href="/terms">
              Terms of Service
            </a>
            , so breaking it is a breach of contract.
          </p>
        </>
      }
    >
      <LegalSection id="who" title="Who this applies to">
        <p>
          Everyone who uses the service, whether or not they have paid and whether or not
          they have an account. It also covers anything done through your account by someone
          else, which is why you should keep your sign-in details to yourself.
        </p>
      </LegalSection>

      <LegalSection id="content" title="What you must not submit">
        <p>Do not put any of this into an answer, a support email, or anywhere else:</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            <strong className="text-white">
              Another identifiable person&rsquo;s personal information.
            </strong>{' '}
            Write about yourself. If you need to mention someone, leave out their full name
            and anything else that identifies them.
          </li>
          <li>
            Content that is <strong className="text-white">unlawful</strong> &mdash;
            infringing copyright, breaching confidence, defamatory, or an offence to possess
            or distribute.
          </li>
          <li>
            Content that <strong className="text-white">harasses or threatens</strong> any
            person, or incites hatred or violence against any person or group.
          </li>
          <li>
            Sexual content, and in particular anything sexual involving a child. Content of
            that kind will be reported to the authorities.
          </li>
          <li>Material that identifies a child, or that solicits information from one.</li>
          <li>
            Malware, scripts, or deliberately malformed input intended to break the service.
          </li>
          <li>
            Deliberately false information submitted in order to obtain a refund, a free
            attempt, or access to someone else&rsquo;s account.
          </li>
        </ul>
        <p>
          Please also avoid putting <strong className="text-white">sensitive information
          about yourself</strong> into a free-text answer where you can. You do not need to
          disclose a health condition, a disability, your religion, your ethnicity or your
          sexuality to get a useful report. That is a request for your benefit rather than a
          prohibition &mdash; our{' '}
          <a className="text-indigo-300 underline" href="/privacy#sensitive">
            Privacy Policy
          </a>{' '}
          explains what happens if you do.
        </p>
      </LegalSection>

      <LegalSection id="conduct" title="What you must not do">
        <p className="font-medium text-white">Against the service</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            Attempt to gain unauthorised access to the service, to any account other than
            your own, or to any system connected to them.
          </li>
          <li>Attack it &mdash; denial of service, flooding, or anything meant to disrupt availability.</li>
          <li>
            Circumvent rate limits, authentication, payment, or the limit on how many
            attempts your account holds.
          </li>
          <li>
            Probe, scan or test the security of the service without our written permission
            in advance. We will normally give it &mdash; see below.
          </li>
        </ul>

        <p className="mt-2 font-medium text-white">Automation and extraction</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            Use bots, scrapers, crawlers or scripts to complete questionnaires, generate
            reports, or harvest content.
          </li>
          <li>
            Create multiple accounts to get more free usage than one person is meant to have.
          </li>
          <li>
            Attempt to reconstruct the scoring model by submitting large numbers of
            systematically varied answers.
          </li>
          <li>
            Reverse-engineer, decompile or disassemble any part of the service, except to
            the limited extent the law permits despite this clause.
          </li>
          <li>Use the service, or anything it produces, to train a machine learning model.</li>
        </ul>

        <p className="mt-2 font-medium text-white">Misusing the AI</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            Try to make the AI produce content unrelated to careers. The free-text box is not
            a general-purpose chatbot.
          </li>
          <li>
            Attempt <strong className="text-white">prompt injection</strong> &mdash;
            instructions written into an answer and aimed at the model rather than at us,
            meant to change its behaviour, reveal its instructions, or bypass its limits.
          </li>
          <li>Attempt to extract our prompts, system instructions or scoring logic.</li>
        </ul>

        <p className="mt-2 font-medium text-white">Commercial misuse</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>Resell, sublicense or redistribute reports, or run a service that generates them for other people.</li>
          <li>
            Present a report as your own product, as human-written careers advice, or as the
            output of a regulated careers service.
          </li>
          <li>Sell, rent or transfer your account or the attempts on it.</li>
        </ul>

        <div className="mt-2 rounded-lg border border-amber-400/30 bg-amber-400/5 p-4">
          <p className="text-sm text-amber-100">
            <strong className="font-semibold">
              Do not use this to make a decision about another person
            </strong>{' '}
            &mdash; hiring, admissions, promotion, or anything else. This is a self-help tool
            for the person answering the questions. It is not built or validated for
            assessing anyone, and used as a screening instrument an unvalidated questionnaire
            with an AI attached can do real harm and expose you to discrimination liability.
            This is the rule we care about most.
          </p>
        </div>
      </LegalSection>

      <LegalSection id="rate-limits" title="Rate limits">
        <p>
          Sign-in, sign-up, password reset, payment and report generation are rate-limited.
          This protects the service and everyone else using it.
        </p>
        <p>
          Hitting a limit in ordinary use is{' '}
          <strong className="text-white">not a breach and nothing to worry about</strong>{' '}
          &mdash; wait a moment and try again. Deliberately working around one is a breach. If
          a legitimate use of yours keeps hitting a limit, tell us and we will look at it.
        </p>
      </LegalSection>

      <LegalSection id="reporting" title="Reporting a problem">
        <p>
          If you see something that breaches this policy, email{' '}
          <a className="text-indigo-300 underline" href={`mailto:${CONTACT.support}`}>
            {CONTACT.support}
          </a>{' '}
          with enough detail for us to find it.
        </p>
        <p>
          <strong className="text-white">
            If a report you received contains something harmful, offensive or seriously
            wrong, please tell us.
          </strong>{' '}
          We want to know. We do not read your answers or reports as a matter of routine, so
          a failure mode we are not told about is one we cannot fix. We look at specific
          content when you ask us to, when investigating an abuse report, or where the law
          requires it.
        </p>
      </LegalSection>

      <LegalSection id="consequences" title="What we do about breaches">
        <p>Depending on what happened, we may:</p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>send a warning, for a first, minor or probably accidental breach;</li>
          <li>remove or refuse specific content, where one submission is the problem;</li>
          <li>suspend the account temporarily, for a repeated breach or while investigating;</li>
          <li>close the account permanently, for a serious breach or repeated ones after a warning;</li>
          <li>block access at network level, for attacks and automated abuse;</li>
          <li>report the matter to the police or another authority, where conduct appears criminal;</li>
          <li>take legal action, where we have suffered loss.</li>
        </ul>
        <p>
          Where it is reasonable and lawful,{' '}
          <strong className="text-white">
            we will tell you what you did and give you a chance to put it right or explain
          </strong>
          . Where the breach is serious &mdash; an attack, or illegal content &mdash; we may
          act immediately and explain afterwards.
        </p>
        <p>
          <strong className="text-white">Refunds if we close an account for a breach.</strong>{' '}
          We do not refund attempts you have already used. Unused attempts we will refund,
          unless we have suffered loss as a result of your breach, in which case we may keep
          an amount reflecting that loss &mdash; and we will explain the figure.
        </p>
        <p>
          If you think we have got it wrong, reply and say so. A different person will look
          at it, and we will restore the account if we made a mistake.
        </p>
      </LegalSection>

      <LegalSection id="security" title="Security researchers">
        <p>
          If you have found a security vulnerability,{' '}
          <strong className="text-white">we would much rather hear from you than not.</strong>{' '}
          Email{' '}
          <a className="text-indigo-300 underline" href={`mailto:${CONTACT.support}`}>
            {CONTACT.support}
          </a>{' '}
          with the detail, and give us a reasonable time to fix it before telling anyone else.
        </p>
        <p>
          If you act in good faith, stay within what is needed to demonstrate the problem, do
          not access or alter anyone else&rsquo;s data, and do not degrade the service for
          other people, then{' '}
          <strong className="text-white">
            we will not treat your testing as a breach of this policy and we will not pursue
            you for it.
          </strong>
        </p>
        <p>
          That does not extend to denial-of-service testing, social engineering of our staff
          or suppliers, physical attacks, or accessing real customer data.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Changes">
        <p>
          We may update this policy. The version that applies is the one published when you
          use the service, and the date at the top says when it last changed. If we add a
          significant new restriction, we will email account holders about it.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
