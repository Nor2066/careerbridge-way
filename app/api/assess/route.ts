import { NextResponse } from 'next/server';
import { calculateScores } from '@/lib/scoring';

export async function POST(request: Request) {
  try {
    const answers = await request.json();
    const result = calculateScores(answers);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}