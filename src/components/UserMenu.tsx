'use client';

import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { LogOut, Monitor, Smartphone, Clock, User, X, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface SessionInfo {
  id: string;
  browser: string;
  os: string;
  deviceType: string;
  lastActivityAt: string;
  isCurrent: boolean;
}

export default function UserMenu() {
  const { user, logout, logoutAll, loading } = useAuth();
  const t = useTranslations('UserMenu');
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchSessions();
    }
  }, [open, user]);

  const fetchSessions = async () => {
    try {
      setSessionsLoading(true);
      const response = await fetch('/api/auth/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      setRevokingId(sessionId);
      const response = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setSessions(sessions.filter((s) => s.id !== sessionId));
      }
    } catch (error) {
      console.error('Failed to revoke session:', error);
    } finally {
      setRevokingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAll();
    } catch (error) {
      console.error('Logout all failed:', error);
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t('timeAgo.justNow');
    if (diffMins < 60) return t('timeAgo.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('timeAgo.hoursAgo', { count: diffHours });
    return t('timeAgo.daysAgo', { count: diffDays });
  };

  if (loading || !user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
          onClick={() => setOpen(!open)}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-medium text-blue-700">
            {getInitials(user.name, user.email)}
          </div>
          <div className="hidden text-left lg:block">
            <p className="text-sm font-medium text-gray-900">
              {user.name || user.email}
            </p>
            <p className="text-xs text-gray-500">
              {user.email}
            </p>
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] max-w-xs sm:w-80">
        <div className="px-4 py-3">
          <p className="break-words text-sm font-medium text-gray-900">{user.name || user.email}</p>
          <p className="break-all text-xs text-gray-500">
            {user.email}
          </p>
          {user.accountType === 'PROFESSIONAL' ? (
            <span className="mt-2 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              {t('professionalBadge')}
            </span>
          ) : (
            <span className="mt-2 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
              {t('freeBadge', {
                count: user.applicationCount ?? 0,
                limit: 3,
              })}
            </span>
          )}
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile" className="flex w-full cursor-pointer items-center gap-3">
            <User className="h-4 w-4" />
            <span className="text-sm">{t('editProfile')}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>{t('activeSessions')}</DropdownMenuLabel>
        <div className="max-h-48 overflow-y-auto px-4 py-2">
          {sessionsLoading ? (
            <p className="py-2 text-center text-xs text-gray-500">
              {t('loadingSessions')}
            </p>
          ) : sessions.length > 0 ? (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-start gap-3 rounded-lg border p-2 ${
                    session.isCurrent
                      ? 'border-blue-100 bg-blue-50/50'
                      : 'border-gray-100'
                  }`}
                >
                  <div className="mt-0.5 text-gray-400">
                    {session.deviceType === 'Mobile' ? (
                      <Smartphone className="h-4 w-4" />
                    ) : (
                      <Monitor className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="break-words text-xs font-medium text-gray-900">
                        {session.browser} • {session.deviceType}
                      </p>
                      {session.isCurrent && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                          {t('currentDevice')}
                        </span>
                      )}
                    </div>
                    <p className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span className="break-words">{formatRelativeTime(session.lastActivityAt)}</span>
                    </p>
                  </div>
                  {!session.isCurrent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRevokeSession(session.id);
                      }}
                      disabled={revokingId === session.id}
                      className="text-gray-400 transition-colors hover:text-red-500 disabled:opacity-50"
                      title={t('revokeSession')}
                    >
                      {revokingId === session.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="py-2 text-center text-xs text-gray-500">
              {t('noSessions')}
            </p>
          )}
        </div>

        {sessions.length > 0 && (
          <div className="px-4 py-2">
            <p className="text-xs text-gray-500">
              {t('sessionCount', { count: sessions.length })}
            </p>
          </div>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout}>
          <div className="flex items-center gap-3">
            <LogOut className="h-4 w-4" />
            <span className="text-sm">{t('logout')}</span>
          </div>
        </DropdownMenuItem>

        {sessions.length > 1 && (
          <DropdownMenuItem onClick={handleLogoutAll} destructive>
            <div className="flex items-center gap-3">
              <LogOut className="h-4 w-4" />
              <span className="text-sm">{t('logoutAll')}</span>
            </div>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
