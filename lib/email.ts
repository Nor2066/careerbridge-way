// lib/email.ts
//
// Transactional email: the receipt, and the "your report is ready" note.
//
// Right now a customer pays and gets nothing in their inbox. That is the point
// at which a confused buyer stops emailing you and starts talking to their
// bank instead, so a receipt is not a nicety — it is chargeback prevention.
//
// NO-OPS UNTIL CONFIGURED
//
// Without RESEND_API_KEY this logs what it would have sent and returns. That
// is deliberate: the mail provider is dashboard work that has not happened
// yet, and none of this should block on it or explode in the meantime. The day
// the key is set, mail starts flowing with no code change.
//
// SENDING NEVER FAILS A REQUEST
//
// Every send is wrapped and swallowed. A customer who paid must get their
// attempts whether or not the receipt goes out; losing the money because the
// mail provider had a bad minute would be a far worse bug than a missing
// email. Failures go to the log and to Sentry, not to the user.
//
// PLAIN TEXT, DELIBERATELY
//
// HTML email is a rendering minefield and a spam signal when it is done badly.
// Short plain-text mail from a real address lands in inboxes and is readable
// in every client. Revisit when there is a designer, not before.

import * as Sentry from '@sentry/nextjs';
import { COMPANY, CONTACT } from '@/lib/legal';
import { BRAND_FULL, SITE_URL } from '@/lib/site';
import type { Locale } from '@/lib/i18n/config';
import { acknowledgementEmail, type WithdrawalStatement } from '@/lib/withdrawal-rules';

const API = 'https://api.resend.com/emails';

/**
 * Who mail comes from.
 *
 * Should be a SENDING SUBDOMAIN, not the root domain — see the email section
 * of the launch checklist. If the newsletter ever gets flagged for spam, the
 * sign-in and receipt mail must not go down with it.
 */
function fromAddress(): string {
  return process.env.EMAIL_FROM ?? `${COMPANY.tradingName} <onboarding@resend.dev>`;
}

type SendArgs = {
  to: string;
  subject: string;
  text: string;
};

/**
 * True only when the provider accepted the message. Most callers ignore it;
 * the withdrawal acknowledgement records it, because whether that email went
 * out is something the founders may have to prove.
 */
async function send({ to, subject, text }: SendArgs): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    console.log(
      `EMAIL (not sent — RESEND_API_KEY unset): to=${to} subject="${subject}"`
    );
    return false;
  }

  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: fromAddress(), to: [to], subject, text }),
      // A slow mail provider must not hold a checkout webhook open.
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error(`EMAIL: provider rejected the send (${res.status})`, detail.slice(0, 300));
      Sentry.captureMessage(`Transactional email failed: ${subject}`, 'warning');
      return false;
    }
    return true;
  } catch (err) {
    console.error('EMAIL: send failed:', err);
    Sentry.captureException(err);
    return false;
  }
}

function signOff(): string {
  const contact = CONTACT.support.includes('TODO') ? '' : `\nQuestions? Just reply to this email, or write to ${CONTACT.support}.`;
  return `${contact}\n\n— ${BRAND_FULL}`;
}

/**
 * Formats the amount on a receipt.
 *
 * Previously this mapped GBP to "£" and *everything else* to "€", which meant
 * a receipt for a purchase made in pounds printed euros whenever Stripe
 * omitted the currency. A receipt naming the wrong currency is the document a
 * customer forwards to their bank when they dispute the charge, so it is worth
 * more care than a two-way symbol guess.
 *
 * Intl gets the symbol, the placement and the separators right for whatever
 * Stripe actually charged. It throws RangeError on a code it does not know,
 * hence the fallback — a receipt that reads "4.50 XYZ" is still a usable
 * record, whereas an exception here would lose the email entirely.
 *
 * The default is GBP because that is where the company is registered. The
 * divide by 100 assumes a two-decimal currency, which holds for everything
 * Stripe is configured to take here; zero-decimal currencies (JPY, KRW) would
 * need handling before enabling them.
 */
function money(amountCents: number | null | undefined, currency: string | null | undefined): string {
  if (amountCents == null) return 'your purchase';
  const code = (currency ?? 'gbp').toUpperCase();
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: code })
      .format(amountCents / 100);
  } catch {
    return `${(amountCents / 100).toFixed(2)} ${code}`;
  }
}

const PRODUCT_NAMES: Record<string, string> = {
  basic: 'Basic plan',
  full: 'Full plan',
  followup_unlock: 'Follow-up bundle',
  topup: 'Top-up pack',
};

/**
 * Sent after a payment settles. Doubles as the customer's record of what they
 * bought, which is what the refund policy asks them to quote back to us.
 */
export async function sendPurchaseReceipt(args: {
  to: string;
  productType: string;
  amountCents?: number | null;
  currency?: string | null;
  attemptsGranted?: number;
}): Promise<void> {
  const product = PRODUCT_NAMES[args.productType] ?? args.productType;
  const amount = money(args.amountCents, args.currency);

  const granted = args.attemptsGranted
    ? `\nThis added ${args.attemptsGranted} attempt${args.attemptsGranted === 1 ? '' : 's'} to your account.`
    : '';

  await send({
    to: args.to,
    subject: `Your ${COMPANY.tradingName} receipt — ${product}`,
    text: `Thanks for your purchase.

  Item:   ${product}
  Paid:   ${amount}
${granted}
Everything you have bought is on your account page, and your reports stay in your history for as long as you keep the account.

Changed your mind? You can withdraw within 14 days, without giving a reason, at ${SITE_URL}/withdraw

If something is not there, tell us before you contact your bank — we can almost always fix it in a few minutes.${signOff()}`,
  });
}

/**
 * Sent when a report finishes generating.
 *
 * Worth sending even though the report appears on screen: people close tabs,
 * lose connections, and take the assessment on a phone on a train. This is the
 * link back to something they paid for.
 */
export async function sendReportReady(args: {
  to: string;
  kind: 'report' | 'roadmap';
  url: string;
}): Promise<void> {
  const what = args.kind === 'roadmap' ? 'detailed career roadmap' : 'career report';

  await send({
    to: args.to,
    subject: `Your ${what} is ready`,
    text: `Your ${what} has been generated and is waiting in your history:

${args.url}

It stays there, so there is no rush — and no need to take the assessment again to see it.${signOff()}`,
  });
}

/**
 * The acknowledgement Article 11a(4) requires once someone presses "Confirm
 * withdrawal": on a durable medium, without undue delay, repeating what they
 * sent and when. In their language, unlike the other mail here, because this
 * one may have to be read as evidence.
 *
 * Returns whether it went out, so the row can record it and the page can tell
 * the customer to keep a copy if it did not.
 */
export async function sendWithdrawalAcknowledgement(args: {
  to: string;
  locale: Locale;
  statement: WithdrawalStatement;
}): Promise<boolean> {
  const { subject, text } = acknowledgementEmail(args.locale, args.statement, COMPANY.tradingName);
  return send({ to: args.to, subject, text: `${text}${signOff()}` });
}

/**
 * Tells the team a withdrawal has arrived, because the refund clock (14 days)
 * starts now. Goes to the support address once it is real; until then the
 * Sentry alert raised by the route and /admin/withdrawals are the only signal.
 */
export async function notifyWithdrawalReceived(args: {
  reference: string;
  contract: string;
  refundDueBy: string;
}): Promise<void> {
  if (CONTACT.support.includes('TODO')) return;
  await send({
    to: CONTACT.support,
    subject: `Withdrawal received (${args.reference}): refund due by ${args.refundDueBy}`,
    text: `A customer has withdrawn using the button on the site.

  Reference:   ${args.reference}
  Purchase:    ${args.contract}
  Refund by:   ${args.refundDueBy}

Refund it in Stripe, remove the attempts, and mark it handled:
${SITE_URL}/admin/withdrawals`,
  });
}
