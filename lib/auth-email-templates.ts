// lib/auth-email-templates.ts
//
// The three emails Supabase sends for us: sign-up confirmation (also used by
// "resend"), the login link and password reset. Supabase has one template
// per email, so each template carries both languages and picks one with
// {{ if eq .Data.locale "es" }}, the language the sign-up stored in the
// user's metadata (see lib/email-locale.ts).
//
// The link goes to our own /auth/callback with the token in the query, not
// to Supabase's verify URL. The page then asks for one click before using the
// token. University mail often passes through scanners (Microsoft Safe Links)
// that open every link on arrival; a link that signs in on first open would
// be spent by the scanner, and the student would get "link expired".

import { renderEmailHtml, type EmailContent } from '@/lib/email-layout';
import { EMAIL_COPY } from '@/lib/email-copy';
import { BRAND } from '@/lib/site';
import { COMPANY } from '@/lib/legal';
import { LOCALES, type Locale } from '@/lib/i18n/config';

export type AuthEmailKind = 'signup' | 'magiclink' | 'recovery';

export const AUTH_EMAIL_KINDS: readonly AuthEmailKind[] = ['signup', 'magiclink', 'recovery'];

/** Where each template is pasted in Supabase → Authentication → Emails. */
export const SUPABASE_TEMPLATE_NAMES: Record<AuthEmailKind, string> = {
  signup: 'Confirm sign up',
  magiclink: 'Magic link',
  recovery: 'Reset password',
};

/** Our callback page, with the token for /api/auth/verify-link to redeem.
 *  `lang` opens the page in the email's language, whatever the browser's
 *  last setting, so the language stored at sign-in stays the student's. */
export function authLink(kind: AuthEmailKind, locale: Locale): string {
  return `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=${kind}&lang=${locale}`;
}

function content(kind: AuthEmailKind, locale: Locale): EmailContent {
  const c = EMAIL_COPY[locale];
  const e = c.auth[kind];
  return {
    lang: locale,
    subject: e.subject,
    preview: e.preview,
    heading: e.heading,
    blocks: [
      { kind: 'text', text: e.body },
      { kind: 'button', label: e.button, url: authLink(kind, locale), fallback: c.buttonFallback },
      { kind: 'note', text: e.ignore },
    ],
    footer: [`${BRAND.name} · ${c.descriptor}`, COMPANY.legalName],
  };
}

/** Spanish when the stored language is Spanish, English for everyone else,
 *  including accounts made before the language was stored. */
function byLocale(render: (locale: Locale) => string): string {
  const [en, es] = [render('en'), render('es')];
  return `{{ if eq .Data.locale "es" }}${es}{{ else }}${en}{{ end }}`;
}

export function authEmailTemplate(kind: AuthEmailKind): { subject: string; html: string } {
  // Both languages exist for every email; the type guarantees it, this keeps
  // a third language from being added here and silently left out.
  if (LOCALES.length !== 2) throw new Error('auth email templates handle exactly en and es');
  return {
    subject: byLocale((locale) => EMAIL_COPY[locale].auth[kind].subject),
    html: byLocale((locale) => renderEmailHtml(content(kind, locale))),
  };
}
