import { describe, it, expect } from 'vitest';
import { AUTH_EMAIL_KINDS, authEmailTemplate, authLink, type AuthEmailKind } from '@/lib/auth-email-templates';

const FILES: Record<AuthEmailKind, string> = {
  signup: 'confirm-sign-up',
  magiclink: 'magic-link',
  recovery: 'reset-password',
};

describe('the Supabase email templates', () => {
  // These files are what gets pasted into the Supabase dashboard. After
  // changing the wording or the layout, rewrite them with
  //   npx vitest run -u lib/auth-email-templates.test.ts
  // and paste them again. Until then this test fails, so the files and the
  // code cannot quietly disagree.
  for (const kind of AUTH_EMAIL_KINDS) {
    it(`${kind}: matches the files to paste`, async () => {
      const { subject, html } = authEmailTemplate(kind);
      await expect(html).toMatchFileSnapshot(`../supabase/email-templates/${FILES[kind]}.html`);
      await expect(subject).toMatchFileSnapshot(`../supabase/email-templates/${FILES[kind]}.subject.txt`);
    });

    it(`${kind}: links to our page with the token, in both languages`, () => {
      const { html } = authEmailTemplate(kind);
      const [es, en] = html.split('{{ else }}');
      // Per language: the button, and the fallback link's address and text,
      // each opening the page in that language.
      for (const [part, locale] of [[es, 'es'], [en, 'en']] as const) {
        const link = authLink(kind, locale).replaceAll('&', '&amp;');
        expect(part.split(link).length - 1).toBe(3);
      }
      // Supabase's own link would be spent by mail scanners on arrival.
      expect(html).not.toContain('ConfirmationURL');
    });

    it(`${kind}: is valid template syntax with one language switch`, () => {
      const { subject, html } = authEmailTemplate(kind);
      for (const text of [subject, html]) {
        expect(text.startsWith('{{ if eq .Data.locale "es" }}')).toBe(true);
        expect(text.match(/\{\{ else \}\}/g)).toHaveLength(1);
        expect(text.endsWith('{{ end }}')).toBe(true);
        // Only the placeholders Supabase fills in.
        const used = new Set([...text.matchAll(/\{\{ ([^}]+) \}\}/g)].map((m) => m[1]));
        for (const p of used) {
          expect(['if eq .Data.locale "es"', 'else', 'end', '.RedirectTo', '.TokenHash']).toContain(p);
        }
      }
    });
  }

  it('writes each language in its own words', () => {
    const { html } = authEmailTemplate('signup');
    const [es, en] = html.split('{{ else }}');
    expect(es).toContain('lang="es"');
    expect(es).toContain('Confirma tu correo');
    expect(en).toContain('lang="en"');
    expect(en).toContain('Confirm your email');
  });
});
