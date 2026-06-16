
import { NextResponse } from 'next/server';

export async function GET() {
  // Block this endpoint entirely in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Test endpoint works' });
}
