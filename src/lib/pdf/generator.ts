import puppeteer from 'puppeteer';
import type { CV, Experience } from '@/types';

export async function generateCVPDF(
  cv: CV,
  template: string = 'modern'
): Promise<Buffer> {
  const html = renderCVTemplate(cv, template);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '12mm',
        right: '15mm',
        bottom: '12mm',
        left: '15mm',
      },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

// Helper function: Generate dynamic subtitle from experience
function generateSubtitle(experience: Experience[]): string {
  const roles = experience.map((exp) => {
    const title = exp.title.toLowerCase();
    if (title.includes('it support') || title.includes('support officer')) {
      return 'IT Support';
    }
    if (title.includes('qa') || title.includes('automation')) {
      return 'QA Automation';
    }
    if (
      title.includes('developer') ||
      title.includes('development') ||
      title.includes('analyst')
    ) {
      return 'Software Development';
    }
    return exp.title;
  });

  const uniqueRoles = [...new Set(roles)];
  return uniqueRoles.slice(0, 3).join(' | ');
}

function renderCVTemplate(cv: CV, template: string): string {
  // Generate dynamic subtitle
  const subtitle = generateSubtitle(cv.experience);

  // Prepare skills as inline text with bullet separator
  const technicalSkills =
    cv.skills.find((s) => s.category === 'Technical Skills')?.items.join(' • ') ||
    '';

  const softSkills =
    cv.skills.find((s) => s.category === 'Soft Skills')?.items.join(' • ') || '';

  // Limit experience bullets to 3 max (for 1-page fit)
  const experienceItems = cv.experience.map((exp) => ({
    ...exp,
    achievements: exp.achievements.slice(0, 3),
  }));

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cv.personalInfo.name} - CV</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      font-size: 9pt;
      line-height: 1.3;
      color: #000000;
      background: #FFFFFF;
    }
    
    .container {
      max-width: 180mm;
      margin: 0 auto;
      padding: 0;
    }
    
    /* ========== HEADER ========== */
    header {
      text-align: center;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 2px solid #000000;
    }
    
    h1 {
      font-size: 26pt;
      font-weight: bold;
      color: #000000;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    
    .subtitle {
      font-size: 9.5pt;
      color: #000000;
      margin-bottom: 3px;
    }
    
    .contact {
      font-size: 9pt;
      color: #000000;
    }
    
    /* ========== SECTIONS ========== */
    section {
      margin-bottom: 8px;
      page-break-inside: avoid;
    }
    
    h2 {
      font-size: 11pt;
      font-weight: bold;
      color: #000000;
      text-transform: uppercase;
      margin-top: 8px;
      margin-bottom: 4px;
      padding-bottom: 2px;
      border-bottom: 2px solid #000000;
      letter-spacing: 0.5px;
    }
    
    h3 {
      font-size: 10pt;
      font-weight: bold;
      color: #000000;
      margin-bottom: 2px;
    }
    
    p {
      margin-bottom: 3px;
      color: #000000;
    }
    
    /* ========== SUMMARY ========== */
    .summary p {
      font-size: 9pt;
      line-height: 1.3;
      text-align: justify;
    }
    
    /* ========== SKILLS ========== */
    .skills {
      margin-bottom: 8px;
    }
    
    .skill-group {
      margin-bottom: 4px;
    }
    
    .skill-group h3 {
      font-size: 10pt;
      font-weight: bold;
      color: #000000;
      margin-bottom: 3px;
    }
    
    .skill-group p {
      font-size: 8.5pt;
      line-height: 1.3;
      color: #000000;
    }
    
    /* ========== EXPERIENCE ========== */
    .job {
      margin-bottom: 6px;
      page-break-inside: avoid;
    }
    
    .job h3 {
      font-size: 10.5pt;
      font-weight: bold;
      color: #000000;
      margin-bottom: 2px;
    }
    
    .company {
      font-size: 9.5pt;
      color: #000000;
      margin-bottom: 2px;
    }
    
    .dates {
      font-size: 9pt;
      color: #666666;
      margin-bottom: 3px;
      font-style: italic;
    }
    
    ul {
      margin-left: 12px;
      margin-top: 3px;
      list-style-type: disc;
    }
    
    li {
      font-size: 8.5pt;
      line-height: 1.25;
      color: #000000;
      margin-bottom: 1px;
    }
    
    /* ========== EDUCATION ========== */
    .degree {
      margin-bottom: 5px;
      page-break-inside: avoid;
    }
    
    .degree-name {
      font-size: 10pt;
      font-weight: bold;
      color: #000000;
      margin-bottom: 2px;
    }
    
    .institution {
      font-size: 9.5pt;
      color: #000000;
      margin-bottom: 2px;
    }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- HEADER -->
    <header>
      <h1>${cv.personalInfo.name}</h1>
      <p class="subtitle">${subtitle}</p>
      <p class="contact">
        ${cv.personalInfo.email}${cv.personalInfo.linkedin ? ` • ${cv.personalInfo.linkedin}` : ''}${cv.personalInfo.location ? ` • ${cv.personalInfo.location}` : ''}
      </p>
    </header>
    
    <!-- SUMMARY -->
    ${
      cv.summary
        ? `
    <section class="summary">
      <h2>Summary</h2>
      <p>${cv.summary}</p>
    </section>
    `
        : ''
    }
    
    <!-- SKILLS -->
    ${
      technicalSkills || softSkills
        ? `
    <section class="skills">
      <h2>Skills</h2>
      ${
        technicalSkills
          ? `
      <div class="skill-group">
        <h3>Technical Skills</h3>
        <p>${technicalSkills}</p>
      </div>
      `
          : ''
      }
      ${
        softSkills
          ? `
      <div class="skill-group">
        <h3>Soft Skills</h3>
        <p>${softSkills}</p>
      </div>
      `
          : ''
      }
    </section>
    `
        : ''
    }
    
    <!-- EXPERIENCE -->
    ${
      cv.experience && cv.experience.length > 0
        ? `
    <section class="experience">
      <h2>Experience</h2>
      ${experienceItems
        .map(
          (exp) => `
      <div class="job">
        <h3>${exp.title}</h3>
        <p class="company">${exp.company}${exp.location ? ` | ${exp.location}` : ''}</p>
        <p class="dates">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || 'Present'}</p>
        ${
          exp.achievements && exp.achievements.length > 0
            ? `
        <ul>
          ${exp.achievements.map((achievement) => `<li>${achievement}</li>`).join('')}
        </ul>
        `
            : ''
        }
      </div>
      `
        )
        .join('')}
    </section>
    `
        : ''
    }
    
    <!-- EDUCATION -->
    ${
      cv.education && cv.education.length > 0
        ? `
    <section class="education">
      <h2>Education</h2>
      ${cv.education
        .map(
          (edu) => `
      <div class="degree">
        <p class="degree-name">${edu.degree}</p>
        <p class="institution">${edu.institution}${edu.location ? ` | ${edu.location}` : ''}</p>
        <p class="dates">${edu.graduationDate}</p>
        ${edu.gpa ? `<p class="gpa" style="font-size: 9pt; margin-top: 2px;">GPA: ${edu.gpa}</p>` : ''}
        ${edu.description ? `<p class="description" style="font-size: 9pt; margin-top: 3px; line-height: 1.3;">${edu.description}</p>` : ''}
      </div>
      `
        )
        .join('')}
    </section>
    `
        : ''
    }
    
    <!-- PROJECTS (if any) -->
    ${
      cv.projects && cv.projects.length > 0
        ? `
    <section class="projects">
      <h2>Projects</h2>
      ${cv.projects
        .map(
          (project) => `
      <div class="job">
        <h3>${project.name}</h3>
        <p style="margin-top: 3px; margin-bottom: 6px; font-size: 9pt;">${project.description}</p>
        ${project.url ? `<p style="font-size: 9pt; color: #2563eb; margin-bottom: 3px;">${project.url}</p>` : ''}
        <p style="font-size: 9pt;"><strong>Technologies:</strong> ${project.technologies.join(' • ')}</p>
      </div>
      `
        )
        .join('')}
    </section>
    `
        : ''
    }
    
    <!-- CERTIFICATIONS (if any) -->
    ${
      cv.certifications && cv.certifications.length > 0
        ? `
    <section class="certifications">
      <h2>Certifications</h2>
      ${cv.certifications
        .map(
          (cert) => `
      <div class="degree">
        <p class="degree-name">${cert.name}</p>
        <p class="institution">${cert.issuer}</p>
        <p class="dates">${cert.date}</p>
        ${cert.url ? `<p style="font-size: 9pt; color: #2563eb;">${cert.url}</p>` : ''}
      </div>
      `
        )
        .join('')}
    </section>
    `
        : ''
    }
    
  </div>
</body>
</html>
  `;
}

export async function generateCoverLetterPDF(
  content: string,
  htmlContent?: string,
  candidateName?: string
): Promise<Buffer> {
  const html = htmlContent || renderCoverLetterTemplate(content, candidateName);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '25mm',
        right: '20mm',
        bottom: '25mm',
        left: '20mm',
      },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

// Helper function to format cover letter content with proper styling
function formatCoverLetterContent(content: string): string {
  // Split by paragraphs (double newline)
  const paragraphs = content.split('\n\n').filter((p) => p.trim());

  let html = '';

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i].trim();

    // Detect if this is the signature block
    if (
      para.toLowerCase().includes('best regards') ||
      para.toLowerCase().includes('sincerely')
    ) {
      // Separate the closing from the name
      const lines = para.split('\n').filter((l) => l.trim());
      html += `<p class="signature">${lines[0]}</p>`;
      if (lines.length > 1) {
        html += `<p class="signature-name">${lines.slice(1).join('<br>')}</p>`;
      }
    } else {
      // Regular paragraph
      html += `<p>${para.replace(/\n/g, '<br>')}</p>`;
    }
  }

  return html;
}

function renderCoverLetterTemplate(content: string, candidateName?: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cover Letter - ${candidateName || 'Cover Letter'}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      /* Libre Baskerville from Google Fonts with fallbacks */
      font-family: 'Libre Baskerville', 'Baskerville', 'Georgia', serif;
      font-size: 12pt;
      line-height: 1.7;
      color: #1a1a1a;
      background: #FFFFFF;
      max-width: 170mm;
      margin: 0 auto;
      padding: 0;
    }
    
    p {
      margin-bottom: 18px;
      text-align: justify;
      text-justify: inter-word;
      color: #1a1a1a;
    }
    
    /* Style for the greeting (first paragraph) */
    p:first-child {
      margin-bottom: 20px;
      font-weight: 500;
    }
    
    /* Style for the signature closing */
    .signature {
      margin-top: 24px;
      margin-bottom: 8px;
      text-align: left;
      font-weight: 400;
    }
    
    /* Style for the name in signature */
    .signature-name {
      margin-top: 8px;
      font-weight: 700;
      color: #000000;
    }
  </style>
</head>
<body>
  ${formatCoverLetterContent(content)}
</body>
</html>
  `;
}
