import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateSession } from './session';
// Use pragmatic any here to avoid mismatches between generated Prisma types
// across different build environments. This keeps the build stable; we can
// reintroduce stricter types once the @prisma/client generation is consistent
// in CI/production.
interface AuthResult {
  users: any;
  session: any;
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
 * Require authentication in API routes
 * Derives the user ID ONLY from a valid session cookie. We intentionally do
 * NOT trust client-supplied `x-user-id` headers to prevent header spoofing.
 */
export async function requireAuthApi(): Promise<string> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    throw new Error('Unauthorized');
  }

  const validation = await validateSession(sessionToken);
  if (!validation.valid || !validation.session) {
    throw new Error('Unauthorized');
  }

  // Cast to any to avoid cross-file Prisma type mismatches during CI builds.
  return (validation.session as any).userId;
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
