/**
 * Test script para probar el flujo completo de carga de CV
 *
 * Ejecutar: npx tsx scripts/test-cv-upload.ts
 */

import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import fs from 'fs';
import { parseCV } from '../src/lib/cv/parser';

async function testCVUpload() {
  console.log('🚀 Iniciando test de carga de CV...\n');

  try {
    // 1. Leer el archivo PDF
    console.log('📄 Leyendo archivo PDF...');
    const filePath = path.join(process.cwd(), 'files', 'FawerV-CV.pdf');

    if (!fs.existsSync(filePath)) {
      throw new Error('Archivo no encontrado: ' + filePath);
    }

    const buffer = fs.readFileSync(filePath);
    const fileSize = (buffer.length / 1024).toFixed(2);
    console.log(`✅ Archivo leído: ${fileSize} KB\n`);

    // 2. Crear objeto File para simular el upload
    console.log('📤 Creando objeto File...');
    const file = new File([buffer], 'FawerV-CV.pdf', {
      type: 'application/pdf',
    });
    console.log(`✅ File creado: ${file.name} (${file.type})\n`);

    // 3. Parsear el CV con la función de parser
    console.log('🤖 Parseando CV con IA (esto puede tomar 10-30 segundos)...');
    const startTime = Date.now();

    const parsedCV = await parseCV(file);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`✅ CV parseado exitosamente en ${duration} segundos\n`);

    // 4. Mostrar resultados
    console.log('📊 RESULTADOS DEL PARSING:\n');
    console.log('═══════════════════════════════════════════════════════');

    console.log('\n👤 INFORMACIÓN PERSONAL:');
    console.log('─────────────────────────────────────');
    console.log(`Nombre: ${parsedCV.personalInfo.name}`);
    console.log(`Email: ${parsedCV.personalInfo.email}`);
    if (parsedCV.personalInfo.phone) {
      console.log(`Teléfono: ${parsedCV.personalInfo.phone}`);
    }
    if (parsedCV.personalInfo.location) {
      console.log(`Ubicación: ${parsedCV.personalInfo.location}`);
    }
    if (parsedCV.personalInfo.linkedin) {
      console.log(`LinkedIn: ${parsedCV.personalInfo.linkedin}`);
    }
    if (parsedCV.personalInfo.github) {
      console.log(`GitHub: ${parsedCV.personalInfo.github}`);
    }

    if (parsedCV.summary) {
      console.log('\n📝 RESUMEN PROFESIONAL:');
      console.log('─────────────────────────────────────');
      console.log(parsedCV.summary);
    }

    console.log('\n💼 EXPERIENCIA:');
    console.log('─────────────────────────────────────');
    parsedCV.experience.forEach((exp, index) => {
      console.log(`\n${index + 1}. ${exp.title} en ${exp.company}`);
      console.log(`   Periodo: ${exp.dates}`);
      console.log(`   Logros (${exp.bullets.length}):`);
      exp.bullets.forEach((bullet, i) => {
        console.log(
          `   • ${bullet.substring(0, 80)}${bullet.length > 80 ? '...' : ''}`
        );
      });
    });

    console.log('\n🎓 EDUCACIÓN:');
    console.log('─────────────────────────────────────');
    parsedCV.education.forEach((edu, index) => {
      console.log(`\n${index + 1}. ${edu.degree}`);
      console.log(`   ${edu.institution}`);
      console.log(`   ${edu.dates}`);
      if (edu.details) {
        console.log(`   Detalles: ${edu.details}`);
      }
    });

    console.log('\n🛠️  HABILIDADES:');
    console.log('─────────────────────────────────────');
    if (parsedCV.skills.technical.length > 0) {
      console.log(`\nTécnicas (${parsedCV.skills.technical.length}):`);
      console.log(parsedCV.skills.technical.join(', '));
    }
    if (parsedCV.skills.soft && parsedCV.skills.soft.length > 0) {
      console.log(`\nBlandas (${parsedCV.skills.soft.length}):`);
      console.log(parsedCV.skills.soft.join(', '));
    }
    if (parsedCV.skills.languages && parsedCV.skills.languages.length > 0) {
      console.log(`\nIdiomas (${parsedCV.skills.languages.length}):`);
      console.log(parsedCV.skills.languages.join(', '));
    }

    if (parsedCV.projects && parsedCV.projects.length > 0) {
      console.log('\n🚀 PROYECTOS:');
      console.log('─────────────────────────────────────');
      parsedCV.projects.forEach((project, index) => {
        console.log(`\n${index + 1}. ${project.name}`);
        console.log(`   ${project.description}`);
        console.log(`   Tecnologías: ${project.technologies.join(', ')}`);
        if (project.url) {
          console.log(`   URL: ${project.url}`);
        }
      });
    }

    if (parsedCV.certifications && parsedCV.certifications.length > 0) {
      console.log('\n📜 CERTIFICACIONES:');
      console.log('─────────────────────────────────────');
      parsedCV.certifications.forEach((cert, index) => {
        console.log(`\n${index + 1}. ${cert.name}`);
        console.log(`   Emisor: ${cert.issuer}`);
        console.log(`   Fecha: ${cert.date}`);
      });
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('\n✨ ESTADÍSTICAS:');
    console.log(`   • Experiencias: ${parsedCV.experience.length}`);
    console.log(`   • Educación: ${parsedCV.education.length}`);
    console.log(
      `   • Habilidades técnicas: ${parsedCV.skills.technical.length}`
    );
    console.log(`   • Proyectos: ${parsedCV.projects?.length || 0}`);
    console.log(
      `   • Certificaciones: ${parsedCV.certifications?.length || 0}`
    );
    console.log(`   • Tiempo de procesamiento: ${duration}s`);

    if (parsedCV.rawText) {
      const wordCount = parsedCV.rawText.split(/\s+/).length;
      console.log(`   • Palabras extraídas: ${wordCount}`);
    }

    console.log('\n🎉 TEST COMPLETADO EXITOSAMENTE!\n');

    return parsedCV;
  } catch (error) {
    console.error('\n❌ ERROR EN EL TEST:');
    console.error('─────────────────────────────────────');
    console.error(error);
    console.error('\n');
    throw error;
  }
}

// Ejecutar el test
if (require.main === module) {
  testCVUpload()
    .then(() => {
      console.log('✅ Todos los tests pasaron!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ El test falló:', error.message);
      process.exit(1);
    });
}

export { testCVUpload };
