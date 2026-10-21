'use client';

// components/FeedbackCard.tsx
//
// The 1-to-5 rating under a finished report or roadmap. It feeds the
// "average accuracy" figure on university dashboards.
//
// It used to be a panel fixed to the right edge of the screen that opened
// 1.5 seconds after the report appeared: on a laptop it covered the right of
// the text, on a phone most of the screen. As a card under the report it is
// reached once the student has read to the end, and covers nothing.

import { useState } from 'react';
import { useI18n } from '@/components/I18nProvider';
import InlineError from '@/components/InlineError';
import { apiErrorMessage } from '@/lib/i18n/api-error';

type Props = {
  /** What is being rated: the career report or the follow-up roadmap. */
  questionKey: 'assess.feedback.question' | 'followup.feedback.question';
  className?: string;
};

export default function FeedbackCard({ questionKey, className = '' }: Props) {
  const { t } = useI18n();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (rating === 0) {
      setError(t('assess.feedback.rateFirst'));
      return;
    }
    setError(null);
    setSaving(true);
    try {
      // Only the rating and comment: the assessment itself was saved when it
      // was submitted, and resending it here used to fail validation.
      const res = await fetch('/api/save-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ feedbackRating: rating, feedbackComment: comment }),
      });
      if (res.ok) setSaved(true);
      else setError(apiErrorMessage(t, res.status, await res.json().catch(() => null)));
    } catch {
      setError(t('common.error.network'));
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className={`glass-card text-center ${className}`} role="status">
        <p className="font-semibold text-green-400">{t('assess.feedback.thanks')}</p>
      </div>
    );
  }

  return (
    <section className={`glass-card ${className}`} aria-labelledby="feedback-title">
      <h3 id="feedback-title" className="text-lg font-bold text-white">{t('assess.feedback.title')}</h3>
      <p className="mt-1 text-sm text-gray-300">{t(questionKey)}</p>
      <div className="mt-4 flex justify-center gap-2" role="group" aria-label={t(questionKey)}>
        {[1, 2, 3, 4, 5].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRating(r)}
            aria-pressed={rating === r}
            className={`h-11 w-11 rounded-full text-sm font-bold transition-all ${
              rating === r
                ? 'scale-110 bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {r}
          </button>
        ))}
      </div>
      <label className="mt-4 block">
        <span className="sr-only">{t('assess.feedback.placeholder')}</span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder={t('assess.feedback.placeholder')}
          className="w-full resize-none rounded-lg border border-gray-600 bg-gray-800 p-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </label>
      <button
        type="button"
        onClick={save}
        disabled={saving || rating === 0}
        className="btn-primary mt-3 w-full py-2 text-sm disabled:opacity-50"
      >
        {saving ? t('assess.feedback.saving') : t('assess.feedback.submit')}
      </button>
      <InlineError message={error} className="mt-3" />
    </section>
  );
}
