/**
 * Script para validar conexión a Neon Database
 *
 * Uso:
 * npx tsx scripts/test-db-connection.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function testConnection() {
  console.log('🔍 Probando conexión a Neon Database...\n')

  try {
    // 1. Test de conexión básica
    console.log('1. Verificando conexión...')
    await prisma.$connect()
    console.log('   ✅ Conexión establecida\n')

    // 2. Test de query simple
    console.log('2. Ejecutando query de prueba...')
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`
    console.log('   ✅ Query ejecutada:', result)
    console.log('')

    // 3. Verificar tablas existentes
    console.log('3. Verificando tablas en la base de datos...')
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `

    if (tables.length === 0) {
      console.log('   ⚠️  No se encontraron tablas. Ejecuta: npm run db:migrate')
    } else {
      console.log('   ✅ Tablas encontradas:')
      tables.forEach((table) => {
        console.log(`      - ${table.tablename}`)
      })
    }
    console.log('')

    // 4. Contar registros en tablas principales (si existen)
    try {
      const userCount = await prisma.user.count()
      const psychologistCount = await prisma.psychologist.count()
      const checkInCount = await prisma.checkIn.count()

      console.log('4. Estadísticas de datos:')
      console.log(`   - Usuarios: ${userCount}`)
      console.log(`   - Psicólogos: ${psychologistCount}`)
      console.log(`   - Check-ins: ${checkInCount}`)
      console.log('')

      if (userCount === 0 && psychologistCount === 0 && checkInCount === 0) {
        console.log('   💡 Tip: Ejecuta `npm run db:seed` para cargar datos de ejemplo\n')
      }
    } catch (error) {
      console.log('   ⚠️  No se pudieron contar registros (es normal si no has ejecutado migraciones)\n')
    }

    console.log('✅ ¡Conexión a base de datos validada exitosamente!\n')
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:\n')

    if (error instanceof Error) {
      console.error(`   ${error.message}\n`)

      if (error.message.includes('getaddrinfo')) {
        console.error('   💡 Verifica que DATABASE_URL esté correctamente configurada en .env')
        console.error('   💡 Asegúrate de tener conexión a Internet\n')
      }

      if (error.message.includes('password authentication failed')) {
        console.error('   💡 Credenciales inválidas. Verifica DATABASE_URL en .env\n')
      }

      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.error('   💡 Tablas no creadas. Ejecuta: npm run db:migrate\n')
      }
    }

    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
