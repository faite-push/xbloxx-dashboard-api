import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const publicRoutes = ['/login', '/api/influencers'];
const protectedRoutes = ['/admin', '/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route)) && !isPublicRoute;

  const token = request.cookies.get('auth-token')?.value;

  let isAuthenticated = false;
  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
      isAuthenticated = true;
    } catch (error) {
    }
  }

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/login' && isAuthenticated) {
    const adminUrl = new URL('/admin', request.url);
    return NextResponse.redirect(adminUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
