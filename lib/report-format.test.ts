import { describe, it, expect } from 'vitest';
import { parseInline, parseReport } from '@/lib/report-format';

// Reports are the product. Every stored report uses bold, and before this
// they were shown with the asterisks visible. These pin the shapes the model
// actually produces, taken from the reports generated on 2026-10-21.

describe('parseInline', () => {
  it('splits bold spans', () => {
    expect(parseInline('Tus áreas son **Operaciones** y **Salud**.')).toEqual([
      { text: 'Tus áreas son ' },
      { text: 'Operaciones', bold: true },
      { text: ' y ' },
      { text: 'Salud', bold: true },
      { text: '.' },
    ]);
  });

  it('keeps an unclosed marker as text', () => {
    expect(parseInline('**sin cerrar')).toEqual([{ text: '**sin cerrar' }]);
  });

  it('reads single stars as italic but leaves multiplication alone', () => {
    expect(parseInline('a *really* good fit')).toEqual([
      { text: 'a ' },
      { text: 'really', italic: true },
      { text: ' good fit' },
    ]);
    expect(parseInline('2 * 3 = 6')).toEqual([{ text: '2 * 3 = 6' }]);
  });
});

describe('parseReport', () => {
  it('turns a line that is only bold into a heading', () => {
    const blocks = parseReport('**Informe de Orientación Profesional**\n\n¡Hola! Texto.');
    // The heading is styled bold, so its text carries no separate bold flag.
    expect(blocks[0]).toEqual({ type: 'heading', level: 4, content: [{ text: 'Informe de Orientación Profesional' }] });
    expect(blocks[1]).toEqual({ type: 'paragraph', lines: [[{ text: '¡Hola! Texto.' }]] });
  });

  it('turns # headings into headings', () => {
    const [h] = parseReport('### Next steps');
    expect(h).toEqual({ type: 'heading', level: 3, content: [{ text: 'Next steps' }] });
  });

  it('builds a nested list under a numbered heading line', () => {
    const src = [
      '**1. Operaciones (53.6%)**  ',
      '- **Títulos de trabajo recomendados:** ',
      '  - Coordinador de cadena de suministro',
      '  - Analista de operaciones',
      '- **Cursos:**',
      '  - Gestión de proyectos',
    ].join('\n');
    const blocks = parseReport(src);
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toEqual({ type: 'heading', level: 4, content: [{ text: '1. Operaciones (53.6%)' }] });
    const list = blocks[1];
    expect(list.type).toBe('list');
    if (list.type !== 'list') return;
    expect(list.ordered).toBe(false);
    expect(list.items).toHaveLength(2);
    expect(list.items[0].content).toEqual([{ text: 'Títulos de trabajo recomendados:', bold: true }]);
    expect(list.items[0].children?.items.map((i) => i.content[0].text)).toEqual([
      'Coordinador de cadena de suministro',
      'Analista de operaciones',
    ]);
    expect(list.items[1].children?.items).toHaveLength(1);
  });

  it('keeps numbered lists numbered, from their first number', () => {
    const [list] = parseReport('1. First\n2. Second\n3. Third');
    expect(list).toMatchObject({ type: 'list', ordered: true, start: 1 });
    if (list.type === 'list') expect(list.items).toHaveLength(3);
  });

  it('keeps a list together across blank lines between items', () => {
    const [list, ...rest] = parseReport('1. One\n\n2. Two\n\nAfter.');
    expect(list.type === 'list' && list.items.length).toBe(2);
    expect(rest).toEqual([{ type: 'paragraph', lines: [[{ text: 'After.' }]] }]);
  });

  it('keeps the line breaks of a paragraph', () => {
    const [p] = parseReport('Line one\nLine two');
    expect(p).toEqual({ type: 'paragraph', lines: [[{ text: 'Line one' }], [{ text: 'Line two' }]] });
  });

  it('never produces markup from what a report contains', () => {
    const [p] = parseReport('<script>alert(1)</script> **<b>x</b>**');
    expect(JSON.stringify(p)).toContain('<script>');
    expect(p.type).toBe('paragraph');
  });

  it('returns nothing for an empty report', () => {
    expect(parseReport('')).toEqual([]);
    expect(parseReport('\n\n')).toEqual([]);
  });
});
