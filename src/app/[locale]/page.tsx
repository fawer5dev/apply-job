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
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Decorative background elements */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/3 translate-x-1/3 transform rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] -translate-x-1/3 translate-y-1/3 transform rounded-full bg-accent/5 blur-3xl" />
      </div>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container relative pb-16 pt-12 md:pb-24 md:pt-20 lg:pb-32 lg:pt-28">
          {/* Language Switcher */}
          <div className="absolute right-6 top-6 z-20 md:right-10 md:top-10">
            <LanguageSwitcher />
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Left column - Main content */}
            <div className="animate-fade-in-up space-y-8 lg:col-span-7">
              <div className="inline-block">
                <span className="inline-flex items-center gap-2 rounded-sm border-2 border-primary/20 bg-primary/5 px-4 py-2 font-body text-sm font-bold uppercase tracking-wide text-primary">
                  Career Tools
                </span>
              </div>

              <h1 className="font-display text-5xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl xl:text-8xl">
                {t('title').split(' ').slice(0, 2).join(' ')}{' '}
                <span className="mt-2 block text-primary">
                  {t('title').split(' ').slice(2).join(' ')}
                </span>
              </h1>

              <p className="max-w-[600px] font-body text-lg leading-relaxed text-muted-foreground md:text-xl">
                {t('subtitle')}
              </p>

              <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="group inline-flex h-14 items-center justify-center gap-2 bg-primary px-8 font-body text-base font-bold uppercase tracking-wide text-primary-foreground shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                >
                  {t('startButton')}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#features"
                  className="group inline-flex h-14 items-center justify-center gap-2 border-2 border-foreground/20 bg-background px-8 font-body text-base font-bold uppercase tracking-wide transition-all duration-300 hover:border-primary hover:bg-primary/5"
                >
                  {t('featuresButton')}
                </Link>
              </div>
            </div>

            {/* Right column - Stats/Visual element */}
            <div
              className="relative animate-fade-in-up lg:col-span-5"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="relative">
                {/* Decorative border frame */}
                <div className="absolute -inset-4 border-2 border-primary/20" />

                <div className="relative space-y-6 border-2 border-foreground/10 bg-card p-8">
                  <div className="space-y-4">
                    <div className="flex items-baseline gap-4">
                      <span className="font-display text-7xl font-bold text-primary">
                        3
                      </span>
                      <div>
                        <p className="font-body text-sm font-bold uppercase tracking-wider">
                          Minutes
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Average time to apply
                        </p>
                      </div>
                    </div>

                    <div className="h-px bg-border" />

                    <div className="flex items-baseline gap-4">
                      <span className="font-display text-7xl font-bold text-primary">
                        2x
                      </span>
                      <div>
                        <p className="font-body text-sm font-bold uppercase tracking-wider">
                          Faster
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Than traditional methods
                        </p>
                      </div>
                    </div>

                    <div className="h-px bg-border" />

                    <div className="flex items-baseline gap-4">
                      <span className="font-display text-7xl font-bold text-primary">
                        ∞
                      </span>
                      <div>
                        <p className="font-body text-sm font-bold uppercase tracking-wider">
                          Applications
                        </p>
                        <p className="text-xs text-muted-foreground">
                          No limits on your potential
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="container relative py-16 md:py-24 lg:py-32"
        >
          {/* Section header */}
          <div className="mb-16 max-w-3xl animate-fade-in-up md:mb-24">
            <span className="mb-4 block font-display text-sm uppercase tracking-widest text-muted-foreground">
              What We Offer
            </span>
            <h2 className="mb-6 font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              {t('featuresTitle')}
            </h2>
            <p className="font-body text-lg leading-relaxed text-muted-foreground md:text-xl">
              {t('featuresSubtitle')}
            </p>
          </div>

          {/* Features grid - asymmetric layout */}
          <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative animate-scale-in transition-all duration-300 hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Feature card */}
                  <div className="relative h-full border-2 border-foreground/10 bg-card p-8 transition-colors duration-300 hover:border-primary/30">
                    {/* Number label */}
                    <span className="absolute right-4 top-4 font-display text-8xl font-bold leading-none text-primary/5">
                      {feature.number}
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
                        <h3 className="font-display text-xl font-bold transition-colors group-hover:text-primary">
                          {feature.title}
                        </h3>
                        <p className="font-body text-sm leading-relaxed text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>

                    {/* Hover accent line */}
                    <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-foreground/10 bg-muted/30 py-8 md:py-12">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="font-body text-sm uppercase tracking-wide text-muted-foreground">
              {t('footer')}
            </p>
            <div className="flex gap-8">
              <span className="font-body text-xs text-muted-foreground">
                Built with precision
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
