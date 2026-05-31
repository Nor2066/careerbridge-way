import { NextResponse } from 'next/server';
import { calculateScores } from '@/lib/scoring';

export async function POST(request: Request) {
  try {
    const answers = await request.json();
    console.log('Received answers keys:', Object.keys(answers));
    const result = calculateScores(answers);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Scoring error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error', stack: error.stack },
      { status: 500 }
    );
  }
}