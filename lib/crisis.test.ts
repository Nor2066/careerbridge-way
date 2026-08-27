import { describe, it, expect } from 'vitest';
import {
  detectCrisisSignals,
  buildSupportNotice,
  SUPPORT_RESOURCES,
  CRISIS_PROMPT_ADDENDUM,
} from '@/lib/crisis';

// The screen is deliberately tuned to over-trigger: showing a helpline to
// someone who did not need it costs almost nothing, and not showing it to
// someone who did is the failure that matters. These tests pin that intent so
// a later "let's reduce false positives" edit has to argue with them first.
describe('detecting distress in free-text answers', () => {
  const cases = [
    'i want to die honestly',
    'sometimes I think about killing myself',
    "there's no point living anymore",
    'I have been self harming again',
    'everyone would be better off without me',
    "I can't go on like this",
    'thinking about suicide a lot lately',
    'I want to end my life',
  ];

  for (const text of cases) {
    it(`fires on: "${text}"`, () => {
      expect(detectCrisisSignals([text])).toBe(true);
    });
  }

  it('finds a signal in any field, not just the first', () => {
    expect(
      detectCrisisSignals(['a doctor', undefined, null, 'honestly I want to die'])
    ).toBe(true);
  });

  it('is case insensitive', () => {
    expect(detectCrisisSignals(['I WANT TO DIE'])).toBe(true);
  });
});

describe('leaving ordinary answers alone', () => {
  const cases = [
    'I want to be a doctor and help people who are ill',
    'My dream job is working in end of life care',
    'I want to work in suicide prevention research',
    'A career where I can go on to lead a team',
    'I am cutting down on my subjects next year',
    'Stability matters more to me than money',
    '',
  ];

  for (const text of cases) {
    it(`stays quiet on: "${text}"`, () => {
      expect(detectCrisisSignals([text])).toBe(false);
    });
  }

  it('returns false for an empty set of answers', () => {
    expect(detectCrisisSignals([])).toBe(false);
    expect(detectCrisisSignals([undefined, null, ''])).toBe(false);
  });
});

describe('the support notice', () => {
  it('offers a route for people outside the UK', () => {
    const notice = buildSupportNotice();
    expect(notice.resources.some((r) => /findahelpline/i.test(r.href ?? ''))).toBe(true);
  });

  it('gives every resource something to actually contact', () => {
    for (const resource of SUPPORT_RESOURCES) {
      expect(resource.name.length).toBeGreaterThan(0);
      expect(resource.contact.length).toBeGreaterThan(0);
      expect(resource.detail.length).toBeGreaterThan(0);
    }
  });

  // The base system prompt forbids anything off the topic of careers, which
  // would have the model write cheerfully about job clusters underneath a
  // disclosure of self-harm. The addendum exists to narrow that rule, and it
  // must not start listing phone numbers of its own — the page shows those,
  // and a model reciting a helpline number from memory can get it wrong.
  it('tells the model the app is already showing the helplines', () => {
    expect(CRISIS_PROMPT_ADDENDUM).toMatch(/support helplines above your report/i);
    expect(CRISIS_PROMPT_ADDENDUM).toMatch(/do not list phone numbers yourself/i);
  });
});
