import { NextResponse } from 'next/server';
import { calculateScores } from '@/lib/scoring';
import { assessLimiter, getIP } from '@/lib/rate-limit';

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
    const answers = await request.json();
    const result = calculateScores(answers);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Scoring error:', error);
    // Only return stack trace in development
    const response: { error: string; stack?: string } = { error: 'Internal server error' };
    if (process.env.NODE_ENV === 'development') {
      response.stack = error.stack;
    }
    return NextResponse.json(response, { status: 500 });
  }
}