'use client';

import { useState, useEffect } from 'react';

type Question = {
  id: number;
  text: string;
  options: string[];
  hoverImages?: string[];
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
    hoverImages: ["morning.webp", "afternoon.webp", "evening.webp", "flexible.webp"],
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
    hoverImages: ["focus.webp", "speed.webp", "recall.webp", "empathy.webp"],
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
    hoverImages: ["learning.webp", "creating.webp", "connecting.webp", "exploring.webp"],
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
    hoverImages: ["structured.webp", "remote.webp", "collaborative.webp", "quiet.webp"],
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
    hoverImages: ["research.webp", "consult.webp", "experiment.webp", "plan.webp"],
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
    hoverImages: ["impact.webp", "growth.webp", "balance.webp", "recognition.webp"],
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
    hoverImages: ["build.webp", "help.webp", "optimize.webp", "lead.webp"],
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
    hoverImages: ["strategist.webp", "creator.webp", "connector.webp", "analyst.webp"],
  },
];

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
  onComplete: () => void;
};

export default function BaitQuiz({ onComplete }: BaitQuizProps) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
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
  if (!q) {
    return <div className="p-6 text-white">Loading...</div>;
  }
  const hoverImage = q.hoverImages && hoveredIndex !== null ? `/images/${q.hoverImages[hoveredIndex].replace('.webp', '.webp')}` : null;

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-2 text-sm text-gray-400">
        <span>Question {current + 1} of {questions.length}</span>
        <span>{Math.round(progress)}% Complete</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1.5 mb-6">
        <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>

      <h3 className="text-xl font-semibold text-white mb-6">{q.text}</h3>

      <div className="space-y-3">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(opt)}
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
              {opt}
            </span>
          </button>
        ))}
      </div>

      {current > 0 && (
        <button onClick={handleBack} className="mt-6 text-sm text-gray-400 hover:text-gray-200 transition">
          ← Previous question
        </button>
      )}
    </div>
  );
}