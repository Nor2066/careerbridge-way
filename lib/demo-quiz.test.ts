import { describe, it, expect } from 'vitest';
import { DEMO_QUESTIONS, DEMO_STYLES, DEMO_STYLE_AREAS, scoreDemo, type DemoStyle } from '@/lib/demo-quiz';
import { OPTION_LABELS, CLUSTER_LABELS } from '@/lib/i18n/options';

/** The answers that pick `style` on every question. */
const allOf = (style: DemoStyle) => DEMO_QUESTIONS.map((q) => q.styles.indexOf(style));

describe('the demo questions', () => {
  it('gives every option exactly one style, and every style a vote on every question', () => {
    for (const q of DEMO_QUESTIONS) {
      expect(q.styles).toHaveLength(q.options.length);
      expect(q.hoverImages).toHaveLength(q.options.length);
      expect([...q.styles].sort()).toEqual([...DEMO_STYLES].sort());
    }
  });

  // The text is also the translation key, so a typo here would show English
  // on the Spanish site.
  it('has a Spanish label for every question and option', () => {
    const texts = DEMO_QUESTIONS.flatMap((q) => [q.text, ...q.options]);
    expect(texts.filter((s) => !OPTION_LABELS[s]?.es)).toEqual([]);
  });

  it('suggests career areas the full assessment knows', () => {
    for (const areas of Object.values(DEMO_STYLE_AREAS)) {
      for (const area of areas) expect(CLUSTER_LABELS, area).toHaveProperty(area);
    }
  });
});

describe('scoring the demo', () => {
  it('names the style someone picked throughout', () => {
    for (const style of DEMO_STYLES) {
      const result = scoreDemo(allOf(style));
      expect(result.top).toBe(style);
      expect(result.shares[style]).toBe(100);
    }
  });

  it('weighs the answers: the last question counts most, the first least', () => {
    // Four creative answers (2 each) against three social ones (2, 2, 3).
    const answers = allOf('analytical');
    const set = (i: number, style: DemoStyle) => (answers[i] = DEMO_QUESTIONS[i].styles.indexOf(style));
    [1, 2, 3, 4].forEach((i) => set(i, 'creative'));
    [5, 6, 7].forEach((i) => set(i, 'social'));
    set(0, 'strategic');
    const result = scoreDemo(answers);
    expect(result.top).toBe('creative'); // 8 votes
    expect(result.second).toBe('social'); // 7 votes
  });

  it('breaks a tie in favour of the style chosen in the last question', () => {
    // Analytical and social both get 6 votes; social was the self-pick.
    const answers = allOf('creative');
    const set = (i: number, style: DemoStyle) => (answers[i] = DEMO_QUESTIONS[i].styles.indexOf(style));
    [1, 2, 3].forEach((i) => set(i, 'analytical'));
    [4, 7].forEach((i) => set(i, 'social'));
    set(0, 'social'); // 1 + 2 + 3 = 6
    const result = scoreDemo(answers);
    expect(result.top).toBe('social');
    expect(result.second).toBe('analytical');
  });

  it('gives shares that add up to 100', () => {
    const mixed = DEMO_QUESTIONS.map((_, i) => i % 4);
    const { shares } = scoreDemo(mixed);
    expect(DEMO_STYLES.reduce((sum, s) => sum + shares[s], 0)).toBe(100);
  });

  it('copes with missing or invalid answers', () => {
    const result = scoreDemo([]);
    expect(DEMO_STYLES).toContain(result.top);
    expect(DEMO_STYLES.reduce((sum, s) => sum + result.shares[s], 0)).toBe(100);
    expect(scoreDemo([99, -1, undefined]).top).toBe('analytical');
  });
});
