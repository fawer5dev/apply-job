'use client';

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { FileText, Sparkles, BarChart3, ArrowRight } from '@/lib/icons';
import { useEffect, useState } from 'react';

interface Stats {
  base_cvs: number;
  applications: number;
  inProgress: number;
  responseRate: string;
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        const cvResponse = await fetch('/api/cv/upload?userId=temp-user');
        const cvData = await cvResponse.json();
        const base_cvsCount = cvData.base_cvs?.length || 0;

        const appResponse = await fetch(
          '/api/application/create?userId=temp-user'
        );
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
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
    { label: t('stats.baseCVs'), value: loading ? '...' : stats.base_cvs },
    { label: t('stats.applications'), value: loading ? '...' : stats.applications },
    { label: t('stats.inProgress'), value: loading ? '...' : stats.inProgress },
    { label: t('stats.responseRate'), value: loading ? '...' : stats.responseRate },
  ];

  return (
    <div className="flex flex-col">
      <main className="flex-1">
        <div className="container py-8 sm:py-12 lg:py-16">
          <div className="flex flex-col gap-8 sm:gap-12">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-xl font-medium">{t('title')}</h1>
              <p className="text-sm text-gray-500">{t('subtitle')}</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {statItems.map((stat, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5"
                >
                  <div className="text-2xl font-medium text-gray-900">
                    {stat.value}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Action cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={index}
                    href={action.href}
                    className="group rounded-xl border border-gray-100 bg-white p-5 transition-colors hover:border-blue-100 hover:bg-blue-50/30 sm:p-6"
                  >
                    <div className="space-y-3">
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-100">
                        <Icon className="h-4.5 w-4.5" strokeWidth={2} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {action.title}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {action.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-blue-700 opacity-0 transition-opacity group-hover:opacity-100">
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
      </main>
    </div>
  );
}
