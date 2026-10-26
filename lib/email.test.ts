import { describe, it, expect } from 'vitest';
import { money, receiptContent, reportReadyContent, withdrawalAcknowledgementContent } from '@/lib/email';
import { renderEmailHtml, renderEmailText } from '@/lib/email-layout';
import { acknowledgementEmail } from '@/lib/withdrawal-rules';

describe('the receipt', () => {
  it('is written in the customer’s language, with their way of writing money', () => {
    const es = receiptContent({ productType: 'basic', amountCents: 300, currency: 'eur', attemptsGranted: 2, locale: 'es' });
    expect(es.subject).toBe('Tu recibo de ADAQNO: Plan Básico');
    expect(renderEmailText(es)).toMatch(/Pagado:\s+3,00\s€/);
    expect(renderEmailText(es)).toMatch(/Añadido:\s+2 intentos/);

    const en = receiptContent({ productType: 'full', amountCents: 450, currency: 'eur', attemptsGranted: 3, locale: 'en' });
    expect(en.subject).toBe('Your ADAQNO receipt: Full plan');
    expect(renderEmailText(en)).toMatch(/Paid:\s+€4\.50/);
  });

  it('points to the history and the withdrawal page', () => {
    const html = renderEmailHtml(receiptContent({ productType: 'basic', amountCents: 300, currency: 'eur', locale: 'en' }));
    expect(html).toMatch(/href="https:\/\/[^"]+\/history"/);
    expect(html).toMatch(/href="https:\/\/[^"]+\/withdraw"/);
  });

  // Govt Decree 45/2014 18. §: the confirmation must confirm the express
  // request and acknowledgement — but only one the customer actually gave.
  it('confirms the immediate-supply consent only when the box was ticked', () => {
    const ticked = renderEmailText(receiptContent({ productType: 'basic', amountCents: 300, locale: 'en', termsConsent: 'accepted' }));
    expect(ticked).toContain('you acknowledged that once you generate a report with an attempt, you lose your 14-day right');

    const unticked = renderEmailText(receiptContent({ productType: 'basic', amountCents: 300, locale: 'en', termsConsent: null }));
    expect(unticked).not.toContain('you acknowledged');
    expect(unticked).toContain('You can withdraw from this purchase within 14 days of today');
  });

  it('repeats the pre-contract information, in the customer’s language', () => {
    const en = renderEmailText(
      receiptContent({ productType: 'full', amountCents: 450, currency: 'eur', locale: 'en', purchasedAt: new Date('2026-10-26T10:00:00Z') })
    );
    expect(en).toContain('ABOUT THIS CONTRACT');
    expect(en).toMatch(/Seller: ADAQNO Kft\. support@/);
    expect(en).not.toContain('..');
    expect(en).toContain('3 complete attempts: the assessment and the follow-up roadmap for each. €4.50, tax included.');
    expect(en).toContain('legal guarantee of conformity (kellékszavatosság)');
    expect(en).toContain('Hungarian conciliation board');
    expect(en).toMatch(/Terms of Service \(version \d{4}-\d{2}-\d{2}\)/);
    expect(en).toMatch(/Date:\s+26 October 2026/);

    const es = renderEmailText(receiptContent({ productType: 'basic', amountCents: 300, currency: 'eur', locale: 'es' }));
    expect(es).toContain('SOBRE ESTE CONTRATO');
    expect(es).toContain('garantía legal de conformidad');
  });

  it('formats a currency it was not told about, and survives a made-up one', () => {
    expect(money(300, 'gbp', 'en')).toBe('£3.00');
    expect(money(300, 'xyz', 'en')).toMatch(/3\.00/);
    expect(money(null, 'eur', 'es')).toBe('—');
  });
});

describe('the "report ready" email', () => {
  it('says which report, in their language, with one button', () => {
    const c = reportReadyContent({ kind: 'roadmap', url: 'https://example.com/history', locale: 'es' });
    expect(c.subject).toBe('Tu hoja de ruta está lista');
    expect(c.blocks.filter((b) => b.kind === 'button')).toHaveLength(1);
  });
});

describe('the withdrawal confirmation', () => {
  const statement = {
    reference: 'W-1A2B3C4D',
    submittedAt: new Date('2026-10-05T08:15:00Z'),
    name: 'Ana <García>',
    contract: 'Plan Básico, 3,00 €',
    confirmationEmail: 'ana@example.com',
  };

  it('keeps the legal wording exactly, in the text version', () => {
    const { text } = withdrawalAcknowledgementContent({ locale: 'es', statement });
    expect(text.startsWith(acknowledgementEmail('es', statement, 'ADAQNO').text)).toBe(true);
  });

  it('escapes what the customer typed', () => {
    const { content } = withdrawalAcknowledgementContent({ locale: 'en', statement });
    const html = renderEmailHtml(content);
    expect(html).toContain('Ana &lt;García&gt;');
    expect(html).not.toContain('<García>');
  });
});
