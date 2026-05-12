import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { FileText, Sparkles, BarChart3, ArrowRight } from '@/lib/icons';

export default function DashboardPage() {
  const t = useTranslations('Dashboard');

  const actions = [
    {
      icon: FileText,
      title: t('cards.createCV.title'),
      description: t('cards.createCV.description'),
      href: '/dashboard/cv/new',
      accent: 'primary',
    },
    {
      icon: Sparkles,
      title: t('cards.newApplication.title'),
      description: t('cards.newApplication.description'),
      href: '/dashboard/applications/new',
      accent: 'accent',
    },
    {
      icon: BarChart3,
      title: t('cards.viewApplications.title'),
      description: t('cards.viewApplications.description'),
      href: '/dashboard/applications',
      accent: 'muted',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header with editorial styling */}
      <header className="sticky top-0 z-50 w-full border-b-2 border-foreground/10 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center">
          <div className="mr-8 flex">
            <Link href="/" className="group flex items-center space-x-3">
              <span className="font-display text-2xl font-bold tracking-tight transition-colors group-hover:text-primary">
                Apply Job
              </span>
            </Link>
          </div>
          <nav className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard/cv"
                className="font-body text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 hover:text-primary"
              >
                {t('nav.myCVs')}
              </Link>
              <Link
                href="/dashboard/applications"
                className="font-body text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 hover:text-primary"
              >
                {t('nav.applications')}
              </Link>
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-12 md:py-16 lg:py-20">
          <div className="flex flex-col gap-12">
            {/* Hero section with asymmetric layout */}
            <div className="grid items-end gap-8 lg:grid-cols-12">
              <div className="animate-fade-in-up space-y-4 lg:col-span-8">
                <div className="mb-2 inline-block">
                  <span className="border-b-2 border-primary pb-1 font-body text-xs font-bold uppercase tracking-widest text-primary">
                    Dashboard
                  </span>
                </div>
                <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight md:text-6xl lg:text-7xl">
                  {t('title')}
                </h1>
                <p className="max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
                  {t('subtitle')}
                </p>
              </div>

              {/* Quick stats sidebar */}
              <div
                className="animate-fade-in-up lg:col-span-4"
                style={{ animationDelay: '0.1s' }}
              >
                <div className="relative border-2 border-foreground/10 bg-card p-6">
                  <div className="absolute left-0 top-0 h-full w-1 bg-primary" />
                  <div className="space-y-4 pl-4">
                    <div>
                      <div className="font-display text-4xl font-bold text-primary">
                        0
                      </div>
                      <p className="mt-1 font-body text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {t('stats.baseCVs')}
                      </p>
                    </div>
                    <div className="h-px bg-border" />
                    <div>
                      <div className="font-display text-4xl font-bold text-primary">
                        0
                      </div>
                      <p className="mt-1 font-body text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {t('stats.applications')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action cards with creative layout */}
            <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={index}
                    href={action.href}
                    className="group relative animate-scale-in transition-all duration-300 hover:scale-[1.02]"
                    style={{ animationDelay: `${index * 0.1 + 0.2}s` }}
                  >
                    {/* Card with layered design */}
                    <div className="relative h-full border-2 border-foreground/10 bg-card p-8 transition-all duration-300 hover:border-primary/50">
                      {/* Background number */}
                      <span className="absolute right-4 top-4 font-display text-7xl font-bold leading-none text-primary/5">
                        0{index + 1}
                      </span>

                      <div className="relative space-y-4">
                        {/* Icon */}
                        <div className="inline-flex border border-primary/20 bg-primary/10 p-3">
                          <Icon
                            className="h-6 w-6 text-primary"
                            strokeWidth={2}
                          />
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                          <h3 className="font-display text-2xl font-bold transition-colors group-hover:text-primary">
                            {action.title}
                          </h3>
                          <p className="font-body text-sm leading-relaxed text-muted-foreground">
                            {action.description}
                          </p>
                        </div>

                        {/* Arrow indicator */}
                        <div className="flex items-center gap-2 pt-2 font-body text-xs font-bold uppercase tracking-wider text-primary">
                          <span className="opacity-0 transition-opacity group-hover:opacity-100">
                            Start
                          </span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>

                      {/* Hover accent */}
                      <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Stats grid with asymmetric sizing */}
            <div
              className="mt-4 grid animate-fade-in-up grid-cols-2 gap-4 lg:grid-cols-4"
              style={{ animationDelay: '0.5s' }}
            >
              <div className="group relative border-2 border-foreground/10 bg-muted/30 p-6 transition-colors hover:border-primary/30">
                <div className="font-display text-3xl font-bold">0</div>
                <p className="mt-2 font-body text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('stats.baseCVs')}
                </p>
                <div className="absolute right-0 top-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-8" />
              </div>

              <div className="group relative border-2 border-foreground/10 bg-muted/30 p-6 transition-colors hover:border-primary/30">
                <div className="font-display text-3xl font-bold">0</div>
                <p className="mt-2 font-body text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('stats.applications')}
                </p>
                <div className="absolute right-0 top-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-8" />
              </div>

              <div className="group relative border-2 border-foreground/10 bg-muted/30 p-6 transition-colors hover:border-primary/30">
                <div className="font-display text-3xl font-bold">0</div>
                <p className="mt-2 font-body text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('stats.inProgress')}
                </p>
                <div className="absolute right-0 top-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-8" />
              </div>

              <div className="group relative border-2 border-foreground/10 bg-muted/30 p-6 transition-colors hover:border-primary/30">
                <div className="font-display text-3xl font-bold">-</div>
                <p className="mt-2 font-body text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('stats.responseRate')}
                </p>
                <div className="absolute right-0 top-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-8" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
