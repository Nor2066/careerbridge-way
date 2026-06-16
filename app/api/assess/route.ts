// app/api/assess/route.ts
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateScores } from '@/lib/scoring';
import { assessLimiter, getIP } from '@/lib/rate-limit';

// Validate the answers object — adjust this shape to match what calculateScores expects
const AnswersSchema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]));

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
    console.error('Scoring error:', error);
    const response: { error: string; stack?: string } = { error: 'Internal server error' };
    if (process.env.NODE_ENV === 'development') {
      response.stack = error.stack;
    }
    return NextResponse.json(response, { status: 500 });
  }
}