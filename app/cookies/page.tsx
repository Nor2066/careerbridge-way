import type { Metadata } from 'next';
import LegalPage, { LegalSection } from '@/components/LegalPage';
import { CONTACT, LAST_UPDATED } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'Everything CareerBridge Way stores on your device, why all of it is strictly necessary, and why there is no cookie banner.',
};

/**
 * Split out of the privacy policy, where it had been three sentences.
 *
 * PECR governs storage on a visitor's device separately from the UK GDPR, and
 * the honest version of this page is short enough to be worth publishing in
 * full: every item here is strictly necessary, which is an unusually good
 * answer and is invisible if it stays buried under a heading in another
 * document.
 */
export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      lastUpdated={LAST_UPDATED.cookies}
      intro={
        <>
          <p>
            <strong className="text-white">
              We use cookies to keep you signed in, and nothing else.
            </strong>{' '}
            No advertising cookies, no analytics cookies, no third-party trackers, no
            fingerprinting.
          </p>
          <p>
            That is why you do not see a cookie banner. The law only requires consent for
            cookies that are not strictly necessary, and we do not set any &mdash; so a
            banner would be a box that does nothing.
          </p>
        </>
      }
    >
      <LegalSection id="the-law" title="The rule we are working to">
        <p>
          Storing information on your device, or reading what is already there, is governed
          by regulation 6 of the Privacy and Electronic Communications (EC Directive)
          Regulations 2003 &mdash; usually called PECR.
        </p>
        <p>
          PECR says we must tell you what we store and ask permission,{' '}
          <strong className="text-white">unless</strong> it is strictly necessary for a
          service you actually asked for. Staying signed in is the textbook example: you
          asked to sign in, and it cannot be done without storing something.
        </p>
        <p>
          Everything on this page falls inside that exemption. We are telling you anyway,
          because you are entitled to know what is on your device.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="Cookies we set">
        <p>
          All of these are ours, on our own domain. All are <code>HttpOnly</code>, so
          scripts running in your browser cannot read them, and all are marked{' '}
          <code>Secure</code> in production so they only travel over an encrypted
          connection.
        </p>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full min-w-[34rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/20 text-left text-xs uppercase tracking-wider text-gray-400">
                <th className="py-2 pr-4 font-medium">Cookie</th>
                <th className="py-2 pr-4 font-medium">What it does</th>
                <th className="py-2 font-medium">How long</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10 align-top">
                <td className="py-3 pr-4 font-mono text-xs text-white">
                  sb-&lt;project&gt;-auth-token
                </td>
                <td className="py-3 pr-4 text-gray-300">
                  Holds your sign-in session. Without it you would be signed out on every
                  page. Sometimes split across two cookies ending <code>.0</code> and{' '}
                  <code>.1</code> when it is too large for one.
                </td>
                <td className="py-3 text-gray-400">
                  Until the session expires or you sign out
                </td>
              </tr>
              <tr className="border-b border-white/10 align-top">
                <td className="py-3 pr-4 font-mono text-xs text-white">
                  sb-&lt;project&gt;-auth-token-code-verifier
                </td>
                <td className="py-3 pr-4 text-gray-300">
                  A one-time value that lets us complete a Google sign-in securely. Useless
                  on its own.
                </td>
                <td className="py-3 text-gray-400">10 minutes</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <code>&lt;project&gt;</code> is a fixed identifier for our authentication project.
          The exact names come from our authentication provider and would change if we
          changed provider; the purposes would not.
        </p>
      </LegalSection>

      <LegalSection id="other-storage" title="Other things we store on your device">
        <p>
          Cookies are not the only kind of browser storage, and PECR covers all of it. We
          also use <strong className="text-white">session storage</strong>, which your
          browser clears the moment you close the tab.
        </p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            <code>mainAnswers</code> &mdash; your answers as you move between questions, so
            a refresh does not lose your progress.
          </li>
          <li>
            <code>topClusters</code> &mdash; carries your top career clusters from the
            assessment into the follow-up questionnaire.
          </li>
          <li>
            <code>lastAssessmentId</code> &mdash; remembers which assessment the follow-up
            belongs to, including after the trip out to the payment page.
          </li>
        </ul>
        <p>
          We use no <strong className="text-white">local storage</strong>, which is the kind
          that survives after the tab is closed.
        </p>
      </LegalSection>

      <LegalSection id="analytics" title="Our analytics store nothing at all">
        <p>
          We do count things &mdash; how many people start the questionnaire, how many reach
          the payment page, how many finish. Knowing where people give up is how the product
          gets better.
        </p>
        <p>
          <strong className="text-white">
            None of it involves storing anything on your device.
          </strong>{' '}
          The identifier that groups one visit together is generated in memory when the page
          loads and disappears when you close the tab. No cookie, no local storage, no
          session storage &mdash; so regulation 6 is not engaged at all, and there is
          nothing for you to consent to.
        </p>
        <p>
          The events record that a step happened. They never contain the content of your
          answers, and the values they can carry are restricted to a short list of
          pre-approved ones rather than free text. We use no third-party analytics product:
          nothing about your visit goes to Google Analytics, Meta, or any advertising
          network.
        </p>
      </LegalSection>

      <LegalSection id="third-parties" title="Third parties">
        <p>
          <strong className="text-white">Stripe, when you pay.</strong> Paying takes you to a
          page hosted by Stripe on Stripe&rsquo;s own domain. Stripe sets its own cookies
          there &mdash; typically <code>__stripe_mid</code> and <code>__stripe_sid</code>{' '}
          &mdash; which it uses for fraud prevention. They belong to Stripe, under{' '}
          <a
            className="text-indigo-300 underline"
            href="https://stripe.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Stripe&rsquo;s privacy policy
          </a>
          . We do not set them, cannot read them, and receive nothing from them.
        </p>
        <p>
          <strong className="text-white">Google, if you sign in with Google.</strong> You
          visit Google&rsquo;s sign-in page, and Google uses its own cookies there under its
          own policies. If you would rather not involve Google, sign in with an email address
          and password instead.
        </p>
        <p>
          <strong className="text-white">Nothing embedded.</strong> We do not embed videos,
          maps, social widgets, comment systems, chat widgets or advertising. That is the
          usual route by which third-party trackers arrive on a website, and we have kept it
          closed deliberately.
        </p>
      </LegalSection>

      <LegalSection id="controlling" title="Controlling cookies yourself">
        <p>
          You can block or delete cookies in your browser settings. Instructions are on each
          browser maker&rsquo;s help pages, and the ICO publishes guidance for the public at{' '}
          <a
            className="text-indigo-300 underline"
            href="https://ico.org.uk"
            target="_blank"
            rel="noopener noreferrer"
          >
            ico.org.uk
          </a>
          .
        </p>
        <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-4">
          <p className="text-sm text-amber-100">
            <strong className="font-semibold">Worth knowing first.</strong> Because the only
            cookies we set are the ones that keep you signed in, blocking them will stop you
            signing in at all &mdash; you will bounce back to the sign-in page each time.
            That is not a fault, and it is not us pressuring you into accepting tracking,
            because there is none to accept. Blocking session storage will lose your answers
            on a refresh.
          </p>
        </div>
        <p>
          Some browsers and privacy tools block third-party cookies aggressively. That will
          not affect our cookies, but it can interfere with the return trip from Google
          sign-in or from Stripe. If sign-in fails once and then works, that is usually why.
        </p>
        <p>
          &ldquo;Do Not Track&rdquo; and Global Privacy Control signals change nothing here,
          because we are not tracking you in the first place.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="If this changes">
        <p>
          If we ever add something that stores information on your device, we will update
          this page before it goes live. If the new item is not strictly necessary,{' '}
          <strong className="text-white">we will ask your permission first</strong>, with a
          real choice and a real &ldquo;reject all&rdquo;.
        </p>
        <p>
          Questions about anything here:{' '}
          <a className="text-indigo-300 underline" href={`mailto:${CONTACT.privacy}`}>
            {CONTACT.privacy}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
