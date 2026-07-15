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

interface CountryCode {
  code: string;
  country: string;
}

const countryCodes: CountryCode[] = [
  { code: '+1', country: 'United States / Canada' },
  { code: '+44', country: 'United Kingdom' },
  { code: '+61', country: 'Australia' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  { code: '+34', country: 'Spain' },
  { code: '+39', country: 'Italy' },
  { code: '+31', country: 'Netherlands' },
  { code: '+46', country: 'Sweden' },
  { code: '+47', country: 'Norway' },
  { code: '+45', country: 'Denmark' },
  { code: '+358', country: 'Finland' },
  { code: '+41', country: 'Switzerland' },
  { code: '+43', country: 'Austria' },
  { code: '+32', country: 'Belgium' },
  { code: '+351', country: 'Portugal' },
  { code: '+353', country: 'Ireland' },
  { code: '+48', country: 'Poland' },
  { code: '+420', country: 'Czech Republic' },
  { code: '+36', country: 'Hungary' },
  { code: '+30', country: 'Greece' },
  { code: '+90', country: 'Turkey' },
  { code: '+7', country: 'Russia' },
  { code: '+380', country: 'Ukraine' },
  { code: '+55', country: 'Brazil' },
  { code: '+52', country: 'Mexico' },
  { code: '+54', country: 'Argentina' },
  { code: '+56', country: 'Chile' },
  { code: '+57', country: 'Colombia' },
  { code: '+51', country: 'Peru' },
  { code: '+58', country: 'Venezuela' },
  { code: '+91', country: 'India' },
  { code: '+86', country: 'China' },
  { code: '+81', country: 'Japan' },
  { code: '+82', country: 'South Korea' },
  { code: '+65', country: 'Singapore' },
  { code: '+62', country: 'Indonesia' },
  { code: '+60', country: 'Malaysia' },
  { code: '+63', country: 'Philippines' },
  { code: '+84', country: 'Vietnam' },
  { code: '+66', country: 'Thailand' },
  { code: '+27', country: 'South Africa' },
  { code: '+20', country: 'Egypt' },
  { code: '+971', country: 'United Arab Emirates' },
  { code: '+966', country: 'Saudi Arabia' },
  { code: '+972', country: 'Israel' },
  { code: '+964', country: 'Iraq' },
  { code: '+98', country: 'Iran' },
  { code: '+963', country: 'Syria' },
  { code: '+961', country: 'Lebanon' },
  { code: '+218', country: 'Libya' },
  { code: '+212', country: 'Morocco' },
  { code: '+216', country: 'Tunisia' },
  { code: '+249', country: 'Sudan' },
  { code: '+254', country: 'Kenya' },
  { code: '+255', country: 'Tanzania' },
  { code: '+234', country: 'Nigeria' },
  { code: '+233', country: 'Ghana' },
  { code: '+256', country: 'Uganda' },
  { code: '+243', country: 'DR Congo' },
  { code: '+225', country: 'Ivory Coast' },
  { code: '+221', country: 'Senegal' },
  { code: '+223', country: 'Mali' },
  { code: '+227', country: 'Niger' },
  { code: '+228', country: 'Togo' },
  { code: '+229', country: 'Benin' },
  { code: '+240', country: 'Equatorial Guinea' },
  { code: '+241', country: 'Gabon' },
  { code: '+242', country: 'Republic of the Congo' },
  { code: '+244', country: 'Angola' },
  { code: '+258', country: 'Mozambique' },
  { code: '+260', country: 'Zambia' },
  { code: '+263', country: 'Zimbabwe' },
  { code: '+267', country: 'Botswana' },
  { code: '+268', country: 'Eswatini' },
  { code: '+269', country: 'Comoros' },
  { code: '+290', country: 'Saint Helena' },
  { code: '+291', country: 'Eritrea' },
  { code: '+297', country: 'Aruba' },
  { code: '+298', country: 'Faroe Islands' },
  { code: '+299', country: 'Greenland' },
  { code: '+350', country: 'Gibraltar' },
  { code: '+352', country: 'Luxembourg' },
  { code: '+354', country: 'Iceland' },
  { code: '+355', country: 'Albania' },
  { code: '+356', country: 'Malta' },
  { code: '+357', country: 'Cyprus' },
  { code: '+359', country: 'Bulgaria' },
  { code: '+370', country: 'Lithuania' },
  { code: '+371', country: 'Latvia' },
  { code: '+372', country: 'Estonia' },
  { code: '+373', country: 'Moldova' },
  { code: '+374', country: 'Armenia' },
  { code: '+375', country: 'Belarus' },
  { code: '+376', country: 'Andorra' },
  { code: '+377', country: 'Monaco' },
  { code: '+378', country: 'San Marino' },
  { code: '+379', country: 'Vatican City' },
  { code: '+381', country: 'Serbia' },
  { code: '+382', country: 'Montenegro' },
  { code: '+383', country: 'Kosovo' },
  { code: '+385', country: 'Croatia' },
  { code: '+386', country: 'Slovenia' },
  { code: '+387', country: 'Bosnia and Herzegovina' },
  { code: '+389', country: 'North Macedonia' },
  { code: '+500', country: 'Falkland Islands' },
  { code: '+501', country: 'Belize' },
  { code: '+502', country: 'Guatemala' },
  { code: '+503', country: 'El Salvador' },
  { code: '+504', country: 'Honduras' },
  { code: '+505', country: 'Nicaragua' },
  { code: '+506', country: 'Costa Rica' },
  { code: '+507', country: 'Panama' },
  { code: '+508', country: 'Saint Pierre and Miquelon' },
  { code: '+509', country: 'Haiti' },
  { code: '+590', country: 'Guadeloupe' },
  { code: '+591', country: 'Bolivia' },
  { code: '+592', country: 'Guyana' },
  { code: '+593', country: 'Ecuador' },
  { code: '+594', country: 'French Guiana' },
  { code: '+595', country: 'Paraguay' },
  { code: '+596', country: 'Martinique' },
  { code: '+597', country: 'Suriname' },
  { code: '+598', country: 'Uruguay' },
  { code: '+599', country: 'Caribbean Netherlands' },
];

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

function parsePhone(phone?: string): {
  countryCode: string;
  number: string;
  customCode: string;
} {
  if (!phone) return { countryCode: '', number: '', customCode: '' };
  const match = phone.trim().match(/^\+(\d{1,4})\s*(.*)$/);
  if (match) {
    const code = `+${match[1]}`;
    const known = countryCodes.some((c) => c.code === code);
    if (known) {
      return { countryCode: code, number: match[2], customCode: '' };
    }
    return { countryCode: 'other', number: match[2], customCode: code };
  }
  return { countryCode: '', number: phone, customCode: '' };
}

const countryCities: Record<string, string[]> = {
  'Argentina': ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth'],
  'Austria': ['Vienna', 'Graz', 'Linz', 'Salzburg'],
  'Belgium': ['Brussels', 'Antwerp', 'Ghent', 'Liège'],
  'Brazil': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'],
  'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Calgary'],
  'Chile': ['Santiago', 'Valparaíso', 'Concepción', 'La Serena'],
  'China': ['Beijing', 'Shanghai', 'Shenzhen', 'Guangzhou'],
  'Colombia': ['Bogotá', 'Medellín', 'Cali', 'Barranquilla'],
  'Czech Republic': ['Prague', 'Brno', 'Ostrava', 'Plzeň'],
  'Denmark': ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg'],
  'Egypt': ['Cairo', 'Alexandria', 'Giza', 'Sharm El Sheikh'],
  'Finland': ['Helsinki', 'Espoo', 'Tampere', 'Vantaa'],
  'France': ['Paris', 'Lyon', 'Marseille', 'Toulouse'],
  'Germany': ['Berlin', 'Munich', 'Hamburg', 'Cologne'],
  'Greece': ['Athens', 'Thessaloniki', 'Patras', 'Heraklion'],
  'Hungary': ['Budapest', 'Debrecen', 'Szeged', 'Pécs'],
  'India': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad'],
  'Indonesia': ['Jakarta', 'Surabaya', 'Bandung', 'Medan'],
  'Ireland': ['Dublin', 'Cork', 'Galway', 'Limerick'],
  'Israel': ['Tel Aviv', 'Jerusalem', 'Haifa', 'Beersheba'],
  'Italy': ['Rome', 'Milan', 'Naples', 'Turin'],
  'Japan': ['Tokyo', 'Osaka', 'Yokohama', 'Nagoya'],
  'Malaysia': ['Kuala Lumpur', 'George Town', 'Johor Bahru', 'Ipoh'],
  'Mexico': ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla'],
  'Netherlands': ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht'],
  'New Zealand': ['Auckland', 'Wellington', 'Christchurch', 'Hamilton'],
  'Nigeria': ['Lagos', 'Abuja', 'Kano', 'Ibadan'],
  'Norway': ['Oslo', 'Bergen', 'Trondheim', 'Stavanger'],
  'Peru': ['Lima', 'Arequipa', 'Trujillo', 'Cusco'],
  'Philippines': ['Manila', 'Cebu', 'Davao', 'Quezon City'],
  'Poland': ['Warsaw', 'Kraków', 'Łódź', 'Wrocław'],
  'Portugal': ['Lisbon', 'Porto', 'Braga', 'Faro'],
  'Romania': ['Bucharest', 'Cluj-Napoca', 'Timișoara', 'Iași'],
  'Singapore': ['Singapore'],
  'South Africa': ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria'],
  'South Korea': ['Seoul', 'Busan', 'Incheon', 'Daegu'],
  'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Seville'],
  'Sweden': ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala'],
  'Switzerland': ['Zurich', 'Geneva', 'Basel', 'Bern'],
  'Thailand': ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya'],
  'Turkey': ['Istanbul', 'Ankara', 'Izmir', 'Antalya'],
  'Ukraine': ['Kyiv', 'Lviv', 'Odessa', 'Kharkiv'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman'],
  'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Edinburgh'],
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'San Francisco', 'Seattle', 'Miami', 'Boston'],
  'Vietnam': ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Nha Trang'],
};

const countryList = Object.keys(countryCities).sort();

const OTHER_CITY = '__other__';

function parseLocation(location?: string): {
  country: string;
  city: string;
  customCity: string;
} {
  if (!location) return { country: '', city: '', customCity: '' };

  const trimmed = location.trim();

  // Bare country name (e.g. "United States")
  if (countryCities[trimmed]) {
    return { country: trimmed, city: '', customCity: '' };
  }

  const parts = trimmed.split(',').map((part) => part.trim());
  if (parts.length >= 2) {
    const possibleCountry = parts[parts.length - 1];
    if (countryCities[possibleCountry]) {
      const city = parts.slice(0, parts.length - 1).join(', ');
      const knownCities = countryCities[possibleCountry];
      if (knownCities.includes(city)) {
        return { country: possibleCountry, city, customCity: '' };
      }
      return { country: possibleCountry, city: OTHER_CITY, customCity: city };
    }
  }

  // Try matching the whole value as a city
  for (const country of countryList) {
    const cities = countryCities[country];
    if (cities.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      return { country, city: trimmed, customCity: '' };
    }
  }

  return { country: '', city: trimmed, customCity: '' };
}

interface LocationSelectProps {
  value: string;
  onChange: (value: string) => void;
  tc: (key: string) => string;
  inputClass: string;
  idPrefix: string;
}

function buildLocation(
  country: string,
  city: string,
  customCity: string
): string {
  const effectiveCity = city === OTHER_CITY ? customCity : city;
  return effectiveCity ? `${effectiveCity}, ${country}` : country;
}

function LocationSelect({
  value,
  onChange,
  tc,
  inputClass,
  idPrefix,
}: LocationSelectProps) {
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [customCity, setCustomCity] = useState('');

  // Sync internal state from the incoming value (initial load + initialData changes)
  useEffect(() => {
    const parsed = parseLocation(value);
    setCountry(parsed.country);
    setCity(parsed.city);
    setCustomCity(parsed.customCity);
  }, [value]);

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    setCity('');
    setCustomCity('');
    onChange(buildLocation(newCountry, '', ''));
  };

  const handleCityChange = (newCity: string) => {
    const nextCustomCity = newCity === OTHER_CITY ? customCity : '';
    setCity(newCity);
    setCustomCity(nextCustomCity);
    onChange(buildLocation(country, newCity, nextCustomCity));
  };

  const handleCustomCityChange = (newCustomCity: string) => {
    setCustomCity(newCustomCity);
    onChange(buildLocation(country, city, newCustomCity));
  };

  const selectClass = `${inputClass} cursor-pointer appearance-none bg-[right_0.75rem_center] bg-no-repeat pr-10 disabled:cursor-not-allowed disabled:opacity-50`;
  const chevronStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  };

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <select
        id={`${idPrefix}-country`}
        value={country}
        onChange={(e) => handleCountryChange(e.target.value)}
        className={selectClass}
        style={chevronStyle}
      >
        <option value="">{tc('placeholders.country')}</option>
        {countryList.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        id={`${idPrefix}-city`}
        value={city}
        onChange={(e) => handleCityChange(e.target.value)}
        disabled={!country}
        className={selectClass}
        style={chevronStyle}
      >
        <option value="">
          {country ? tc('placeholders.city') : tc('placeholders.selectCountryFirst')}
        </option>
        {(countryCities[country] || []).map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
        <option value={OTHER_CITY}>{tc('fields.cityOther')}</option>
      </select>
      {city === OTHER_CITY && (
        <input
          id={`${idPrefix}-custom-city`}
          type="text"
          value={customCity}
          onChange={(e) => handleCustomCityChange(e.target.value)}
          placeholder={tc('placeholders.customCity')}
          className={`${inputClass} sm:col-span-2`}
        />
      )}
    </div>
  );
}

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

  const [phoneCountryCode, setPhoneCountryCode] = useState(() =>
    parsePhone(initialData?.personalInfo?.phone).countryCode
  );
  const [phoneNumber, setPhoneNumber] = useState(() =>
    parsePhone(initialData?.personalInfo?.phone).number
  );

  const [locationCountry, setLocationCountry] = useState(() =>
    parseLocation(initialData?.personalInfo?.location).country
  );
  const [locationCity, setLocationCity] = useState(() =>
    parseLocation(initialData?.personalInfo?.location).city
  );
  const [locationCustomCity, setLocationCustomCity] = useState(() =>
    parseLocation(initialData?.personalInfo?.location).customCity
  );

  // Raw skill inputs are stored separately so the textarea can accept commas
  // and newlines without immediately reformatting the user's text.
  const [skillInputs, setSkillInputs] = useState<string[]>(() =>
    initialData?.skills?.map((skill) => skill.items.join(', ')) ?? []
  );

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
      const parsedPhone = parsePhone(initialData.personalInfo?.phone);
      setPhoneCountryCode(parsedPhone.countryCode);
      setPhoneNumber(parsedPhone.number);
      const parsedLocation = parseLocation(initialData.personalInfo?.location);
      setLocationCountry(parsedLocation.country);
      setLocationCity(parsedLocation.city);
      setLocationCustomCity(parsedLocation.customCity);
      setSkillInputs(
        initialData.skills?.map((skill) => skill.items.join(', ')) ?? []
      );
    }
  }, [initialData]);

  // Sync the combined phone string into CV state whenever the parts change
  useEffect(() => {
    const fullPhone = phoneCountryCode
      ? `${phoneCountryCode} ${phoneNumber}`.trim()
      : phoneNumber;
    setCV((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, phone: fullPhone },
    }));
  }, [phoneCountryCode, phoneNumber]);

  // Reset city when country changes and the current city is not in the new country
  useEffect(() => {
    if (locationCountry) {
      const cities = countryCities[locationCountry] || [];
      if (!cities.includes(locationCity) && locationCity !== OTHER_CITY) {
        setLocationCity('');
        setLocationCustomCity('');
      }
    }
  }, [locationCountry, locationCity]);

  // Sync the combined location string into CV state whenever the parts change
  useEffect(() => {
    const effectiveCity =
      locationCity === OTHER_CITY ? locationCustomCity : locationCity;
    const fullLocation = effectiveCity
      ? `${effectiveCity}, ${locationCountry}`
      : locationCountry;
    setCV((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, location: fullLocation },
    }));
  }, [locationCountry, locationCity, locationCustomCity]);

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
  const parseSkillItems = (rawValue: string): string[] =>
    rawValue
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);

  const addSkillCategory = () => {
    setCV((prev) => ({
      ...prev,
      skills: [...prev.skills, { category: '', items: [] }],
    }));
    setSkillInputs((prev) => [...prev, '']);
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
          return { ...skill, items: parseSkillItems(value) };
        }
        return { ...skill, [field]: value };
      }),
    }));
  };

  const updateSkillInput = (index: number, rawValue: string) => {
    setSkillInputs((prev) => prev.map((value, i) => (i === index ? rawValue : value)));
    updateSkillCategory(index, 'items', rawValue);
  };

  const removeSkillCategory = (index: number) => {
    setCV((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
    setSkillInputs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullPhone = phoneCountryCode
      ? `${phoneCountryCode} ${phoneNumber}`.trim()
      : phoneNumber;
    const effectiveCity =
      locationCity === OTHER_CITY ? locationCustomCity : locationCity;
    const fullLocation = effectiveCity
      ? `${effectiveCity}, ${locationCountry}`
      : locationCountry;
    onSubmit({
      ...cv,
      personalInfo: {
        ...cv.personalInfo,
        phone: fullPhone,
        location: fullLocation,
      },
      skills: cv.skills.map((skill, i) => ({
        ...skill,
        items: parseSkillItems(skillInputs[i] ?? skill.items.join(', ')),
      })),
    });
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
            <label htmlFor="pi-phone-number" className={labelClass}>
              {tc('fields.phone')}
            </label>
            <div className="flex gap-2">
              <select
                id="pi-phone-country"
                value={phoneCountryCode}
                onChange={(e) => setPhoneCountryCode(e.target.value)}
                className={`${inputClass} min-w-[8rem] cursor-pointer appearance-none bg-[right_0.75rem_center] bg-no-repeat pr-10 sm:min-w-[10rem]`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                }}
                aria-label={tc('fields.phoneCountry')}
              >
                <option value="">{tc('placeholders.phoneCountry')}</option>
                {countryCodes
                  .slice()
                  .sort((a, b) => a.country.localeCompare(b.country))
                  .map(({ code, country }) => (
                    <option key={code} value={code}>
                      {country} ({code})
                    </option>
                  ))}
              </select>
              <input
                id="pi-phone-number"
                type="tel"
                inputMode="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d\s\-]/g, ''))}
                placeholder={tc('placeholders.phoneNumber')}
                className={inputClass}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className={labelClass}>{tc('fields.location')}</label>
            <div className="grid gap-2 sm:grid-cols-2">
              <select
                id="pi-location-country"
                value={locationCountry}
                onChange={(e) => setLocationCountry(e.target.value)}
                className={`${inputClass} cursor-pointer appearance-none bg-[right_0.75rem_center] bg-no-repeat pr-10`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                }}
              >
                <option value="">{tc('placeholders.country')}</option>
                {countryList.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              <select
                id="pi-location-city"
                value={locationCity}
                onChange={(e) => {
                  setLocationCity(e.target.value);
                  if (e.target.value !== OTHER_CITY) {
                    setLocationCustomCity('');
                  }
                }}
                disabled={!locationCountry}
                className={`${inputClass} cursor-pointer appearance-none bg-[right_0.75rem_center] bg-no-repeat pr-10 disabled:cursor-not-allowed disabled:opacity-50`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                }}
              >
                <option value="">
                  {locationCountry
                    ? tc('placeholders.city')
                    : tc('placeholders.selectCountryFirst')}
                </option>
                {(countryCities[locationCountry] || []).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
                <option value={OTHER_CITY}>{tc('fields.cityOther')}</option>
              </select>
              {locationCity === OTHER_CITY && (
                <input
                  id="pi-location-custom-city"
                  type="text"
                  value={locationCustomCity}
                  onChange={(e) => setLocationCustomCity(e.target.value)}
                  placeholder={tc('placeholders.customCity')}
                  className={`${inputClass} sm:col-span-2`}
                />
              )}
            </div>
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
                  <LocationSelect
                    value={exp.location || ''}
                    onChange={(value) => updateExperience(index, 'location', value)}
                    tc={tc}
                    inputClass={inputClass}
                    idPrefix={`exp-${index}-location`}
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
                  <LocationSelect
                    value={edu.location || ''}
                    onChange={(value) => updateEducation(index, 'location', value)}
                    tc={tc}
                    inputClass={inputClass}
                    idPrefix={`edu-${index}-location`}
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
                    value={skillInputs[index] ?? skill.items.join(', ')}
                    onChange={(e) => updateSkillInput(index, e.target.value)}
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
