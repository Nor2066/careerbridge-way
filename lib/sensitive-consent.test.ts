import { describe, expect, it } from 'vitest';
import { SENSITIVE_CONSENT_VERSION, stampSensitiveConsent } from '@/lib/sensitive-consent';

const NOW = new Date('2026-11-13T10:00:00Z');

describe('stampSensitiveConsent', () => {
  it('records a ticked box with our own time and the wording version', () => {
    const saved = stampSensitiveConsent({ dreamJob: 'x', sensitiveConsent: true }, NOW);
    expect(saved.sensitiveConsent).toEqual({ given: true, at: NOW.toISOString(), version: SENSITIVE_CONSENT_VERSION });
    expect(saved.dreamJob).toBe('x');
  });

  it('records an unticked box as not given, with no time', () => {
    expect(stampSensitiveConsent({ sensitiveConsent: false }, NOW).sensitiveConsent).toEqual({
      given: false,
      at: null,
      version: SENSITIVE_CONSENT_VERSION,
    });
  });

  it('never reads anything but a literal true as consent', () => {
    for (const value of [undefined, null, 'true', 1, 'yes', {}, { given: true, at: '2020-01-01' }]) {
      expect(stampSensitiveConsent({ sensitiveConsent: value }, NOW).sensitiveConsent.given).toBe(false);
    }
    expect(stampSensitiveConsent({}, NOW).sensitiveConsent.given).toBe(false);
  });
});
