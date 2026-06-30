'use client';

import { useState, useEffect } from 'react';
import type { CV } from '@/types';
import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  Plus,
  Trash2,
  Loader2,
  Save,
} from '@/lib/icons';

interface CVFormProps {
  initialData?: CV;
  title: string;
  onTitleChange: (title: string) => void;
  onSubmit: (data: CV) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel: string;
  cancelLabel: string;
  error?: string;
  t: (key: string) => string;
}

const emptyCV: CV = {
  personalInfo: {
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
};

export default function CVForm({
  initialData,
  title,
  onTitleChange,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
  cancelLabel,
  error,
  t,
}: CVFormProps) {
  const [cv, setCV] = useState<CV>(() => ({
    ...emptyCV,
    ...initialData,
    personalInfo: {
      ...emptyCV.personalInfo,
      ...initialData?.personalInfo,
    },
  }));

  // Keep form in sync when switching from parsed upload data
  useEffect(() => {
    if (initialData) {
      setCV({
        ...emptyCV,
        ...initialData,
        personalInfo: {
          ...emptyCV.personalInfo,
          ...initialData.personalInfo,
        },
      });
    }
  }, [initialData]);

  const updatePersonalInfo = (field: keyof CV['personalInfo'], value: string) => {
    setCV((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const updateSummary = (value: string) => {
    setCV((prev) => ({ ...prev, summary: value }));
  };

  // Experience helpers
  const addExperience = () => {
    setCV((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
          achievements: [''],
        },
      ],
    }));
  };

  const updateExperience = (
    index: number,
    field: keyof CV['experience'][number],
    value: string | boolean | string[]
  ) => {
    setCV((prev) => ({
      ...prev,
      experience: prev.experience.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeExperience = (index: number) => {
    setCV((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const updateAchievements = (expIndex: number, rawValue: string) => {
    const achievements = rawValue
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    updateExperience(expIndex, 'achievements', achievements);
  };

  // Education helpers
  const addEducation = () => {
    setCV((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          degree: '',
          institution: '',
          location: '',
          graduationDate: '',
          gpa: '',
          description: '',
        },
      ],
    }));
  };

  const updateEducation = (
    index: number,
    field: keyof CV['education'][number],
    value: string
  ) => {
    setCV((prev) => ({
      ...prev,
      education: prev.education.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeEducation = (index: number) => {
    setCV((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  // Skills helpers
  const addSkillCategory = () => {
    setCV((prev) => ({
      ...prev,
      skills: [...prev.skills, { category: '', items: [] }],
    }));
  };

  const updateSkillCategory = (
    index: number,
    field: 'category' | 'items',
    value: string
  ) => {
    setCV((prev) => ({
      ...prev,
      skills: prev.skills.map((skill, i) => {
        if (i !== index) return skill;
        if (field === 'items') {
          const items = value
            .split(/[\n,]/)
            .map((item) => item.trim())
            .filter(Boolean);
          return { ...skill, items };
        }
        return { ...skill, [field]: value };
      }),
    }));
  };

  const removeSkillCategory = (index: number) => {
    setCV((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(cv);
  };

  const SectionHeader = ({
    icon: Icon,
    label,
  }: {
    icon: React.ElementType;
    label: string;
  }) => (
    <div className="mb-4 flex flex-wrap items-center gap-2 border-b-2 border-primary/20 pb-2">
      <Icon className="h-5 w-5 shrink-0 text-primary" />
      <h3 className="break-words font-display text-lg font-bold">{label}</h3>
    </div>
  );

  const tc = (key: string) => t(`cvForm.${key}`);

  const inputClass =
    'w-full border-2 border-foreground/20 bg-background px-4 py-3 font-body text-sm transition-all focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10';

  const labelClass =
    'block break-words font-body text-xs font-bold uppercase tracking-wider';

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Title */}
      <div className="space-y-3">
        <label htmlFor="cv-title" className={labelClass}>
          {t('form.title')}
        </label>
        <input
          id="cv-title"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={t('form.titlePlaceholder')}
          className={inputClass}
          required
        />
      </div>

      {/* Personal Info */}
      <section>
        <SectionHeader icon={User} label={tc('sections.personalInfo')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="pi-name" className={labelClass}>
              {tc('fields.name')} *
            </label>
            <input
              id="pi-name"
              type="text"
              value={cv.personalInfo.name}
              onChange={(e) => updatePersonalInfo('name', e.target.value)}
              placeholder={tc('placeholders.name')}
              className={inputClass}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="pi-email" className={labelClass}>
              {tc('fields.email')} *
            </label>
            <input
              id="pi-email"
              type="email"
              value={cv.personalInfo.email}
              onChange={(e) => updatePersonalInfo('email', e.target.value)}
              placeholder={tc('placeholders.email')}
              className={inputClass}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="pi-phone" className={labelClass}>
              {tc('fields.phone')}
            </label>
            <input
              id="pi-phone"
              type="text"
              value={cv.personalInfo.phone}
              onChange={(e) => updatePersonalInfo('phone', e.target.value)}
              placeholder={tc('placeholders.phone')}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="pi-location" className={labelClass}>
              {tc('fields.location')}
            </label>
            <input
              id="pi-location"
              type="text"
              value={cv.personalInfo.location}
              onChange={(e) => updatePersonalInfo('location', e.target.value)}
              placeholder={tc('placeholders.location')}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="pi-linkedin" className={labelClass}>
              {tc('fields.linkedin')}
            </label>
            <input
              id="pi-linkedin"
              type="url"
              value={cv.personalInfo.linkedin}
              onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
              placeholder={tc('placeholders.linkedin')}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="pi-website" className={labelClass}>
              {tc('fields.website')}
            </label>
            <input
              id="pi-website"
              type="url"
              value={cv.personalInfo.website}
              onChange={(e) => updatePersonalInfo('website', e.target.value)}
              placeholder={tc('placeholders.website')}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Summary */}
      <section>
        <SectionHeader icon={User} label={tc('sections.summary')} />
        <textarea
          value={cv.summary || ''}
          onChange={(e) => updateSummary(e.target.value)}
          placeholder={tc('placeholders.summary')}
          rows={4}
          className={inputClass}
        />
      </section>

      {/* Experience */}
      <section>
        <SectionHeader icon={Briefcase} label={tc('sections.experience')} />
        <div className="space-y-6">
          {cv.experience.map((exp, index) => (
            <div
              key={index}
              className="relative border-2 border-foreground/10 bg-muted/20 p-4"
            >
              <button
                type="button"
                onClick={() => removeExperience(index)}
                className="absolute right-2 top-2 p-2 text-muted-foreground transition-colors hover:text-red-500"
                aria-label={tc('actions.removeExperience')}
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className={labelClass}>{tc('fields.jobTitle')} *</label>
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) =>
                      updateExperience(index, 'title', e.target.value)
                    }
                    placeholder={tc('placeholders.jobTitle')}
                    className={inputClass}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>{tc('fields.company')} *</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) =>
                      updateExperience(index, 'company', e.target.value)
                    }
                    placeholder={tc('placeholders.company')}
                    className={inputClass}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>{tc('fields.location')}</label>
                  <input
                    type="text"
                    value={exp.location}
                    onChange={(e) =>
                      updateExperience(index, 'location', e.target.value)
                    }
                    placeholder={tc('placeholders.workLocation')}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>{tc('fields.startDate')} *</label>
                  <input
                    type="text"
                    value={exp.startDate}
                    onChange={(e) =>
                      updateExperience(index, 'startDate', e.target.value)
                    }
                    placeholder={tc('placeholders.startDate')}
                    className={inputClass}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>{tc('fields.endDate')}</label>
                  <input
                    type="text"
                    value={exp.endDate}
                    onChange={(e) =>
                      updateExperience(index, 'endDate', e.target.value)
                    }
                    placeholder={tc('placeholders.endDate')}
                    className={inputClass}
                    disabled={exp.current}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id={`exp-current-${index}`}
                    type="checkbox"
                    checked={exp.current || false}
                    onChange={(e) =>
                      updateExperience(index, 'current', e.target.checked)
                    }
                    className="h-5 w-5 accent-primary"
                  />
                  <label
                    htmlFor={`exp-current-${index}`}
                    className="font-body text-sm"
                  >
                    {tc('fields.current')}
                  </label>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className={labelClass}>{tc('fields.description')}</label>
                  <textarea
                    value={exp.description || ''}
                    onChange={(e) =>
                      updateExperience(index, 'description', e.target.value)
                    }
                    placeholder={tc('placeholders.jobDescription')}
                    rows={3}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className={labelClass}>{tc('fields.achievements')}</label>
                  <textarea
                    value={(exp.achievements || []).join('\n')}
                    onChange={(e) => updateAchievements(index, e.target.value)}
                    placeholder={tc('placeholders.achievements')}
                    rows={3}
                    className={inputClass}
                  />
                  <p className="font-body text-xs text-muted-foreground">
                    {tc('hints.onePerLine')}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addExperience}
            className="inline-flex items-center gap-2 border-2 border-dashed border-foreground/20 px-4 py-3 font-body text-xs font-bold uppercase tracking-wider transition-colors hover:border-primary hover:bg-primary/5"
          >
            <Plus className="h-4 w-4" />
            {tc('actions.addExperience')}
          </button>
        </div>
      </section>

      {/* Education */}
      <section>
        <SectionHeader icon={GraduationCap} label={tc('sections.education')} />
        <div className="space-y-6">
          {cv.education.map((edu, index) => (
            <div
              key={index}
              className="relative border-2 border-foreground/10 bg-muted/20 p-4"
            >
              <button
                type="button"
                onClick={() => removeEducation(index)}
                className="absolute right-2 top-2 p-2 text-muted-foreground transition-colors hover:text-red-500"
                aria-label={tc('actions.removeEducation')}
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className={labelClass}>{tc('fields.degree')} *</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) =>
                      updateEducation(index, 'degree', e.target.value)
                    }
                    placeholder={tc('placeholders.degree')}
                    className={inputClass}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>{tc('fields.institution')} *</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) =>
                      updateEducation(index, 'institution', e.target.value)
                    }
                    placeholder={tc('placeholders.institution')}
                    className={inputClass}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>{tc('fields.location')}</label>
                  <input
                    type="text"
                    value={edu.location}
                    onChange={(e) =>
                      updateEducation(index, 'location', e.target.value)
                    }
                    placeholder={tc('placeholders.schoolLocation')}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>{tc('fields.graduationDate')} *</label>
                  <input
                    type="text"
                    value={edu.graduationDate}
                    onChange={(e) =>
                      updateEducation(index, 'graduationDate', e.target.value)
                    }
                    placeholder={tc('placeholders.graduationDate')}
                    className={inputClass}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>{tc('fields.gpa')}</label>
                  <input
                    type="text"
                    value={edu.gpa}
                    onChange={(e) =>
                      updateEducation(index, 'gpa', e.target.value)
                    }
                    placeholder={tc('placeholders.gpa')}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className={labelClass}>{tc('fields.description')}</label>
                  <textarea
                    value={edu.description || ''}
                    onChange={(e) =>
                      updateEducation(index, 'description', e.target.value)
                    }
                    placeholder={tc('placeholders.educationDescription')}
                    rows={3}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addEducation}
            className="inline-flex items-center gap-2 border-2 border-dashed border-foreground/20 px-4 py-3 font-body text-xs font-bold uppercase tracking-wider transition-colors hover:border-primary hover:bg-primary/5"
          >
            <Plus className="h-4 w-4" />
            {tc('actions.addEducation')}
          </button>
        </div>
      </section>

      {/* Skills */}
      <section>
        <SectionHeader icon={Wrench} label={tc('sections.skills')} />
        <div className="space-y-6">
          {cv.skills.map((skill, index) => (
            <div
              key={index}
              className="relative border-2 border-foreground/10 bg-muted/20 p-4"
            >
              <button
                type="button"
                onClick={() => removeSkillCategory(index)}
                className="absolute right-2 top-2 p-2 text-muted-foreground transition-colors hover:text-red-500"
                aria-label={tc('actions.removeSkillCategory')}
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className={labelClass}>{tc('fields.category')} *</label>
                  <input
                    type="text"
                    value={skill.category}
                    onChange={(e) =>
                      updateSkillCategory(index, 'category', e.target.value)
                    }
                    placeholder={tc('placeholders.skillCategory')}
                    className={inputClass}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>{tc('fields.skills')} *</label>
                  <textarea
                    value={skill.items.join('\n')}
                    onChange={(e) =>
                      updateSkillCategory(index, 'items', e.target.value)
                    }
                    placeholder={tc('placeholders.skills')}
                    rows={3}
                    className={inputClass}
                    required
                  />
                  <p className="font-body text-xs text-muted-foreground">
                    {tc('hints.onePerLineOrComma')}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addSkillCategory}
            className="inline-flex items-center gap-2 border-2 border-dashed border-foreground/20 px-4 py-3 font-body text-xs font-bold uppercase tracking-wider transition-colors hover:border-primary hover:bg-primary/5"
          >
            <Plus className="h-4 w-4" />
            {tc('actions.addSkillCategory')}
          </button>
        </div>
      </section>

      {error && (
        <div className="relative animate-scale-in overflow-hidden border-2 border-red-500/50 bg-red-50 p-6 dark:bg-red-950/30">
          <div className="absolute left-0 top-0 h-full w-2 bg-red-500" />
          <p className="pl-4 font-body text-sm text-red-800 dark:text-red-200">
            {error}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4 pt-4 sm:flex-row">
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative inline-flex h-14 flex-1 items-center justify-center gap-2 overflow-hidden bg-primary px-8 font-body text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t('form.saving')}
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              {submitLabel}
            </>
          )}
          <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary-foreground/50 transition-all duration-500 group-hover:w-full" />
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex h-14 items-center justify-center border-2 border-foreground/20 bg-background px-8 font-body text-xs font-bold uppercase tracking-wider shadow-sm transition-all duration-300 hover:border-primary hover:bg-primary/5 disabled:opacity-50"
        >
          {cancelLabel}
        </button>
      </div>
    </form>
  );
}
