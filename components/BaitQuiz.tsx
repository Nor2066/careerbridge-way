'use client';

import { useState } from 'react';

type Question = {
  id: number;
  text: string;
  options: string[];
  hoverIcons?: string[];
};

const questions: Question[] = [
  {
    id: 1,
    text: "What's your natural energy rhythm throughout the day?",
    options: [
      "Early morning – I'm most productive before noon",
      "Afternoon – I hit my stride after lunch",
      "Evening – I do my best work after 6 PM",
      "Flexible – I adapt to whatever schedule is needed",
    ],
    hoverIcons: ["🌞", "☀️", "🌙", "⏰"],
  },
  {
    id: 2,
    text: "If you could choose one professional superpower, which would it be?",
    options: [
      "Deep focus – complete complex tasks with precision",
      "Speed – deliver results twice as fast",
      "Perfect recall – never forget important details",
      "Empathy – understand and connect with anyone",
    ],
    hoverIcons: ["🎯", "⚡", "🧠", "🤝"],
  },
  {
    id: 3,
    text: "What activity do you find most energising on weekends?",
    options: [
      "Learning something new (course, book, workshop)",
      "Creating something (writing, building, designing)",
      "Connecting with friends or family",
      "Exploring outdoors or trying new experiences",
    ],
  },
  {
    id: 4,
    text: "What's your preferred work environment?",
    options: [
      "Structured office with clear processes",
      "Flexible remote or hybrid setup",
      "Collaborative open-plan workspace",
      "Quiet space for deep focused work",
    ],
  },
  {
    id: 5,
    text: "How do you typically approach problem-solving?",
    options: [
      "Research thoroughly before acting",
      "Consult others for different perspectives",
      "Experiment until I find what works",
      "Create a step-by-step structured plan",
    ],
  },
  {
    id: 6,
    text: "Which work value is most important to you?",
    options: [
      "Making a meaningful impact",
      "Continuous learning and growth",
      "Work-life balance and flexibility",
      "Recognition and career advancement",
    ],
  },
  {
    id: 7,
    text: "Complete this sentence: 'At work, I want to...'",
    options: [
      "Build innovative products or solutions",
      "Help people directly",
      "Optimise processes and systems",
      "Lead and inspire teams",
    ],
  },
  {
    id: 8,
    text: "Which of these role archetypes resonates most with you?",
    options: [
      "Strategist – planning and vision",
      "Creator – designing and building",
      "Connector – relationships and communication",
      "Analyst – data and insights",
    ],
  },
];

type BaitQuizProps = {
  onComplete: () => void;
};

export default function BaitQuiz({ onComplete }: BaitQuizProps) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [current]: answer });
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const progress = ((current + 1) / questions.length) * 100;
  const q = questions[current];
  const hasHoverIcons = q.hoverIcons && q.hoverIcons.length === q.options.length;
  const hoverIcon = hasHoverIcons && hoveredIndex !== null ? q.hoverIcons![hoveredIndex] : null;

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-2 text-sm text-gray-400">
        <span>Question {current + 1} of {questions.length}</span>
        <span>{Math.round(progress)}% Complete</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1.5 mb-6">
        <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-xl font-semibold text-white">{q.text}</h3>
        {hoverIcon && (
          <div className="text-2xl transition-all duration-200 animate-bounce-in">
            {hoverIcon}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(opt)}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="w-full text-left p-4 border border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-900/30 transition text-gray-200"
          >
            {opt}
          </button>
        ))}
      </div>

      {current > 0 && (
        <button onClick={handleBack} className="mt-6 text-sm text-gray-400 hover:text-gray-200 transition">
          ← Previous question
        </button>
      )}

      <style jsx>{`
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.5); }
          80% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-bounce-in {
          animation: bounceIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}