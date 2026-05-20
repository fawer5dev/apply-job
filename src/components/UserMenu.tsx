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
import { LogOut, Monitor, Smartphone, Clock } from 'lucide-react';

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
  const [open, setOpen] = useState(false);

  // Fetch sessions when dropdown opens
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

  // Get user initials for avatar
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

  // Format relative time
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
          className="flex items-center gap-3 transition-all hover:opacity-80"
          onClick={() => setOpen(!open)}
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {getInitials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left lg:block">
            <p className="font-body text-sm font-bold">
              {user.name || user.email}
            </p>
            <p className="font-body text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        {/* User info */}
        <div className="px-4 py-3">
          <p className="font-body text-sm font-bold">{user.name || user.email}</p>
          <p className="font-body text-xs text-muted-foreground">
            {user.email}
          </p>
        </div>

        <DropdownMenuSeparator />

        {/* Sessions info */}
        <DropdownMenuLabel>{t('activeSessions')}</DropdownMenuLabel>
        <div className="max-h-48 overflow-y-auto px-4 py-2">
          {sessionsLoading ? (
            <p className="py-2 text-center font-body text-xs text-muted-foreground">
              {t('loadingSessions')}
            </p>
          ) : sessions.length > 0 ? (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-start gap-3 rounded border p-2 ${
                    session.isCurrent
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-foreground/10'
                  }`}
                >
                  <div className="mt-0.5 text-muted-foreground">
                    {session.deviceType === 'Mobile' ? (
                      <Smartphone className="h-4 w-4" />
                    ) : (
                      <Monitor className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="font-body text-xs font-bold">
                        {session.browser} • {session.deviceType}
                      </p>
                      {session.isCurrent && (
                        <span className="rounded bg-primary px-1.5 py-0.5 font-body text-[10px] font-bold uppercase text-primary-foreground">
                          {t('currentDevice')}
                        </span>
                      )}
                    </div>
                    <p className="flex items-center gap-1 font-body text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(session.lastActivityAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-2 text-center font-body text-xs text-muted-foreground">
              {t('noSessions')}
            </p>
          )}
        </div>

        {sessions.length > 0 && (
          <div className="px-4 py-2">
            <p className="font-body text-xs text-muted-foreground">
              {t('sessionCount', { count: sessions.length })}
            </p>
          </div>
        )}

        <DropdownMenuSeparator />

        {/* Logout actions */}
        <DropdownMenuItem onClick={handleLogout}>
          <div className="flex items-center gap-3">
            <LogOut className="h-4 w-4" />
            <span className="font-body text-sm">{t('logout')}</span>
          </div>
        </DropdownMenuItem>

        {sessions.length > 1 && (
          <DropdownMenuItem onClick={handleLogoutAll} destructive>
            <div className="flex items-center gap-3">
              <LogOut className="h-4 w-4" />
              <span className="font-body text-sm">{t('logoutAll')}</span>
            </div>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
