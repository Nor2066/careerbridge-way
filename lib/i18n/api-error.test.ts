import { describe, it, expect } from 'vitest';
import { apiErrorMessage } from '@/lib/i18n/api-error';
import { createTranslator } from '@/lib/i18n/translate';

const es = createTranslator('es').t;
const en = createTranslator('en').t;

describe('apiErrorMessage', () => {
  it('words a paused service in the reader’s language', () => {
    const body = { error: 'Report generation is paused right now…', code: 'SERVICE_PAUSED' };
    const msg = apiErrorMessage(es, 503, body);
    expect(msg).toContain('pausa');
    expect(msg).not.toContain('Report generation');
  });

  it('prefers the code over the status', () => {
    expect(apiErrorMessage(en, 403, { code: 'SUBSCRIPTION_REQUIRED' })).toBe(en('error.noAttempts'));
    expect(apiErrorMessage(en, 403, { code: 'FOLLOWUP_LOCKED' })).toBe(en('followup.locked'));
  });

  it('falls back on the status when there is no code', () => {
    expect(apiErrorMessage(es, 409, { error: 'already' })).toBe(es('error.alreadyRunning'));
    expect(apiErrorMessage(es, 429, null)).toBe(es('error.tooMany'));
    expect(apiErrorMessage(es, 401, undefined)).toBe(es('error.sessionExpired'));
  });

  it('never returns the server’s English text', () => {
    expect(apiErrorMessage(es, 500, { error: 'Internal server error' })).toBe(es('common.error.generic'));
  });
});
