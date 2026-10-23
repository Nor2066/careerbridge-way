'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/components/I18nProvider';
import { DEMO_QUESTIONS, scoreDemo, type DemoResult } from '@/lib/demo-quiz';

const questions = DEMO_QUESTIONS;

// Custom background positions for specific images
const imagePositionMap: Record<string, string> = {
  'morning.webp': 'center 60%',
  'afternoon.webp': 'center 55%',
  'evening.webp': 'center 50%',
  'flexible.webp': 'center 52%',
  'focus.webp': 'center 37%',
  'speed.webp': 'center 82%',
  'recall.webp': 'center 45%',
  'empathy.webp': 'center 58%',
  // Add more entries as needed
 // Question 3 – add your desired positions
  'learning.webp': 'center 65%',
  'creating.webp': 'center 52%',
  'connecting.webp': 'center 61%',
  'exploring.webp': 'center 65%',

  // Question 4
  'structured.webp': 'center 53%',
  'remote.webp': 'center 45%',
  'collaborative.webp': 'center 73%',
  'quiet.webp': 'center 23%',

  // Question 5
  'research.webp': 'center 34%',
  'consult.webp': 'center 51%',
  'experiment.webp': 'center 75%',
  'plan.webp': 'center 25%',

  // Question 6
  'impact.webp': 'center 78%',
  'growth.webp': 'center 45%',
  'balance.webp': 'center 38%',
  'recognition.webp': 'center 65%',

  // Question 7
  'build.webp': 'center 79%',
  'help.webp': 'center 79%',
  'optimize.webp': 'center 30%',
  'lead.webp': 'center 16%',

  // Question 8
  'strategist.webp': 'center 65%',
  'creator.webp': 'center 55%',
  'connector.webp': 'center 30%',
  'analyst.webp': 'center 60%',
};

function getBackgroundPosition(imagePath: string): string {
  const filename = imagePath.split('/').pop() || '';
  return imagePositionMap[filename] || 'center';
}

type BaitQuizProps = {
  onComplete: (result: DemoResult) => void;
};

export default function BaitQuiz({ onComplete }: BaitQuizProps) {
  const { t, tOption } = useI18n();
  const [current, setCurrent] = useState(0);
  // The chosen option's index for each question, which is what scoring uses.
  const [answers, setAnswers] = useState<number[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Preload all images
  useEffect(() => {
    const imagePaths: string[] = [];
    questions.forEach((q) => {
      if (q.hoverImages) {
        q.hoverImages.forEach((img) => imagePaths.push(`/images/${img}`));
      }
    });
    imagePaths.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const handleAnswer = (optionIndex: number) => {
    const next = [...answers];
    next[current] = optionIndex;
    setAnswers(next);
    setHoveredIndex(null);
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      onComplete(scoreDemo(next));
    }
  };

  const handleBack = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const progress = ((current + 1) / questions.length) * 100;
  const q = questions[current];
  if (!q) {
    return <div className="p-6 text-white">{t('common.loading')}</div>;
  }
  const hoverImage = q.hoverImages && hoveredIndex !== null ? `/images/${q.hoverImages[hoveredIndex].replace('.webp', '.webp')}` : null;

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-2 text-sm text-gray-400">
        <span>{t('demo.progress', { current: current + 1, total: questions.length })}</span>
        <span>{t('demo.complete', { percent: Math.round(progress) })}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1.5 mb-6">
        <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>

      <h3 className="text-xl font-semibold text-white mb-6">{tOption(q.text)}</h3>

      <div className="space-y-3">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(idx)}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="relative w-full text-left p-4 border border-gray-700 rounded-lg overflow-hidden hover:border-blue-500 group"
          >
            {hoverImage && hoveredIndex === idx && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${hoverImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: getBackgroundPosition(hoverImage),
                  backgroundRepeat: 'no-repeat',
                  opacity: 0.35,
                }}
              />
            )}
            <span className="relative z-10 text-gray-200 group-hover:text-white">
              {tOption(opt)}
            </span>
          </button>
        ))}
      </div>

      {current > 0 && (
        <button onClick={handleBack} className="mt-6 text-sm text-gray-400 hover:text-gray-200 transition">
          {t('demo.previous')}
        </button>
      )}
    </div>
  );
}