import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminLoginLimiter, getIP } from '@/lib/rate-limit';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(request: Request) {
  const ip = getIP(request);
  const { success } = await adminLoginLimiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429 }
    );
  }

  const { password } = await request.json();

  if (password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set('admin_auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 2,
      path: '/',
    });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}