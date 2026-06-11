import { headers, cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateSession } from './session';
import type { users, sessions } from '@prisma/client';

interface AuthResult {
  users: users;
  session: sessions;
}

/**
 * Get authenticated user in Server Components
 * Throws error and redirects if not authenticated
 */
export async function requireAuth(): Promise<AuthResult> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session-token')?.value;

  if (!sessionToken) {
    redirect('/login');
  }

  const sessionCheck = await validateSession(sessionToken);

  if (!sessionCheck.valid || !sessionCheck.session) {
    redirect('/login?error=session_expired');
  }

    return {
      users: sessionCheck.session.users,
      session: sessionCheck.session,
    };
}

/**
 * Get authenticated user (optional)
 * Returns null if not authenticated
 */
export async function getAuth(): Promise<AuthResult | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session-token')?.value;

  if (!sessionToken) {
    return null;
  }

  const sessionCheck = await validateSession(sessionToken);

  if (!sessionCheck.valid || !sessionCheck.session) {
    return null;
  }

    return {
      users: sessionCheck.session.users,
      session: sessionCheck.session,
    };
}

/**
 * Get user ID from middleware headers (API routes)
 */
export async function getUserIdFromHeaders(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get('x-user-id');
}

/**
 * Require authentication in API routes
 * Throws error if not authenticated
 */
export async function requireAuthApi(): Promise<string> {
  // Try to get userId from headers first (if middleware set it)
  const userId = await getUserIdFromHeaders();
  console.log('[requireAuthApi] userId from headers:', userId);
  if (userId) {
    return userId;
  }

  // If not in headers, validate session from cookies
  const sessionToken = await getSessionToken();
  console.log('[requireAuthApi] sessionToken:', sessionToken ? 'found' : 'not found');
  if (!sessionToken) {
    throw new Error('Unauthorized');
  }

  const validation = await validateSession(sessionToken);
  console.log('[requireAuthApi] validation:', validation.valid);
  if (!validation.valid || !validation.session) {
    throw new Error('Unauthorized');
  }

  return validation.session.userId;
}

/**
 * Get user email from middleware headers
 */
export async function getUserEmailFromHeaders(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get('x-user-email');
}

/**
 * Check if session should be refreshed
 */
export async function shouldRefreshSession(): Promise<boolean> {
  const headersList = await headers();
  return headersList.get('x-should-refresh-session') === 'true';
}

/**
 * Get session token from cookies
 */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('session-token')?.value || null;
}

/**
 * Set session cookie (use in API routes)
 */
export function setSessionCookie(token: string, expires: Date): string {
  const maxAge = Math.floor((expires.getTime() - Date.now()) / 1000);

  return `session-token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(): string {
  return 'session-token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0';
}
