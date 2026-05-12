/**
 * Test script para probar la extracción de texto del PDF (sin IA)
 *
 * Ejecutar: npx tsx scripts/test-pdf-extract.ts
 */

import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import fs from 'fs';
import pdf from 'pdf-parse';

async function testPDFExtraction() {
  console.log('🚀 Iniciando test de extracción de PDF...\n');

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

    // 2. Extraer texto del PDF
    console.log('📤 Extrayendo texto del PDF...');
    const startTime = Date.now();

    const data = await pdf(buffer);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`✅ Texto extraído exitosamente en ${duration} segundos\n`);

    // 3. Mostrar estadísticas
    console.log('📊 ESTADÍSTICAS DE EXTRACCIÓN:\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`\n📄 Páginas: ${data.numpages}`);
    console.log(`📝 Caracteres: ${data.text.length}`);
    console.log(`🔤 Palabras: ${data.text.split(/\s+/).length}`);
    console.log(`📏 Líneas: ${data.text.split('\n').length}`);

    // 4. Mostrar primeras líneas del CV
    console.log('\n📄 PRIMERAS 30 LÍNEAS DEL CV:\n');
    console.log('─────────────────────────────────────');
    const lines = data.text.split('\n').filter((line) => line.trim());
    lines.slice(0, 30).forEach((line, index) => {
      console.log(
        `${(index + 1).toString().padStart(2, '0')}: ${line.substring(0, 80)}${line.length > 80 ? '...' : ''}`
      );
    });

    // 5. Análisis básico (sin IA)
    console.log('\n\n🔍 ANÁLISIS BÁSICO (SIN IA):\n');
    console.log('─────────────────────────────────────');

    // Extraer email
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = data.text.match(emailRegex);
    if (emails) {
      console.log(`\n📧 Emails encontrados:`);
      emails.forEach((email) => console.log(`   • ${email}`));
    }

    // Extraer teléfonos (patrón básico)
    const phoneRegex =
      /[\+]?[(]?[0-9]{2,4}[)]?[-\s\.]?[0-9]{2,4}[-\s\.]?[0-9]{2,4}[-\s\.]?[0-9]{2,4}/g;
    const phones = data.text.match(phoneRegex);
    if (phones) {
      console.log(`\n📱 Posibles teléfonos encontrados:`);
      [...new Set(phones)]
        .slice(0, 5)
        .forEach((phone) => console.log(`   • ${phone}`));
    }

    // Extraer URLs
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
    const urls = data.text.match(urlRegex);
    if (urls) {
      console.log(`\n🔗 URLs encontradas:`);
      [...new Set(urls)]
        .slice(0, 10)
        .forEach((url) => console.log(`   • ${url}`));
    }

    // Detectar secciones comunes
    const sections = [
      'EXPERIENCE',
      'EXPERIENCIA',
      'WORK EXPERIENCE',
      'EDUCATION',
      'EDUCACIÓN',
      'FORMACIÓN',
      'SKILLS',
      'HABILIDADES',
      'COMPETENCIAS',
      'PROJECTS',
      'PROYECTOS',
      'CERTIFICATIONS',
      'CERTIFICACIONES',
      'SUMMARY',
      'RESUMEN',
      'PERFIL',
    ];

    const foundSections = sections.filter((section) =>
      data.text.toUpperCase().includes(section)
    );

    if (foundSections.length > 0) {
      console.log(`\n📋 Secciones detectadas:`);
      foundSections.forEach((section) => console.log(`   • ${section}`));
    }

    // Buscar palabras clave técnicas comunes
    const techKeywords = [
      'JavaScript',
      'TypeScript',
      'Python',
      'Java',
      'React',
      'Node',
      'AWS',
      'Docker',
      'Kubernetes',
      'SQL',
      'MongoDB',
      'Git',
      'CI/CD',
      'API',
      'REST',
      'GraphQL',
      'Microservices',
      'Next.js',
      'Vue',
      'Angular',
      'Express',
      'Django',
      'Flask',
    ];

    const foundKeywords = techKeywords.filter((keyword) =>
      data.text.includes(keyword)
    );

    if (foundKeywords.length > 0) {
      console.log(`\n💻 Tecnologías detectadas:`);
      foundKeywords.forEach((keyword) => console.log(`   • ${keyword}`));
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('\n✅ RESUMEN:');
    console.log(`   • Archivo: ${filePath.split('/').pop()}`);
    console.log(`   • Tamaño: ${fileSize} KB`);
    console.log(`   • Tiempo de extracción: ${duration}s`);
    console.log(`   • Páginas extraídas: ${data.numpages}`);
    console.log(`   • Texto total: ${data.text.length} caracteres`);
    console.log(`   • Emails: ${emails?.length || 0}`);
    console.log(`   • URLs: ${urls?.length || 0}`);
    console.log(`   • Secciones: ${foundSections.length}`);
    console.log(`   • Tecnologías: ${foundKeywords.length}`);

    console.log('\n🎉 TEST DE EXTRACCIÓN COMPLETADO!\n');
    console.log(
      '📝 NOTA: El parser completo con IA estructurará toda esta información'
    );
    console.log('   automáticamente en un formato JSON organizado.\n');

    return data;
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
  testPDFExtraction()
    .then(() => {
      console.log('✅ Test de extracción completado exitosamente!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ El test falló:', error.message);
      process.exit(1);
    });
}

export { testPDFExtraction };
