'use client';

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { FileText, Sparkles, BarChart3, ArrowRight, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Stats {
  base_cvs: number;
  applications: number;
  inProgress: number;
  responseRate: string;
}

function StatSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5 animate-pulse">
      <div className="h-7 w-12 rounded bg-muted" />
      <div className="mt-2 h-3 w-20 rounded bg-muted" />
    </div>
  );
}

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const [stats, setStats] = useState<Stats>({
    base_cvs: 0,
    applications: 0,
    inProgress: 0,
    responseRate: '-',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const cvResponse = await fetch('/api/cv/upload?userId=temp-user');
        if (!cvResponse.ok) throw new Error('Failed to fetch CVs');
        const cvData = await cvResponse.json();
        const base_cvsCount = cvData.base_cvs?.length || 0;

        const appResponse = await fetch(
          '/api/application/create?userId=temp-user'
        );
        if (!appResponse.ok) throw new Error('Failed to fetch applications');
        const appData = await appResponse.json();
        const applications = appData.applications || [];
        const applicationsCount = applications.length;

        const inProgressCount = applications.filter((app: any) => {
          const status = app.status;
          return (
            status === 'DRAFT' ||
            status === 'READY' ||
            status === 'APPLIED' ||
            status === 'INTERVIEWING'
          );
        }).length;

        const appliedCount = applications.filter(
          (app: any) => app.status === 'APPLIED' || app.appliedAt
        ).length;
        const respondedCount = applications.filter((app: any) => {
          const status = app.status;
          return (
            status === 'INTERVIEWING' ||
            status === 'OFFERED' ||
            status === 'REJECTED' ||
            status === 'ACCEPTED'
          );
        }).length;

        const responseRate =
          appliedCount > 0
            ? `${Math.round((respondedCount / appliedCount) * 100)}%`
            : '-';

        setStats({
          base_cvs: base_cvsCount,
          applications: applicationsCount,
          inProgress: inProgressCount,
          responseRate,
        });
      } catch (err) {
        setError(t('errorLoading'));
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [t]);

  const actions = [
    {
      icon: FileText,
      title: t('cards.createCV.title'),
      description: t('cards.createCV.description'),
      href: '/dashboard/cv/new',
    },
    {
      icon: Sparkles,
      title: t('cards.newApplication.title'),
      description: t('cards.newApplication.description'),
      href: '/dashboard/applications/new',
    },
    {
      icon: BarChart3,
      title: t('cards.viewApplications.title'),
      description: t('cards.viewApplications.description'),
      href: '/dashboard/applications',
    },
  ];

  const statItems = [
    { label: t('stats.baseCVs'), value: stats.base_cvs },
    { label: t('stats.applications'), value: stats.applications },
    { label: t('stats.inProgress'), value: stats.inProgress },
    { label: t('stats.responseRate'), value: stats.responseRate },
  ];

  return (
    <div className="container py-8 sm:py-12 lg:py-16">
      <div className="flex flex-col gap-8 sm:gap-12">
        <div className="space-y-2">
          <h1 className="text-xl font-medium">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
            : statItems.map((stat, index) => (
                <div
                  key={index}
                  className="rounded-xl border bg-card p-4 sm:p-5"
                >
                  <div className="text-2xl font-medium">{stat.value}</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                href={action.href}
                className="group rounded-xl border bg-card p-5 transition-colors hover:border-primary/30 hover:bg-accent/50 sm:p-6"
              >
                <div className="space-y-3">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">{action.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    <span>{t('startArrow')}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
