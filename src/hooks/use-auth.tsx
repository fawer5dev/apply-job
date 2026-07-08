'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';

interface User {
  id: string;
  email: string;
  name: string | null;
  emailVerified: Date | null;
  twoFactorEnabled: boolean;
  isActive: boolean;
  accountType?: 'FREE' | 'PROFESSIONAL';
  applicationsUsed?: number;
}

interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  lastActivityAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  deviceId: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

interface LoginResult {
  success: boolean;
  requires2FA?: boolean;
  tempToken?: string;
  error?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch current session on mount
  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/session');

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setSession(data.session);
      } else {
        // No active session
        setUser(null);
        setSession(null);
      }
    } catch (err) {
      console.error('Failed to fetch session:', err);
      setError('Failed to fetch session');
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<LoginResult> => {
    try {
      setError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requires2FA) {
          // Return temp token for 2FA verification
          return {
            success: true,
            requires2FA: true,
            tempToken: data.tempToken,
          };
        }

        // Successful login without 2FA
        setUser(data.user);
        await fetchSession();

        return { success: true };
      } else {
        setError(data.error || 'Login failed');
        return {
          success: false,
          error: data.error || 'Login failed',
        };
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = 'An error occurred during login';
      setError(errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    }
  };

  const register = async (
    email: string,
    password: string,
    name?: string
  ): Promise<void> => {
    try {
      setError(null);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Registration successful - user needs to verify email
    } catch (err) {
      const error = err as Error;
      console.error('Registration error:', error);
      setError(error.message);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setError(null);

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        setUser(null);
        setSession(null);
        router.push('/');
      } else {
        throw new Error('Logout failed');
      }
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout');
      throw err;
    }
  };

  const logoutAll = async (): Promise<void> => {
    try {
      setError(null);

      const response = await fetch('/api/auth/logout-all', {
        method: 'POST',
      });

      if (response.ok) {
        setUser(null);
        setSession(null);
        router.push('/');
      } else {
        throw new Error('Logout all failed');
      }
    } catch (err) {
      console.error('Logout all error:', err);
      setError('Failed to logout from all devices');
      throw err;
    }
  };

  const refreshSession = async (): Promise<void> => {
    await fetchSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        error,
        login,
        register,
        logout,
        logoutAll,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper hook for protected routes
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  return { user, loading };
}
