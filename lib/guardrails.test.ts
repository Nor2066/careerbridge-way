import { describe, it, expect } from 'vitest';
import {
  detectUnlawfulAspiration,
  LAWFUL_GUIDANCE_RULES,
  UNLAWFUL_PROMPT_ADDENDUM,
} from '@/lib/guardrails';

// The screen is the smaller half of this defence — LAWFUL_GUIDANCE_RULES goes
// into every prompt whether or not it fires. So these tests care much more
// about false positives than false negatives: a report that reads strangely
// for a would-be pharmacist costs a customer, while a missed phrase is still
// covered by the always-on rules.

describe('spotting unlawful work described as a goal', () => {
  const cases = [
    'honestly I want to sell drugs like my cousin',
    'my dream job is being a drug dealer',
    'I want to scam people online, easy money',
    'running a scam is the fastest way to get rich',
    'something like money laundering',
    'I want to be a hitman lol',
    'hacking accounts for money',
    'making counterfeit money',
    'I want to get into trafficking',
  ];

  for (const text of cases) {
    it(`fires on: "${text}"`, () => {
      expect(detectUnlawfulAspiration([text])).toBe(true);
    });
  }

  it('checks every field, not just the first', () => {
    expect(detectUnlawfulAspiration(['teaching', null, undefined, 'or selling weed'])).toBe(true);
  });
});

// These are the ones that matter. Every phrase here is a legitimate career
// answer that a naive keyword list would flag, and flagging them would make
// the report read as an accusation.
describe('leaving legitimate careers alone', () => {
  const cases = [
    'I want to be a pharmacist and dispense drugs safely',
    'Pharmacology research into new drugs',
    'I am interested in drug policy reform',
    'Criminal law — I want to prosecute fraud',
    'Forensic accounting, investigating money laundering',
    'I want to work in anti-trafficking with a charity',
    'Cyber security — ethical hacking and penetration testing',
    'A police officer or detective',
    'Working in a prison as a rehabilitation officer',
    'Retail — I like selling things to people',
    'I want to be a sales rep selling software',
    'Nursing, giving patients their medication',
    'Fraud analyst at a bank',
    'I want to steal the show as a performer',
    '',
  ];

  for (const text of cases) {
    it(`stays quiet on: "${text}"`, () => {
      expect(detectUnlawfulAspiration([text])).toBe(false);
    });
  }

  it('returns false for an empty set', () => {
    expect(detectUnlawfulAspiration([])).toBe(false);
    expect(detectUnlawfulAspiration([null, undefined, ''])).toBe(false);
  });
});

describe('the rules themselves', () => {
  // The base prompt tells the model to stay on the topic of careers. On its
  // own that is not a legality constraint, which is the gap this closes.
  it('forbids recommending unlawful work outright', () => {
    expect(LAWFUL_GUIDANCE_RULES).toMatch(/only ever recommend lawful/i);
  });

  it('forbids presenting an illegal route as easier or more profitable', () => {
    expect(LAWFUL_GUIDANCE_RULES).toMatch(/faster, easier, or more profitable/i);
  });

  // Sending a student toward a protected title without saying it is protected
  // is bad advice, and the kind a language model gives readily.
  it('requires naming the licence for regulated professions', () => {
    expect(LAWFUL_GUIDANCE_RULES).toMatch(/qualification, registration, or licence/i);
  });

  // The redirect is the point. A lecture ends the conversation and teaches the
  // reader the product is not for people like them.
  it('tells the model to redirect rather than moralise', () => {
    expect(UNLAWFUL_PROMPT_ADDENDUM).toMatch(/do not moralise/i);
    expect(UNLAWFUL_PROMPT_ADDENDUM).toMatch(/redirect|lawful careers/i);
    expect(UNLAWFUL_PROMPT_ADDENDUM).toMatch(/they are not in trouble/i);
  });

  it('still produces a full report rather than a refusal', () => {
    expect(UNLAWFUL_PROMPT_ADDENDUM).toMatch(/write the rest of the report exactly as you normally would/i);
  });
});
