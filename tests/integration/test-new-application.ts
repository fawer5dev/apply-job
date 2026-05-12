/**
 * Test del flujo completo de New Application
 * Simula el proceso que hace la interfaz de usuario
 *
 * Flujo:
 * 1. Obtener los CVs del usuario
 * 2. Analizar la oferta de trabajo (crear Job Listing)
 * 3. Generar la aplicación (CV personalizado + Cover Letter)
 *
 * Ejecutar: npx tsx scripts/test-new-application.ts
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { prisma } from '../src/lib/db/prisma';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function printSection(title: string) {
  console.log('\n');
  log('═'.repeat(70), 'cyan');
  log(`  ${title}`, 'bright');
  log('═'.repeat(70), 'cyan');
}

function printSubSection(title: string) {
  console.log('');
  log(`─── ${title}`, 'blue');
}

async function testNewApplicationFlow() {
  const startTime = Date.now();

  log('\n🚀 INICIANDO TEST DEL FLUJO NEW APPLICATION', 'bright');
  log('Simulando el proceso completo que hace la UI\n', 'yellow');

  let baseCVId: string;
  let jobListingId: string;
  let applicationId: string;
  let userId = 'temp-user';

  try {
    // ====================================================
    // PASO 1: OBTENER CVs DEL USUARIO
    // ====================================================
    printSection('PASO 1: OBTENER CVs DEL USUARIO');

    log('📋 Buscando CVs existentes del usuario...', 'blue');
    const baseCVs = await prisma.baseCV.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        personalInfo: true,
        createdAt: true,
      },
    });

    if (baseCVs.length === 0) {
      log('❌ No se encontraron CVs para el usuario', 'red');
      log(
        '💡 Ejecuta primero: npx tsx scripts/test-complete-cv-flow.ts',
        'yellow'
      );
      log(
        '   O sube un CV desde: http://localhost:3000/en/test-upload\n',
        'yellow'
      );
      return;
    }

    log(`✅ Se encontraron ${baseCVs.length} CV(s)`, 'green');
    baseCVs.forEach((cv, index) => {
      const personalInfo = cv.personalInfo as any;
      log(
        `   ${index + 1}. ${cv.title} - ${personalInfo.name || 'Sin nombre'}`
      );
    });

    // Usar el primer CV encontrado
    baseCVId = baseCVs[0].id;
    log(`\n✅ Usando CV: ${baseCVs[0].title} (ID: ${baseCVId})`, 'green');

    // ====================================================
    // PASO 2: ANALIZAR OFERTA DE TRABAJO
    // ====================================================
    printSection('PASO 2: ANALIZAR OFERTA DE TRABAJO');

    const jobData = {
      title: 'Senior Full Stack Developer',
      company: 'Tech Innovations Inc.',
      location: 'Remote',
      workMode: 'remote',
      salary: '$120,000 - $150,000',
      description: `
We are looking for a Senior Full Stack Developer to join our innovative team.

About the Role:
- Design and develop scalable web applications using React, Next.js, and Node.js
- Work with PostgreSQL and modern databases
- Collaborate with cross-functional teams
- Mentor junior developers
- Implement best practices and code reviews

Requirements:
- 5+ years of experience in full stack development
- Strong proficiency in React, TypeScript, and Node.js
- Experience with PostgreSQL, Prisma ORM
- Familiarity with cloud platforms (AWS, GCP, or Azure)
- Excellent problem-solving and communication skills
- Experience with Agile methodologies

Nice to Have:
- Experience with AI/ML integrations
- Knowledge of DevOps practices (Docker, CI/CD)
- Open source contributions
- Experience with modern UI frameworks (Tailwind CSS, shadcn/ui)

Benefits:
- Competitive salary and equity
- Remote-first culture
- Health insurance
- Professional development budget
- Latest tech equipment
      `,
      url: 'https://example.com/jobs/senior-fullstack-developer',
    };

    log('💼 Datos de la oferta:', 'blue');
    log(`   Puesto: ${jobData.title}`);
    log(`   Empresa: ${jobData.company}`);
    log(`   Ubicación: ${jobData.location}`);
    log(`   Modalidad: ${jobData.workMode}`);
    log(`   Salario: ${jobData.salary}`);

    log('\n🤖 Analizando oferta con IA (10-20 segundos)...', 'blue');
    const analyzeStartTime = Date.now();

    // Importar la función de análisis
    const { analyzeJobDescription } =
      await import('../src/lib/ai/job-analyzer');

    const analyzedJob = await analyzeJobDescription(
      jobData.description,
      jobData.title,
      jobData.company
    );

    const analyzeDuration = ((Date.now() - analyzeStartTime) / 1000).toFixed(2);
    log(`✅ Análisis completado en ${analyzeDuration}s`, 'green');

    // Crear Job Listing en la base de datos
    log('\n💾 Guardando Job Listing en la base de datos...', 'blue');
    const jobListing = await prisma.jobListing.create({
      data: {
        title: jobData.title,
        company: jobData.company,
        location: jobData.location,
        workMode: jobData.workMode,
        salary: jobData.salary,
        description: jobData.description,
        requirements: analyzedJob.requirements as never,
        keywords: analyzedJob.keywords as never,
        url: jobData.url,
        source: 'Manual - Test',
      },
    });

    jobListingId = jobListing.id;
    log(`✅ Job Listing creado con ID: ${jobListingId}`, 'green');

    printSubSection('Análisis del Job:');
    log(`   Keywords técnicas: ${analyzedJob.keywords.technical.length}`);
    log(`   Keywords soft: ${analyzedJob.keywords.soft.length}`);
    log(`   Requisitos: ${analyzedJob.requirements.length}`);

    if (analyzedJob.keywords.technical.length > 0) {
      log(`\n   Top 5 keywords técnicas:`, 'cyan');
      analyzedJob.keywords.technical.slice(0, 5).forEach((kw: string) => {
        log(`     • ${kw}`, 'cyan');
      });
    }

    // ====================================================
    // PASO 3: GENERAR APLICACIÓN
    // ====================================================
    printSection('PASO 3: GENERAR APLICACIÓN CON IA');

    log(
      '🤖 Generando CV personalizado y Cover Letter (20-40 segundos)...',
      'blue'
    );
    log('   → Obteniendo datos del CV base...', 'cyan');

    // Obtener el CV base completo
    const baseCV = await prisma.baseCV.findUnique({
      where: { id: baseCVId },
    });

    if (!baseCV) {
      throw new Error('CV base no encontrado');
    }

    log('   → Preparando datos para generación...', 'cyan');

    // Preparar datos en formato correcto
    const cvData = {
      personalInfo: baseCV.personalInfo as any,
      summary: baseCV.summary || undefined,
      experience: baseCV.experience as any,
      education: baseCV.education as any,
      skills: baseCV.skills as any,
      projects: (baseCV.projects as any) || undefined,
      certifications: (baseCV.certifications as any) || undefined,
    };

    const jobDataForGeneration = {
      title: jobListing.title,
      company: jobListing.company,
      location: jobListing.location || undefined,
      workMode: jobListing.workMode as 'remote' | 'hybrid' | 'onsite',
      salary: jobListing.salary || undefined,
      description: jobListing.description,
      keywords: jobListing.keywords as any,
      requirements: jobListing.requirements as any,
      url: jobListing.url || undefined,
      source: jobListing.source || undefined,
    };

    const genStartTime = Date.now();

    log('   → Generando CV personalizado...', 'cyan');
    log('   → Generando Cover Letter...', 'cyan');

    // Importar funciones de generación
    const { generateCustomCV } = await import('../src/lib/ai/cv-generator');
    const { generateCoverLetter } =
      await import('../src/lib/ai/cover-letter-generator');

    // Generar ambos documentos en paralelo
    const [customCV, coverLetter] = await Promise.all([
      generateCustomCV(cvData, jobDataForGeneration),
      generateCoverLetter(cvData, jobDataForGeneration, 'professional'),
    ]);

    const genDuration = ((Date.now() - genStartTime) / 1000).toFixed(2);
    log(`✅ Documentos generados en ${genDuration}s`, 'green');

    // Crear Cover Letter en DB
    log('\n💾 Guardando Cover Letter...', 'blue');
    const coverLetterRecord = await prisma.coverLetter.create({
      data: {
        userId: userId,
        content: coverLetter.content,
        htmlContent: coverLetter.htmlContent || null,
        tone: 'professional',
      },
    });
    log(`✅ Cover Letter guardada con ID: ${coverLetterRecord.id}`, 'green');

    // Crear Application
    log('💾 Guardando Application...', 'blue');
    const application = await prisma.application.create({
      data: {
        userId: userId,
        baseCVId: baseCVId,
        jobListingId: jobListingId,
        customCV: customCV as never,
        atsScore: customCV.atsOptimizations?.matchScore || null,
        atsAnalysis: {
          keywordsAdded: customCV.atsOptimizations?.keywordsAdded || [],
          sectionsReordered: customCV.atsOptimizations?.sectionsReordered || [],
        } as never,
        matchScore: customCV.atsOptimizations?.matchScore || null,
        status: 'DRAFT',
        coverLetterId: coverLetterRecord.id,
      },
    });

    applicationId = application.id;
    log(`✅ Application creada con ID: ${applicationId}`, 'green');

    // ====================================================
    // RESULTADOS FINALES
    // ====================================================
    printSection('✨ RESULTADOS DEL TEST');

    printSubSection('IDs Generados:');
    log(`   Base CV ID:        ${baseCVId}`);
    log(`   Job Listing ID:    ${jobListingId}`);
    log(`   Cover Letter ID:   ${coverLetterRecord.id}`);
    log(`   Application ID:    ${applicationId}`);

    printSubSection('Información del Job:');
    log(`   Puesto:            ${jobListing.title}`);
    log(`   Empresa:           ${jobListing.company}`);
    log(`   Ubicación:         ${jobListing.location}`);

    printSubSection('ATS Score y Match:');
    const atsColor =
      application.atsScore && application.atsScore > 80 ? 'green' : 'yellow';
    log(
      `   ATS Score:         ${application.atsScore?.toFixed(1) || 'N/A'}%`,
      atsColor
    );
    log(
      `   Match Score:       ${application.matchScore?.toFixed(1) || 'N/A'}%`,
      atsColor
    );

    if (customCV.atsOptimizations) {
      printSubSection('Optimizaciones ATS:');
      log(
        `   Keywords añadidas:    ${customCV.atsOptimizations.keywordsAdded?.length || 0}`
      );
      if (
        customCV.atsOptimizations.keywordsAdded &&
        customCV.atsOptimizations.keywordsAdded.length > 0
      ) {
        const topKeywords = customCV.atsOptimizations.keywordsAdded.slice(0, 5);
        log(`   • ${topKeywords.join(', ')}`, 'cyan');
      }
      log(
        `   Secciones reordenadas: ${customCV.atsOptimizations.sectionsReordered?.length || 0}`
      );
    }

    printSubSection('Cover Letter Preview:');
    const coverPreview = coverLetter.content.substring(0, 250);
    log(`   ${coverPreview}...`, 'cyan');

    printSubSection('Tiempos de Procesamiento:');
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`   Análisis Job:      ${analyzeDuration}s`);
    log(`   Generar docs:      ${genDuration}s`);
    log(`   Tiempo total:      ${totalTime}s`);

    printSubSection('URLs para ver resultados:');
    log(
      `   Dashboard:         http://localhost:3000/en/dashboard/applications`,
      'cyan'
    );
    log(
      `   Esta aplicación:   http://localhost:3000/en/dashboard/applications/${applicationId}`,
      'cyan'
    );

    printSection('🎉 TEST COMPLETADO EXITOSAMENTE');
    log('El flujo de New Application funcionó correctamente\n', 'green');
    log(
      '💡 Los datos de prueba se mantuvieron en la base de datos para que puedas verlos en la UI',
      'yellow'
    );
    log('   Para eliminarlos manualmente, ejecuta:', 'yellow');
    log(`   DELETE FROM applications WHERE id = '${applicationId}';`, 'yellow');
    log(
      `   DELETE FROM job_listings WHERE id = '${jobListingId}';\n`,
      'yellow'
    );

    return {
      baseCVId,
      jobListingId,
      applicationId,
      atsScore: application.atsScore,
      matchScore: application.matchScore,
    };
  } catch (error) {
    printSection('❌ ERROR EN EL TEST');
    log(error instanceof Error ? error.message : String(error), 'red');
    if (error instanceof Error && error.stack) {
      console.log('\nStack trace:');
      console.log(error.stack);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
    log('✓ Conexión a DB cerrada\n', 'yellow');
  }
}

// Ejecutar el test
if (require.main === module) {
  testNewApplicationFlow()
    .then(() => {
      log('✅ Test completado exitosamente!', 'green');
      process.exit(0);
    })
    .catch((error) => {
      log(`❌ El test falló: ${error.message}`, 'red');
      process.exit(1);
    });
}

export { testNewApplicationFlow };
