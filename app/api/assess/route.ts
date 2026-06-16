// app/api/assess/route.ts
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateScores } from '@/lib/scoring';
import { assessLimiter, getIP } from '@/lib/rate-limit';

// Mirror the exact shape of UserAnswers from lib/scoring.ts
// so TypeScript and Zod are both satisfied.
const SkillsSchema = z.object({
  logicalReasoning: z.number().min(1).max(5),
  creativity: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  workingWithData: z.number().min(1).max(5),
  manualSkills: z.number().min(1).max(5),
  teamwork: z.number().min(1).max(5),
  criticalThinking: z.number().min(1).max(5),
  timeManagement: z.number().min(1).max(5),
  uncertaintyComfort: z.number().min(1).max(5),
  financialRiskComfort: z.number().min(1).max(5),
  pressureTolerance: z.number().min(1).max(5),
  empathy: z.number().min(1).max(5),
  artistic: z.number().min(1).max(5),
  mechanical: z.number().min(1).max(5),
  organization: z.number().min(1).max(5),
  adaptability: z.number().min(1).max(5),
  physicalStamina: z.number().min(1).max(5),
});

const AnswersSchema = z.object({
  subjects: z.array(z.string()),
  activities: z.array(z.string()),
  skills: SkillsSchema,
  thinkingStyle: z.string(),
  learningStyle: z.string(),
  motivations: z.array(z.string()),
  whatMattersMore: z.string(),
  studyHours: z.boolean(),
  academicLevel: z.number().min(1).max(5),
  socialPreference: z.string(),
  workEnvironment: z.array(z.string()),
  jobVision: z.array(z.string()),
  dealbreakerJobs: z.array(z.string()),
  dreamJob: z.string(),
  topValues: z.string(),
  fulfillingProject: z.string(),
  pastConsiderations: z.string(),
  salaryAim: z.string(),
  relocateWillingness: z.string(),
  remoteWork: z.string(),
  workSchedule: z.string(),
  jobSecurity: z.string(),
  travelPreference: z.string(),
  teamEnvironment: z.string(),
  criticismHandling: z.string(),
});

export async function POST(request: Request) {
  const ip = getIP(request);
  const { success } = await assessLimiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    const result = AnswersSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid answers format' }, { status: 400 });
    }

    const scores = calculateScores(result.data);
    return NextResponse.json(scores);
  } catch (error: any) {
    Sentry.captureException(error);
    console.error('Scoring error:', error);
    const response: { error: string; stack?: string } = { error: 'Internal server error' };
    if (process.env.NODE_ENV === 'development') {
      response.stack = error.stack;
    }
    return NextResponse.json(response, { status: 500 });
  }
}