import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import LegalPage, { LegalSection } from '@/components/LegalPage';
import { CONTACT, LAST_UPDATED } from '@/lib/legal';
import { LOCALE_COOKIE } from '@/lib/i18n/config';
import { RECOVERY_COOKIE } from '@/lib/recovery-cookie';
import { BRAND } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    `Everything ${BRAND.name} stores on your device, why all of it is strictly necessary or chosen by you, and why there is no cookie banner.`,
};

/**
 * Split out of the privacy policy, where it had been three sentences.
 *
 * The ePrivacy rules in each EU country (in Hungary, Eht. 155. § (4)), and
 * their equivalents elsewhere, govern storage on a visitor's device separately
 * from the GDPR. The honest version of this page
 * is short enough to be worth publishing in full: every item is strictly
 * necessary or set only when the visitor picks a language, which is an
 * unusually good answer and is invisible if it stays buried in another
 * document. Keep the table in step with the code: a cookie added without a row
 * here makes the page untrue.
 */

type Row = { name: string; purpose: ReactNode; lifetime: string };

const COOKIES: Row[] = [
  {
    name: 'sb-<project>-auth-token',
    purpose: (
      <>
        Holds your sign-in session. Without it you would be signed out on every page.
        Sometimes split across two cookies ending <code>.0</code> and <code>.1</code> when it
        is too large for one.
      </>
    ),
    lifetime: 'Until the session expires or you sign out',
  },
  {
    name: 'sb-<project>-auth-token-code-verifier',
    purpose: 'A one-time value that lets us complete a Google sign-in securely. Useless on its own.',
    lifetime: '10 minutes',
  },
  {
    name: 'oauth_return_to',
    purpose: 'Remembers which page to bring you back to after signing in with Google.',
    lifetime: '10 minutes',
  },
  {
    name: 'oauth_terms_accepted',
    purpose:
      'Carries the fact that you ticked the age and terms box across the trip to Google, so a new account created that way records your acceptance.',
    lifetime: '10 minutes',
  },
  {
    name: RECOVERY_COOKIE,
    purpose:
      'Marks a session as having come from a password-reset link, so the page that sets a new password knows it may.',
    lifetime: '15 minutes',
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      lastUpdated={LAST_UPDATED.cookies}
      intro={
        <>
          <p>
            <strong className="text-white">
              We use cookies to keep you signed in and, if you choose a language, to remember
              it. Nothing else.
            </strong>{' '}
            No advertising cookies, no analytics cookies, no third-party trackers, no
            fingerprinting.
          </p>
          <p>
            That is why you do not see a cookie banner. The law only requires consent for
            cookies that are not strictly necessary for something you asked for, and we do not
            set any &mdash; so a banner would be a box that does nothing.
          </p>
        </>
      }
    >
      <LegalSection id="the-law" title="The rule we are working to">
        <p>
          Storing information on your device, or reading what is already there, is governed
          in the European Union by Article 5(3) of the ePrivacy Directive as each country has
          implemented it &mdash; in Hungary, where we are based, section 155(4) of Act C of
          2003 on Electronic Communications; in Spain, article 22.2 of the LSSI. Other
          countries have similar rules, such as PECR in the United Kingdom.
        </p>
        <p>
          They all say the same thing: we must tell you what we store and ask permission,{' '}
          <strong className="text-white">unless</strong> it is strictly necessary for a
          service you actually asked for. Staying signed in is the textbook example: you
          asked to sign in, and it cannot be done without storing something. Remembering a
          language you picked yourself is another: European regulators treat a preference
          the user chose as part of the service they asked for.
        </p>
        <p>
          Everything on this page falls inside that exemption. We are telling you anyway,
          because you are entitled to know what is on your device.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="Cookies we set">
        <p>
          All of these are ours, on our own domain. All except the language cookie are{' '}
          <code>HttpOnly</code>, so scripts running in your browser cannot read them, and
          all are marked <code>Secure</code> in production so they only travel over an
          encrypted connection.
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
              {COOKIES.map((c) => (
                <tr key={c.name} className="border-b border-white/10 align-top">
                  <td className="py-3 pr-4 font-mono text-xs text-white">{c.name}</td>
                  <td className="py-3 pr-4 text-gray-300">{c.purpose}</td>
                  <td className="py-3 text-gray-400">{c.lifetime}</td>
                </tr>
              ))}
              <tr className="border-b border-white/10 align-top">
                <td className="py-3 pr-4 font-mono text-xs text-white">{LOCALE_COOKIE}</td>
                <td className="py-3 pr-4 text-gray-300">
                  Remembers the language you chose with the EN / ES switch, so the site does
                  not change back on your next visit. Set only if you use the switch; until
                  then we follow your browser&rsquo;s language setting and store nothing. It
                  holds two letters and nothing about you. Scripts on our own pages can read
                  it, because the switch itself sets it.
                </td>
                <td className="py-3 text-gray-400">1 year, or until you clear it</td>
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
          Cookies are not the only kind of browser storage, and the same rules cover all of
          it. We also use <strong className="text-white">session storage</strong>, which your
          browser clears the moment you close the tab.
        </p>
        <ul className="ml-5 flex list-disc flex-col gap-2">
          <li>
            <code>mainAnswers</code>{' '}&mdash; your answers as you move between questions, so
            a refresh does not lose your progress.
          </li>
          <li>
            <code>topClusters</code>{' '}&mdash; carries your top career clusters from the
            assessment into the follow-up questionnaire.
          </li>
          <li>
            <code>lastAssessmentId</code>{' '}&mdash; remembers which assessment the follow-up
            belongs to, including after the trip out to the payment page.
          </li>
          <li>
            <code>checkoutReturnPath</code>{' '}&mdash; remembers which page you were on before
            going to pay, so you come back to it afterwards.
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
          session storage &mdash; so the rules above are not engaged at all, and there is
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
          <strong className="text-white">Stripe, when you pay.</strong>{' '}
            Paying takes you to a
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
          <strong className="text-white">Google, if you sign in with Google.</strong>{' '}
            You
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
          browser maker&rsquo;s help pages, and data protection authorities publish guidance
          for the public &mdash; NAIH in Hungary at{' '}
          <a
            className="text-indigo-300 underline"
            href="https://naih.hu"
            target="_blank"
            rel="noopener noreferrer"
          >
            naih.hu
          </a>
          , and the AEPD in Spain at{' '}
          <a
            className="text-indigo-300 underline"
            href="https://www.aepd.es"
            target="_blank"
            rel="noopener noreferrer"
          >
            aepd.es
          </a>
          .
        </p>
        <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-4">
          <p className="text-sm text-amber-100">
            <strong className="font-semibold">Worth knowing first.</strong>{' '}
            Because the
            cookies we set are the ones that keep you signed in, blocking them will stop you
            signing in at all &mdash; you will bounce back to the sign-in page each time.
            That is not a fault, and it is not us pressuring you into accepting tracking,
            because there is none to accept. Deleting the language cookie only means the site
            follows your browser&rsquo;s language again. Blocking session storage will lose
            your answers on a refresh.
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
