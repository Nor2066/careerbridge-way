// lib/i18n/api-error.ts
//
// Turns a failed API response into a sentence in the reader's language.
//
// The routes answer with an English `error` string meant for logs and a
// `code` meant for this. Before, pages put that English string inside a
// translated sentence ("No se ha podido generar el informe: Report generation
// is paused..."), so a Spanish reader got half of each.

import type { Translator } from '@/lib/i18n/translate';

export function apiErrorMessage(t: Translator['t'], status: number, body: unknown): string {
  const code =
    body && typeof body === 'object' && 'code' in body ? String((body as { code: unknown }).code) : null;

  switch (code) {
    case 'SERVICE_PAUSED':
      return t('error.paused');
    case 'UNAUTHENTICATED':
      return t('error.sessionExpired');
    case 'EMAIL_NOT_VERIFIED':
      return t('error.emailNotVerified');
    case 'SUBSCRIPTION_REQUIRED':
      return t('error.noAttempts');
    case 'FOLLOWUP_LOCKED':
      return t('followup.locked');
    case 'GENERATION_FAILED':
      return t('error.generationFailed');
  }

  if (status === 401) return t('error.sessionExpired');
  if (status === 409) return t('error.alreadyRunning');
  if (status === 429) return t('error.tooMany');
  if (status === 503) return t('error.paused');
  return t('common.error.generic');
}
