'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import {
  FileText,
  Loader2,
  ArrowRight,
  Calendar,
  Mail,
  Globe,
  Trash2,
} from '@/lib/icons';

interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

interface Experience {
  title?: string;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  achievements?: string[];
}

interface Education {
  degree?: string;
  institution?: string;
  location?: string;
  graduationDate?: string;
  gpa?: string;
  description?: string;
}

interface Project {
  name?: string;
  description?: string;
  technologies?: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
}

interface Certification {
  name?: string;
  issuer?: string;
  date?: string;
  url?: string;
}

interface BaseCV {
  id: string;
  title: string;
  personalInfo: PersonalInfo;
  summary?: string;
  experience?: Experience[];
  education?: Education[];
  skills?: { category?: string; items?: string[] }[];
  projects?: Project[];
  certifications?: Certification[];
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
}

export default function ViewCVPage() {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations('ViewCV');
  const router = useRouter();
  const [cv, setCV] = useState<BaseCV | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCV();
    }
  }, [id]);

  const fetchCV = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cv/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch CV');
      }

      setCV(data.cv);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading CV');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('confirmDelete'))) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/cv/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        // Show specific error message if CV is being used in applications
        if (data.applicationsCount && data.applicationsCount > 0) {
          throw new Error(
            `Cannot delete this CV. It is being used in ${data.applicationsCount} application(s). Please delete those applications first.`
          );
        }
        throw new Error(data.error || 'Failed to delete CV');
      }

      router.push('/dashboard/cv');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error deleting CV';
      setError(errorMessage);
      alert(errorMessage);
      setDeleting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="font-body text-sm uppercase tracking-wider text-muted-foreground">
            {t('loading')}
          </p>
        </div>
      </div>
    );
  }

  if (error || !cv) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-primary/5">
        <header className="sticky top-0 z-50 w-full border-b-2 border-foreground/10 bg-background/80 backdrop-blur-xl">
          <div className="container flex h-16 items-center">
            <Link
              href="/dashboard/cv"
              className="group flex items-center space-x-2 transition-transform hover:scale-105"
            >
              <span className="font-display text-xl font-bold tracking-tight transition-colors group-hover:text-primary">
                ← {t('backToCVs')}
              </span>
            </Link>
          </div>
        </header>
        <main className="container flex flex-1 items-center justify-center py-12">
          <div className="relative animate-scale-in overflow-hidden border-2 border-red-500/50 bg-red-50 p-8 dark:bg-red-950/30">
            <div className="absolute left-0 top-0 h-full w-2 bg-red-500" />
            <p className="pl-4 font-body text-sm text-red-800 dark:text-red-200">
              {error || t('notFound')}
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <header className="sticky top-0 z-50 w-full border-b-2 border-foreground/10 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link
            href="/dashboard/cv"
            className="group flex items-center space-x-2 transition-transform hover:scale-105"
          >
            <span className="font-display text-xl font-bold tracking-tight transition-colors group-hover:text-primary">
              ← {t('backToCVs')}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/applications/new?cvId=${cv.id}`}
              className="group flex items-center gap-2 bg-primary px-6 py-3 font-body text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              {t('createApplication')}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 border-2 border-red-500/20 bg-red-50 px-6 py-3 font-body text-xs font-bold uppercase tracking-wider text-red-600 transition-all duration-300 hover:border-red-500 hover:bg-red-500 hover:text-white disabled:opacity-50 dark:bg-red-950/30"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('deleting')}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  {t('delete')}
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="container flex-1 py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          {/* CV Header */}
          <div className="mb-12 animate-fade-in-up">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-4 flex items-center gap-3">
                  <span className="inline-block border-b-2 border-primary pb-1 font-body text-xs font-bold uppercase tracking-widest text-primary">
                    Base CV
                  </span>
                  {cv.isDefault && (
                    <span className="border border-primary/30 bg-primary/10 px-2 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-primary">
                      {t('default')}
                    </span>
                  )}
                </div>
                <h1 className="mb-4 font-display text-5xl font-bold tracking-tight md:text-6xl">
                  {cv.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-body uppercase tracking-wider">
                      {t('created')} {formatDate(cv.createdAt)}
                    </span>
                  </div>
                  {cv.updatedAt !== cv.createdAt && (
                    <div className="flex items-center gap-2">
                      <span className="font-body uppercase tracking-wider">
                        {t('updated')} {formatDate(cv.updatedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          {cv.personalInfo && (
            <section
              className="mb-8 animate-fade-in-up border-2 border-foreground/10 bg-card p-8"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="mb-6 border-b-2 border-primary pb-2">
                <h2 className="font-display text-2xl font-bold">
                  {t('sections.personalInfo')}
                </h2>
              </div>
              <div className="space-y-3">
                {cv.personalInfo.name && (
                  <div className="font-body text-lg font-bold">
                    {cv.personalInfo.name}
                  </div>
                )}
                {cv.personalInfo.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <a
                      href={`mailto:${cv.personalInfo.email}`}
                      className="font-body text-sm hover:text-primary"
                    >
                      {cv.personalInfo.email}
                    </a>
                  </div>
                )}
                {cv.personalInfo.phone && (
                  <div className="font-body text-sm text-muted-foreground">
                    {cv.personalInfo.phone}
                  </div>
                )}
                {cv.personalInfo.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span className="font-body text-sm">
                      {cv.personalInfo.location}
                    </span>
                  </div>
                )}
                {(cv.personalInfo.linkedin ||
                  cv.personalInfo.github ||
                  cv.personalInfo.website) && (
                  <div className="flex flex-wrap gap-4 pt-2">
                    {cv.personalInfo.linkedin && (
                      <a
                        href={cv.personalInfo.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-body text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                      >
                        LinkedIn
                      </a>
                    )}
                    {cv.personalInfo.github && (
                      <a
                        href={cv.personalInfo.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-body text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                      >
                        GitHub
                      </a>
                    )}
                    {cv.personalInfo.website && (
                      <a
                        href={cv.personalInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-body text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                      >
                        Website
                      </a>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Summary */}
          {cv.summary && (
            <section
              className="mb-8 animate-fade-in-up border-2 border-foreground/10 bg-card p-8"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="mb-6 border-b-2 border-primary pb-2">
                <h2 className="font-display text-2xl font-bold">
                  {t('sections.summary')}
                </h2>
              </div>
              <p className="font-body leading-relaxed text-muted-foreground">
                {cv.summary}
              </p>
            </section>
          )}

          {/* Experience */}
          {cv.experience && cv.experience.length > 0 && (
            <section
              className="mb-8 animate-fade-in-up border-2 border-foreground/10 bg-card p-8"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="mb-6 border-b-2 border-primary pb-2">
                <h2 className="font-display text-2xl font-bold">
                  {t('sections.experience')}
                </h2>
              </div>
              <div className="space-y-6">
                {cv.experience.map((exp, index) => (
                  <div
                    key={index}
                    className="border-l-2 border-primary/30 pl-6"
                  >
                    <h3 className="font-display text-xl font-bold">
                      {exp.title}
                    </h3>
                    <p className="mb-2 font-body text-sm font-bold text-primary">
                      {exp.company}
                      {exp.location && ` • ${exp.location}`}
                    </p>
                    <p className="mb-3 font-body text-xs uppercase tracking-wider text-muted-foreground">
                      {exp.startDate} -{' '}
                      {exp.current ? t('present') : exp.endDate}
                    </p>
                    {exp.description && (
                      <p className="mb-3 font-body text-sm leading-relaxed text-muted-foreground">
                        {exp.description}
                      </p>
                    )}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="list-inside list-disc space-y-1 font-body text-sm text-muted-foreground">
                        {exp.achievements.map((achievement, i) => (
                          <li key={i}>{achievement}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {cv.education && cv.education.length > 0 && (
            <section
              className="mb-8 animate-fade-in-up border-2 border-foreground/10 bg-card p-8"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="mb-6 border-b-2 border-primary pb-2">
                <h2 className="font-display text-2xl font-bold">
                  {t('sections.education')}
                </h2>
              </div>
              <div className="space-y-6">
                {cv.education.map((edu, index) => (
                  <div
                    key={index}
                    className="border-l-2 border-primary/30 pl-6"
                  >
                    <h3 className="font-display text-xl font-bold">
                      {edu.degree}
                    </h3>
                    <p className="mb-2 font-body text-sm font-bold text-primary">
                      {edu.institution}
                      {edu.location && ` • ${edu.location}`}
                    </p>
                    <p className="mb-3 font-body text-xs uppercase tracking-wider text-muted-foreground">
                      {edu.graduationDate}
                      {edu.gpa && ` • GPA: ${edu.gpa}`}
                    </p>
                    {edu.description && (
                      <p className="font-body text-sm leading-relaxed text-muted-foreground">
                        {edu.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {cv.skills && cv.skills.some((skillGroup) => skillGroup.items && skillGroup.items.length > 0) && (
            <section
              className="mb-8 animate-fade-in-up border-2 border-foreground/10 bg-card p-8"
              style={{ animationDelay: '0.5s' }}
            >
              <div className="mb-6 border-b-2 border-primary pb-2">
                <h2 className="font-display text-2xl font-bold">
                  {t('sections.skills')}
                </h2>
              </div>
              <div className="space-y-4">
                {cv.skills
                  .filter((skillGroup) => skillGroup.items && skillGroup.items.length > 0)
                  .map((skillGroup, index) => (
                    <div key={index}>
                      {skillGroup.category && (
                        <h3 className="mb-2 font-body text-sm font-bold uppercase tracking-wider text-primary">
                          {skillGroup.category}
                        </h3>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {skillGroup.items?.map((skill, i) => (
                          <span
                            key={i}
                            className="border border-foreground/20 bg-muted/50 px-3 py-1 font-body text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {cv.projects && cv.projects.length > 0 && (
            <section
              className="mb-8 animate-fade-in-up border-2 border-foreground/10 bg-card p-8"
              style={{ animationDelay: '0.6s' }}
            >
              <div className="mb-6 border-b-2 border-primary pb-2">
                <h2 className="font-display text-2xl font-bold">
                  {t('sections.projects')}
                </h2>
              </div>
              <div className="space-y-6">
                {cv.projects.map((project, index) => (
                  <div
                    key={index}
                    className="border-l-2 border-primary/30 pl-6"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="font-display text-xl font-bold">
                        {project.name}
                      </h3>
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-body text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                        >
                          {t('viewProject')}
                        </a>
                      )}
                    </div>
                    {(project.startDate || project.endDate) && (
                      <p className="mb-3 font-body text-xs uppercase tracking-wider text-muted-foreground">
                        {project.startDate} - {project.endDate || t('present')}
                      </p>
                    )}
                    {project.description && (
                      <p className="mb-3 font-body text-sm leading-relaxed text-muted-foreground">
                        {project.description}
                      </p>
                    )}
                    {project.technologies &&
                      project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech, i) => (
                            <span
                              key={i}
                              className="border border-primary/30 bg-primary/5 px-2 py-1 font-body text-xs text-primary"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {cv.certifications && cv.certifications.length > 0 && (
            <section
              className="mb-8 animate-fade-in-up border-2 border-foreground/10 bg-card p-8"
              style={{ animationDelay: '0.7s' }}
            >
              <div className="mb-6 border-b-2 border-primary pb-2">
                <h2 className="font-display text-2xl font-bold">
                  {t('sections.certifications')}
                </h2>
              </div>
              <div className="space-y-4">
                {cv.certifications.map((cert, index) => (
                  <div
                    key={index}
                    className="border-l-2 border-primary/30 pl-6"
                  >
                    <div className="mb-1 flex items-start justify-between">
                      <h3 className="font-display text-lg font-bold">
                        {cert.name}
                      </h3>
                      {cert.url && (
                        <a
                          href={cert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-body text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                        >
                          {t('verify')}
                        </a>
                      )}
                    </div>
                    <p className="font-body text-sm text-muted-foreground">
                      {cert.issuer}
                      {cert.date && ` • ${cert.date}`}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
