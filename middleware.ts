import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Allow the login page itself
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Protect all other /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const adminAuth = request.cookies.get('admin_auth')?.value;
    if (adminAuth !== 'true') {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}