import { describe, it, expect } from 'vitest';
import { reportContextInstruction, clusterForPrompt, supportCountry } from '@/lib/report-locale';
import { describeFollowupAnswer } from '@/lib/followup-questions';

const request = (headers: Record<string, string> = {}) => new Request('https://example.com/api', { headers });

describe('telling the model about language and place', () => {
  // Nothing should change for an English reader with no university.
  it('adds nothing for English with no known country', () => {
    expect(reportContextInstruction('en')).toBe('');
    expect(reportContextInstruction('en', null)).toBe('');
  });

  it('asks for Spanish when the reader is reading in Spanish', () => {
    const text = reportContextInstruction('es');
    expect(text).toMatch(/entire report in Spanish/);
  });

  it('names the university’s country when it is known', () => {
    expect(reportContextInstruction('es', 'ES')).toMatch(/studies in Spain/);
    expect(reportContextInstruction('en', 'BR')).toMatch(/studies in BR/);
  });

  it('gives clusters their display name in the reader’s language', () => {
    expect(clusterForPrompt('es', 'SkilledTrades')).toBe('Oficios cualificados');
    expect(clusterForPrompt('en', 'SkilledTrades')).toBe('Skilled Trades');
  });
});

describe('which country’s helplines to show', () => {
  it('trusts the university’s country first', () => {
    expect(supportCountry(request({ 'x-vercel-ip-country': 'GB' }), { institutionCountry: 'es', locale: 'en' })).toBe('ES');
  });

  it('then where the request came from', () => {
    expect(supportCountry(request({ 'x-vercel-ip-country': 'mx' }), { locale: 'es' })).toBe('MX');
  });

  it('then a guess from the language, otherwise unknown', () => {
    expect(supportCountry(request(), { locale: 'es' })).toBe('ES');
    expect(supportCountry(request(), { locale: 'en' })).toBeNull();
  });
});

describe('follow-up answers sent to the model', () => {
  it('turns a stored letter into the question and the option it stands for', () => {
    const d = describeFollowupAnswer('Analytical', 4, 'b');
    expect(d?.question).toBe('Which sounds more appealing to you?');
    expect(d?.answer).toBe('Using already existing information to find answers');
  });

  it('passes free text through, and knows nothing about unknown questions', () => {
    expect(describeFollowupAnswer('Analytical', 0, 'my own words')?.answer).toBe('my own words');
    expect(describeFollowupAnswer('Nonexistent', 0, 'a')).toBeNull();
    expect(describeFollowupAnswer('Analytical', 99, 'a')).toBeNull();
  });
});
