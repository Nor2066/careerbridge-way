import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  aiProvenance,
  withAiProvenance,
  IPTC_AI_SOURCE,
  SCHEMA_AI_SOURCE,
} from '@/lib/ai-provenance';
import { USER_DATA_TABLES } from '@/lib/account-data';

// The real provider needs the Next router. The marker does not depend on the
// language, so a translator that echoes its key is enough here.
vi.mock('@/components/I18nProvider', () => ({
  useI18n: () => ({ t: (key: string) => key, locale: 'en' }),
}));

// The AI notice promises that a report carries a machine-readable marker on
// the page and in the data download. These pin both, so neither can be
// dropped without a test saying so.

describe('aiProvenance', () => {
  it('names the IPTC and schema.org codes for AI-generated content', () => {
    const p = aiProvenance();
    expect(p.ai_generated).toBe(true);
    expect(p.digital_source_type).toBe(IPTC_AI_SOURCE);
    expect(p.schema_org_digital_source_type).toBe(SCHEMA_AI_SOURCE);
    expect(p.human_reviewed).toBe(false);
    expect(p.notice).toMatch(/\/ai-notice$/);
  });

  it('does not name a model, because stored reports do not record one', () => {
    expect(JSON.stringify(aiProvenance())).not.toMatch(/gpt|openai|claude/i);
  });
});

describe('withAiProvenance', () => {
  it('marks every row and leaves the original rows alone', () => {
    const rows = [{ id: 1, report: 'a' }, { id: 2, report: 'b' }];
    const marked = withAiProvenance(rows);
    expect(marked).toHaveLength(2);
    expect(marked.every((r) => r.ai_provenance.ai_generated === true)).toBe(true);
    expect(marked[1].report).toBe('b');
    expect(rows[0]).not.toHaveProperty('ai_provenance');
  });

  it('returns an empty list for no rows', () => {
    expect(withAiProvenance([])).toEqual([]);
  });
});

describe('the data download', () => {
  it('marks the two tables that hold AI-written text, and only those', () => {
    const marked = USER_DATA_TABLES.filter((t) => t.aiGenerated).map((t) => t.table);
    expect(marked.sort()).toEqual(['ai_followup_reports', 'ai_main_reports']);
  });
});

describe('ReportText', () => {
  it('wraps the report in the marker and keeps the schema.org link inside it', async () => {
    const { default: ReportText } = await import('@/components/ReportText');
    const html = renderToStaticMarkup(
      createElement(ReportText, { text: '**Informe**\n\nTexto del informe.' })
    );

    expect(html.startsWith('<div')).toBe(true);
    expect(html.endsWith('</div>')).toBe(true);
    expect(html).toContain('data-ai-generated="true"');
    expect(html).toContain(`data-digital-source-type="${IPTC_AI_SOURCE}"`);
    expect(html).toContain('itemType="https://schema.org/CreativeWork"');
    // Inside the wrapper, not hoisted to <head>, or it would describe the page.
    expect(html).toContain(`<link itemProp="digitalSourceType" href="${SCHEMA_AI_SOURCE}"/>`);
    // The words for the person reading.
    expect(html).toContain('report.aiNote');
    expect(html).toContain('href="/ai-notice"');
    // The report itself still renders, with its heading first.
    expect(html).toContain('Texto del informe.');
    expect(html.indexOf('Informe')).toBeLessThan(html.indexOf('report.aiNote'));
  });
});
