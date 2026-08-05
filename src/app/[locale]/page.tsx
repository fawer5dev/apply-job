import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {
  ArrowRight,
  FileText,
  Target,
  Mail,
  BarChart3,
  ClipboardCheck,
  Zap,
} from 'lucide-react';

export default function HomePage() {
  const t = useTranslations('HomePage');

  const features = [
    {
      icon: FileText,
      title: t('features.customCV.title'),
      description: t('features.customCV.description'),
      number: '01',
    },
    {
      icon: Target,
      title: t('features.atsOptimization.title'),
      description: t('features.atsOptimization.description'),
      number: '02',
    },
    {
      icon: Mail,
      title: t('features.coverLetters.title'),
      description: t('features.coverLetters.description'),
      number: '03',
    },
    {
      icon: BarChart3,
      title: t('features.jobAnalysis.title'),
      description: t('features.jobAnalysis.description'),
      number: '04',
    },
    {
      icon: ClipboardCheck,
      title: t('features.tracking.title'),
      description: t('features.tracking.description'),
      number: '05',
    },
    {
      icon: Zap,
      title: t('features.fastEasy.title'),
      description: t('features.fastEasy.description'),
      number: '06',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container relative pb-16 pt-12 md:pb-24 md:pt-20 lg:pb-32 lg:pt-28">
          <div className="absolute right-6 top-6 z-20 md:right-10 md:top-10">
            <LanguageSwitcher />
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="animate-fade-in-up space-y-6 lg:col-span-7">
              <span className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                {t('badge')}
              </span>

              <h1 className="text-4xl font-medium leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                {t('title').split(' ').slice(0, 2).join(' ')}{' '}
                <span className="mt-2 block text-primary">
                  {t('title').split(' ').slice(2).join(' ')}
                </span>
              </h1>

              <p className="max-w-[600px] text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
                {t('subtitle')}
              </p>

              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {t('startButton')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#features"
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-input bg-background px-6 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {t('featuresButton')}
                </Link>
              </div>
            </div>

            <div
              className="animate-fade-in-up lg:col-span-5"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="space-y-4 rounded-xl border bg-card p-6 sm:p-8">
                <div className="flex flex-wrap items-baseline gap-4">
                  <span className="text-5xl font-medium text-primary sm:text-6xl md:text-7xl">
                    3
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {t('stats.time.title')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('stats.time.description')}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-border" />

                <div className="flex flex-wrap items-baseline gap-4">
                  <span className="text-5xl font-medium text-primary sm:text-6xl md:text-7xl">
                    2x
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {t('stats.faster.title')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('stats.faster.description')}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-border" />

                <div className="flex flex-wrap items-baseline gap-4">
                  <span className="text-5xl font-medium text-primary sm:text-6xl md:text-7xl">
                    ∞
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {t('stats.applications.title')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('stats.applications.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container py-16 md:py-24 lg:py-32">
          <div className="mb-16 max-w-3xl animate-fade-in-up md:mb-24">
            <h2 className="mb-4 text-3xl font-medium leading-tight sm:text-4xl md:text-5xl">
              {t('featuresTitle')}
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t('featuresSubtitle')}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="h-full rounded-xl border bg-card p-6 transition-colors duration-200 hover:border-primary/30 sm:p-8">
                    <div className="space-y-4">
                      <div className="inline-flex rounded-lg border border-primary/20 bg-primary/10 p-3">
                        <Icon
                          className="h-6 w-6 text-primary"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium transition-colors group-hover:text-primary sm:text-xl">
                          {feature.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/30 py-8 md:py-12">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-center text-sm text-muted-foreground md:text-left">
              {t('footer')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
