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

// API routes that require authentication
const protectedApiRoutes = [
  '/api/cv',
  '/api/application',
  '/api/auth/logout',
  '/api/auth/logout-all',
  '/api/auth/change-password',
  '/api/auth/2fa',
  '/api/auth/delete-account',
  '/api/auth/session',
];

// Create i18n middleware
const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip i18n middleware for API routes
  const isApiRoute = pathname.startsWith('/api');
  
  // First, handle i18n for non-API routes
  const intlResponse = isApiRoute ? NextResponse.next() : intlMiddleware(request);

  // Get session token from cookie
  const sessionToken = request.cookies.get('session-token')?.value;
  const hasSessionToken = !!sessionToken;

  // Check if route is public (no locale prefix check needed for /api routes)
  const isHomePage = new RegExp(`^/(${routing.locales.join('|')})?$`).test(
    pathname
  );
  const isPublicRoute =
    publicRoutes.some((route) => pathname.includes(route)) || isHomePage;
  const isAuthRoute = authRoutes.some((route) => pathname.includes(route));
  const isProtectedApiRoute = protectedApiRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect authenticated users away from auth pages
  if (hasSessionToken && isAuthRoute) {
    const url = request.nextUrl.clone();
    // Preserve locale in redirect
    const locale = pathname.split('/')[1];
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  // Protect API routes - let the API routes themselves validate the session
  // We just check if a token exists here
  if (isProtectedApiRoute && !hasSessionToken) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Protect page routes (redirect to login)
  if (!isPublicRoute && !hasSessionToken && !pathname.startsWith('/api')) {
    const url = request.nextUrl.clone();
    // Preserve locale in redirect
    const locale = pathname.split('/')[1];
    url.pathname = `/${locale}/login`;
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return intlResponse;
}

export const config = {
  // Match all pathnames except static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
