/**
 * Script para crear un usuario de prueba en la base de datos
 * Ejecutar: npx tsx scripts/create-test-user.ts
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { prisma } from '../src/lib/db/prisma';

async function createTestUser() {
  console.log('🔧 Creando usuario de prueba...\n');

  try {
    // Verificar si ya existe el usuario
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (existingUser) {
      console.log('✅ Usuario de prueba ya existe:');
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Nombre: ${existingUser.name}\n`);
      return existingUser;
    }

    // Crear nuevo usuario
    const user = await prisma.user.create({
      data: {
        id: 'temp-user', // ID fijo para facilitar las pruebas
        email: 'test@example.com',
        name: 'Test User',
      },
    });

    console.log('✅ Usuario de prueba creado exitosamente:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nombre: ${user.name}\n`);

    console.log('📝 Puedes usar este ID en tus pruebas: temp-user\n');

    return user;
  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
if (require.main === module) {
  createTestUser()
    .then(() => {
      console.log('✅ Proceso completado!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}

export { createTestUser };
