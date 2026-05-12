/**
 * Test completo del flujo: Crear Base CV → Crear Job → Generar Application
 *
 * Este script prueba el flujo completo de la aplicación:
 * 1. Cargar y parsear un CV desde el archivo PDF
 * 2. Crear un Base CV en la base de datos
 * 3. Crear una oferta de trabajo (Job Listing)
 * 4. Generar una aplicación personalizada (Application)
 *
 * Ejecutar: npx tsx scripts/test-complete-cv-flow.ts
 */

import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import fs from 'fs';
import { parseCV } from '../src/lib/cv/parser';
import { prisma } from '../src/lib/db/prisma';
import { generateCustomCV } from '../src/lib/ai/cv-generator';
import { generateCoverLetter } from '../src/lib/ai/cover-letter-generator';
import type { CV, JobListing } from '../src/types';

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

async function testCompleteFlow() {
  const startTime = Date.now();

  log('\n🚀 INICIANDO TEST DEL FLUJO COMPLETO DE APLICACIÓN', 'bright');
  log(
    'Este proceso puede tomar 30-60 segundos debido a las llamadas a la IA\n',
    'yellow'
  );

  let baseCVId: string;
  let jobListingId: string;
  let applicationId: string;
  let testUserId: string;

  try {
    // ====================================================
    // PASO 0: CREAR USUARIO DE PRUEBA
    // ====================================================
    printSection('PASO 0: CREAR USUARIO DE PRUEBA');

    log('👤 Creando usuario temporal para el test...', 'blue');
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
      },
    });
    testUserId = testUser.id;
    log(`✅ Usuario de prueba creado con ID: ${testUserId}`, 'green');

    // ====================================================
    // PASO 1: CARGAR Y PARSEAR CV
    // ====================================================
    printSection('PASO 1: CARGAR Y PARSEAR CV');

    const filePath = path.join(process.cwd(), 'files', 'FawerV-CV.pdf');

    if (!fs.existsSync(filePath)) {
      throw new Error('Archivo no encontrado: ' + filePath);
    }

    log('📄 Leyendo archivo PDF...', 'blue');
    const buffer = fs.readFileSync(filePath);
    const fileSize = (buffer.length / 1024).toFixed(2);
    log(`✅ Archivo leído: ${fileSize} KB`, 'green');

    log('📤 Creando objeto File...', 'blue');
    const file = new File([buffer], 'FawerV-CV.pdf', {
      type: 'application/pdf',
    });
    log(`✅ File creado: ${file.name} (${file.type})`, 'green');

    log('🤖 Parseando CV con IA (10-30 segundos)...', 'blue');
    const parseStartTime = Date.now();
    const parsedCV = await parseCV(file);
    const parseDuration = ((Date.now() - parseStartTime) / 1000).toFixed(2);
    log(`✅ CV parseado exitosamente en ${parseDuration}s`, 'green');

    printSubSection('Información extraída del CV:');
    log(`   Nombre: ${parsedCV.personalInfo.name}`);
    log(`   Email: ${parsedCV.personalInfo.email}`);
    log(`   Experiencias: ${parsedCV.experience.length}`);
    log(`   Educación: ${parsedCV.education.length}`);
    log(`   Habilidades técnicas: ${parsedCV.skills.technical.length}`);
    log(`   Proyectos: ${parsedCV.projects?.length || 0}`);

    // ====================================================
    // PASO 2: CREAR BASE CV EN LA BASE DE DATOS
    // ====================================================
    printSection('PASO 2: GUARDAR BASE CV EN LA BASE DE DATOS');

    log('💾 Guardando CV en PostgreSQL...', 'blue');
    const baseCV = await prisma.baseCV.create({
      data: {
        userId: testUserId,
        title: 'CV Profesional - Test',
        personalInfo: parsedCV.personalInfo as never,
        summary: parsedCV.summary || null,
        experience: parsedCV.experience as never,
        education: parsedCV.education as never,
        skills: parsedCV.skills as never,
        projects: (parsedCV.projects || null) as never,
        certifications: (parsedCV.certifications || null) as never,
        rawText: parsedCV.rawText || null,
        isDefault: true,
      },
    });

    baseCVId = baseCV.id;
    log(`✅ Base CV creado con ID: ${baseCVId}`, 'green');

    // ====================================================
    // PASO 3: CREAR OFERTA DE TRABAJO
    // ====================================================
    printSection('PASO 3: CREAR OFERTA DE TRABAJO (JOB LISTING)');

    log('💼 Creando oferta de trabajo de ejemplo...', 'blue');
    const jobListing = await prisma.jobListing.create({
      data: {
        title: 'Senior Full Stack Developer',
        company: 'Tech Innovations Inc.',
        location: 'Remote',
        workMode: 'remote',
        salary: '$120,000 - $150,000',
        description: `
We are looking for a Senior Full Stack Developer to join our innovative team.

About the Role:
- Design and develop scalable web applications
- Work with React, Next.js, Node.js, and PostgreSQL
- Collaborate with cross-functional teams
- Mentor junior developers

Requirements:
- 5+ years of experience in full stack development
- Strong proficiency in React, TypeScript, and Node.js
- Experience with PostgreSQL and Prisma
- Familiarity with cloud platforms (AWS, GCP, or Azure)
- Excellent problem-solving skills
- Strong communication skills

Nice to Have:
- Experience with AI/ML integrations
- Knowledge of DevOps practices
- Open source contributions
- Experience with Tailwind CSS and modern UI frameworks
        `,
        requirements: [
          '5+ years of full stack development',
          'React and TypeScript expertise',
          'Node.js and API development',
          'PostgreSQL and database design',
          'Cloud platform experience',
          'Agile methodologies',
        ] as never,
        keywords: {
          technical: [
            'React',
            'Next.js',
            'TypeScript',
            'Node.js',
            'PostgreSQL',
            'Prisma',
            'AWS',
            'Docker',
            'REST API',
            'GraphQL',
            'Tailwind CSS',
          ],
          soft: [
            'Communication',
            'Problem-solving',
            'Team collaboration',
            'Mentoring',
            'Leadership',
          ],
          tools: ['Git', 'GitHub', 'CI/CD', 'Jira', 'Figma'],
        } as never,
        url: 'https://example.com/jobs/senior-fullstack-developer',
        source: 'Manual - Test',
      },
    });

    jobListingId = jobListing.id;
    log(`✅ Job Listing creado con ID: ${jobListingId}`, 'green');

    printSubSection('Detalles de la oferta:');
    log(`   Puesto: ${jobListing.title}`);
    log(`   Empresa: ${jobListing.company}`);
    log(`   Ubicación: ${jobListing.location}`);
    log(`   Modalidad: ${jobListing.workMode}`);
    log(`   Salario: ${jobListing.salary}`);

    // ====================================================
    // PASO 4: GENERAR APLICACIÓN PERSONALIZADA
    // ====================================================
    printSection('PASO 4: GENERAR APLICACIÓN PERSONALIZADA CON IA');

    log(
      '🤖 Generando CV personalizado y Cover Letter (30-60 segundos)...',
      'blue'
    );

    // Preparar datos para generación
    const cvData: CV = {
      personalInfo: baseCV.personalInfo as never,
      summary: baseCV.summary || undefined,
      experience: baseCV.experience as never,
      education: baseCV.education as never,
      skills: baseCV.skills as never,
      projects: (baseCV.projects as never) || undefined,
      certifications: (baseCV.certifications as never) || undefined,
    };

    const jobData: JobListing = {
      title: jobListing.title,
      company: jobListing.company,
      location: jobListing.location || undefined,
      workMode: jobListing.workMode as 'remote' | 'hybrid' | 'onsite',
      salary: jobListing.salary || undefined,
      description: jobListing.description,
      keywords: jobListing.keywords as never,
      requirements: jobListing.requirements as never,
      url: jobListing.url || undefined,
      source: jobListing.source || undefined,
    };

    const genStartTime = Date.now();

    // Generar CV personalizado y Cover Letter en paralelo
    log('   → Generando CV personalizado...', 'cyan');
    log('   → Generando Cover Letter...', 'cyan');

    const [customCV, coverLetter] = await Promise.all([
      generateCustomCV(cvData, jobData),
      generateCoverLetter(cvData, jobData, 'professional'),
    ]);

    const genDuration = ((Date.now() - genStartTime) / 1000).toFixed(2);
    log(`✅ Documentos generados en ${genDuration}s`, 'green');

    // Crear Cover Letter en DB
    log('💾 Guardando Cover Letter en DB...', 'blue');
    const coverLetterRecord = await prisma.coverLetter.create({
      data: {
        userId: testUserId,
        content: coverLetter.content,
        htmlContent: coverLetter.htmlContent || null,
        tone: 'professional',
      },
    });
    log(`✅ Cover Letter guardada con ID: ${coverLetterRecord.id}`, 'green');

    // Crear Application
    log('💾 Guardando Application en DB...', 'blue');
    const application = await prisma.application.create({
      data: {
        userId: testUserId,
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
    printSection('✨ RESULTADOS DEL TEST COMPLETO');

    printSubSection('IDs Generados:');
    log(`   Base CV ID:        ${baseCVId}`);
    log(`   Job Listing ID:    ${jobListingId}`);
    log(`   Cover Letter ID:   ${coverLetterRecord.id}`);
    log(`   Application ID:    ${applicationId}`);

    printSubSection('ATS Score y Match:');
    log(
      `   ATS Score:         ${application.atsScore?.toFixed(1) || 'N/A'}%`,
      application.atsScore && application.atsScore > 80 ? 'green' : 'yellow'
    );
    log(
      `   Match Score:       ${application.matchScore?.toFixed(1) || 'N/A'}%`,
      application.matchScore && application.matchScore > 80 ? 'green' : 'yellow'
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
        log(
          `   • ${customCV.atsOptimizations.keywordsAdded.slice(0, 5).join(', ')}`,
          'cyan'
        );
      }
      log(
        `   Secciones reordenadas: ${customCV.atsOptimizations.sectionsReordered?.length || 0}`
      );
    }

    printSubSection('Cover Letter Preview:');
    const coverPreview = coverLetter.content.substring(0, 300);
    log(`   ${coverPreview}...`, 'cyan');

    printSubSection('Tiempos de Procesamiento:');
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`   Parse CV:          ${parseDuration}s`);
    log(`   Generar docs:      ${genDuration}s`);
    log(`   Tiempo total:      ${totalTime}s`);

    printSection('🎉 TEST COMPLETADO EXITOSAMENTE');
    log('Todos los componentes del flujo funcionaron correctamente\n', 'green');

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
    // Cleanup: Eliminar datos de prueba
    log('\n🧹 Limpiando datos de prueba...', 'yellow');

    try {
      if (applicationId!) {
        await prisma.application.delete({ where: { id: applicationId } });
        log('   ✓ Application eliminada', 'yellow');
      }
    } catch (e) {
      // Ignorar errores de cleanup
    }

    try {
      if (baseCVId!) {
        await prisma.baseCV.delete({ where: { id: baseCVId } });
        log('   ✓ Base CV eliminado', 'yellow');
      }
    } catch (e) {
      // Ignorar errores de cleanup
    }

    try {
      if (jobListingId!) {
        await prisma.jobListing.delete({ where: { id: jobListingId } });
        log('   ✓ Job Listing eliminado', 'yellow');
      }
    } catch (e) {
      // Ignorar errores de cleanup
    }

    try {
      if (testUserId!) {
        await prisma.user.delete({ where: { id: testUserId } });
        log('   ✓ Usuario de prueba eliminado', 'yellow');
      }
    } catch (e) {
      // Ignorar errores de cleanup
    }

    await prisma.$disconnect();
    log('   ✓ Conexión a DB cerrada\n', 'yellow');
  }
}

// Ejecutar el test
if (require.main === module) {
  testCompleteFlow()
    .then(() => {
      log('✅ Todos los tests pasaron!', 'green');
      process.exit(0);
    })
    .catch((error) => {
      log(`❌ El test falló: ${error.message}`, 'red');
      process.exit(1);
    });
}

export { testCompleteFlow };
