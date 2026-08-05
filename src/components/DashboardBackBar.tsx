'use client';

import { Link } from '@/i18n/routing';

interface DashboardBackBarProps {
  label: string;
}

export default function DashboardBackBar({ label }: DashboardBackBarProps) {
  return (
    <div className="sticky top-16 z-40 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="container flex h-14 items-center">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <span className="shrink-0">&larr;</span>
          {label}
        </Link>
      </div>
    </div>
  );
}
