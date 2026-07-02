import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

// Public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/verify-email',
  '/api/auth/resend-verification',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
];

// Routes that should redirect to dashboard if authenticated
const authRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

// Create i18n middleware
const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Defense in depth: never let clients inject trusted internal headers.
  request.headers.delete('x-user-id');
  request.headers.delete('x-user-email');

  // Skip i18n middleware for API routes
  const isApiRoute = pathname.startsWith('/api');

  // Check if route is public (no locale prefix check needed for /api routes)
  const isHomePage = new RegExp(`^/(${routing.locales.join('|')})?$`).test(
    pathname
  );
  const isPublicRoute =
    publicRoutes.some((route) => pathname.includes(route)) || isHomePage;
  const isAuthRoute = authRoutes.some((route) => pathname.includes(route));

  // Get session token from cookie
  const sessionToken = request.cookies.get('session-token')?.value;
  const hasSessionToken = !!sessionToken;

  // Redirect authenticated users away from auth pages
  if (hasSessionToken && isAuthRoute) {
    const url = request.nextUrl.clone();
    // Preserve locale in redirect
    const locale = pathname.split('/')[1];
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  // Protect page routes (redirect to login). API routes validate their own
  // sessions so we don't block them here with a simple cookie-presence check.
  if (!isPublicRoute && !isApiRoute && !hasSessionToken) {
    const url = request.nextUrl.clone();
    // Preserve locale in redirect
    const locale = pathname.split('/')[1];
    url.pathname = `/${locale}/login`;
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Handle i18n for non-API routes; API routes pass through unchanged.
  return isApiRoute ? NextResponse.next() : intlMiddleware(request);
}

export const config = {
  // Match all pathnames except static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
