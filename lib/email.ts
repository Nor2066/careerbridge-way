// lib/email.ts
//
// Transactional email: the receipt, the "your report is ready" note, and the
// withdrawal confirmation (plus a heads-up to us when one arrives). Supabase
// sends the sign-up, login-link and password-reset emails itself, from the
// templates in supabase/email-templates.
//
// A receipt is not a nicety: a customer who paid and finds nothing in their
// inbox is the one who calls their bank instead of us.
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
// SHORT, AND IN THEIR LANGUAGE
//
// One idea and at most one button per email, in the layout every email
// shares (lib/email-layout.ts), always with a plain-text version alongside.
// The words are in lib/email-copy.ts. The receipt is the one exception, with
// small print under the main message: see receiptContent.

import * as Sentry from '@sentry/nextjs';
import { COMPANY, CONTACT, TERMS_VERSION } from '@/lib/legal';
import { BRAND, BRAND_FULL, SITE_URL } from '@/lib/site';
import { INTL_LOCALE, type Locale } from '@/lib/i18n/config';
import { acknowledgementEmail, type WithdrawalStatement } from '@/lib/withdrawal-rules';
import { renderEmailHtml, renderEmailText, type EmailContent } from '@/lib/email-layout';
import { EMAIL_COPY } from '@/lib/email-copy';

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
  html: string;
  text: string;
};

/**
 * True only when the provider accepted the message. Most callers ignore it;
 * the withdrawal acknowledgement records it, because whether that email went
 * out is something the founders may have to prove.
 */
async function send({ to, subject, html, text }: SendArgs): Promise<boolean> {
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
      // Replies reach a person rather than the sending address.
      body: JSON.stringify({ from: fromAddress(), to: [to], reply_to: CONTACT.support, subject, html, text }),
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

function sendContent(to: string, content: EmailContent): Promise<boolean> {
  return send({ to, subject: content.subject, html: renderEmailHtml(content), text: renderEmailText(content) });
}

function footer(locale: Locale): string[] {
  return [`${BRAND.name} · ${EMAIL_COPY[locale].descriptor}`, COMPANY.legalName];
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
 * Stripe actually charged, written the reader's way ("3,00 €" in Spanish). It
 * throws RangeError on a code it does not know, hence the fallback — a receipt
 * that reads "4.50 XYZ" is still a usable record, whereas an exception here
 * would lose the email entirely.
 *
 * The default is EUR because the Stripe Prices are in EUR (lib/prices.ts). The
 * divide by 100 assumes a two-decimal currency, which holds for everything
 * Stripe is configured to take here; zero-decimal currencies (JPY, KRW) would
 * need handling before enabling them.
 */
export function money(amountCents: number | null | undefined, currency: string | null | undefined, locale: Locale): string {
  if (amountCents == null) return '—';
  const code = (currency ?? 'eur').toUpperCase();
  try {
    return new Intl.NumberFormat(INTL_LOCALE[locale], { style: 'currency', currency: code })
      .format(amountCents / 100);
  } catch {
    return `${(amountCents / 100).toFixed(2)} ${code}`;
  }
}

/**
 * Sent after a payment settles. Doubles as the customer's record of what they
 * bought, which is what the refund policy asks them to quote back to us.
 *
 * It is also the confirmation Govt Decree 45/2014 18. § requires (Consumer
 * Rights Directive Art. 8(7)): on a durable medium, by the time supply starts,
 * repeating the pre-contract information of 11. § (1) and confirming the
 * express request for immediate supply and the acknowledgement that the
 * withdrawal right is lost once a report is generated. Without that
 * confirmation the 29. § (1) m) exception does not apply, and a customer who
 * withdraws within 14 days owes nothing for attempts already used (27. § b)).
 * Hence the small print, and hence confirming the consent only when Stripe
 * says the box was ticked: confirming one that was never given would be false.
 */
export function receiptContent(args: {
  productType: string;
  amountCents?: number | null;
  currency?: string | null;
  attemptsGranted?: number;
  locale: Locale;
  /** Stripe's consent.terms_of_service for the session: 'accepted', or null when no box was shown. */
  termsConsent?: string | null;
  purchasedAt?: Date;
}): EmailContent {
  const c = EMAIL_COPY[args.locale].receipt;
  const key = args.productType as keyof typeof c.products;
  const product = c.products[key] ?? args.productType;
  const amount = money(args.amountCents, args.currency, args.locale);
  const rows: [string, string][] = [
    [c.item, product],
    [c.paid, amount],
  ];
  if (args.attemptsGranted) rows.push([c.added, c.attempts(args.attemptsGranted)]);
  if (args.purchasedAt) {
    rows.push([
      c.date,
      new Intl.DateTimeFormat(INTL_LOCALE[args.locale], { dateStyle: 'long', timeZone: 'Europe/Budapest' }).format(
        args.purchasedAt
      ),
    ]);
  }

  const k = c.contract;
  return {
    lang: args.locale,
    subject: c.subject(product),
    preview: c.preview(amount),
    heading: c.heading,
    blocks: [
      { kind: 'details', rows },
      { kind: 'text', text: c.body },
      { kind: 'button', label: c.button, url: `${SITE_URL}/history` },
      { kind: 'note', text: args.termsConsent === 'accepted' ? c.consentGiven : c.consentMissing },
      { kind: 'note', text: c.withdraw, link: { label: c.withdrawLink, url: `${SITE_URL}/withdraw` } },
      { kind: 'note', text: c.help(CONTACT.support) },
      { kind: 'heading', text: k.heading },
      { kind: 'note', text: k.keep },
      {
        kind: 'note',
        text: k.seller({
          name: COMPANY.legalName,
          address: COMPANY.address,
          companyNumber: COMPANY.companyNumber,
          registryCourt: COMPANY.registryCourt,
          taxNumber: COMPANY.taxNumber,
          email: CONTACT.support,
          phone: CONTACT.phone,
        }),
      },
      { kind: 'note', text: k.bought(c.describe[key] ?? product, amount) },
      { kind: 'note', text: k.delivery },
      { kind: 'note', text: k.withdrawal },
      { kind: 'note', text: k.faulty },
      { kind: 'note', text: k.complaints(CONTACT.support, CONTACT.phone) },
      { kind: 'note', text: k.terms(TERMS_VERSION, SITE_URL), link: { label: k.termsLink, url: `${SITE_URL}/terms` } },
    ],
    footer: footer(args.locale),
  };
}

export async function sendPurchaseReceipt(args: {
  to: string;
  productType: string;
  amountCents?: number | null;
  currency?: string | null;
  attemptsGranted?: number;
  locale: Locale;
  termsConsent?: string | null;
  purchasedAt?: Date;
}): Promise<void> {
  await sendContent(args.to, receiptContent(args));
}

/**
 * Sent when a report finishes generating.
 *
 * Worth sending even though the report appears on screen: people close tabs,
 * lose connections, and take the assessment on a phone on a train. This is the
 * link back to something they paid for.
 */
export function reportReadyContent(args: { kind: 'report' | 'roadmap'; url: string; locale: Locale }): EmailContent {
  const c = EMAIL_COPY[args.locale].ready;
  const k = c[args.kind];
  return {
    lang: args.locale,
    subject: k.subject,
    preview: c.body,
    heading: k.subject,
    blocks: [
      { kind: 'text', text: c.body },
      { kind: 'button', label: k.button, url: args.url },
    ],
    footer: footer(args.locale),
  };
}

export async function sendReportReady(args: {
  to: string;
  kind: 'report' | 'roadmap';
  url: string;
  locale: Locale;
}): Promise<void> {
  await sendContent(args.to, reportReadyContent(args));
}

/**
 * The acknowledgement Article 11a(4) requires once someone presses "Confirm
 * withdrawal": on a durable medium, without undue delay, repeating what they
 * sent and when. The wording is the legal text from lib/withdrawal-rules.ts,
 * unchanged; only the layout is shared with the other emails.
 *
 * Returns whether it went out, so the row can record it and the page can tell
 * the customer to keep a copy if it did not.
 */
export function withdrawalAcknowledgementContent(args: {
  locale: Locale;
  statement: WithdrawalStatement;
}): { content: EmailContent; text: string } {
  const { subject, text, parts } = acknowledgementEmail(args.locale, args.statement, COMPANY.tradingName);
  const content: EmailContent = {
    lang: args.locale,
    subject,
    preview: parts.opening,
    heading: EMAIL_COPY[args.locale].withdrawal.heading,
    blocks: [
      { kind: 'text', text: parts.opening },
      { kind: 'details', rows: parts.rows },
      { kind: 'text', text: parts.next },
      { kind: 'note', text: parts.keep },
    ],
    footer: footer(args.locale),
  };
  return { content, text: `${text}\n\n—\n${content.footer.join('\n')}` };
}

export async function sendWithdrawalAcknowledgement(args: {
  to: string;
  locale: Locale;
  statement: WithdrawalStatement;
}): Promise<boolean> {
  const { content, text } = withdrawalAcknowledgementContent(args);
  return send({ to: args.to, subject: content.subject, html: renderEmailHtml(content), text });
}

/**
 * Tells the team a withdrawal has arrived, because the refund clock (14 days)
 * starts now. Internal, so English only.
 */
export async function notifyWithdrawalReceived(args: {
  reference: string;
  contract: string;
  refundDueBy: string;
}): Promise<void> {
  await sendContent(CONTACT.support, {
    lang: 'en',
    subject: `Withdrawal received (${args.reference}): refund due by ${args.refundDueBy}`,
    preview: `Refund due by ${args.refundDueBy}.`,
    heading: 'Withdrawal received',
    blocks: [
      {
        kind: 'details',
        rows: [
          ['Reference', args.reference],
          ['Purchase', args.contract],
          ['Refund by', args.refundDueBy],
        ],
      },
      { kind: 'text', text: 'Refund it in Stripe, remove the attempts, and mark it handled.' },
      { kind: 'button', label: 'Open withdrawals', url: `${SITE_URL}/admin/withdrawals` },
    ],
    footer: [BRAND_FULL],
  });
}
