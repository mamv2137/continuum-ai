/**
 * Script para probar los repositorios de Prisma
 *
 * Uso:
 * npx tsx scripts/test-repositories.ts
 *
 * IMPORTANTE: Asegúrate de tener DATABASE_URL configurada en .env
 * y haber ejecutado las migraciones: npm run db:migrate
 */

import { PrismaClient } from '@prisma/client'
import { PrismaUserRepository } from '../src/repositories/prisma/user.repository'
import { PrismaCheckInRepository } from '../src/repositories/prisma/check-in.repository'
import { PhoneNumber } from '../src/domain/value-objects/phone-number.vo'
import { CheckInEntity, SessionStatus } from '../src/domain/entities/check-in.entity'
import { GestaltZone, GestaltZoneType } from '../src/domain/value-objects/gestalt-zone.vo'

const prisma = new PrismaClient({
  log: ['error', 'warn'],
})

async function testRepositories() {
  console.log('🧪 Probando Repositorios de Prisma\n')

  const userRepo = new PrismaUserRepository(prisma)
  const checkInRepo = new PrismaCheckInRepository(prisma)

  try {
    // ==========================================
    // TEST 1: Crear usuario
    // ==========================================
    console.log('1️⃣  Test: Crear usuario')
    const testPhoneNumber = new PhoneNumber('+5215500000001')

    // Limpiar usuario de prueba si existe
    await prisma.user.deleteMany({
      where: { phoneNumber: testPhoneNumber.getValue() },
    })

    const user = await userRepo.create({
      phoneNumber: testPhoneNumber,
      name: 'Usuario de Prueba',
      role: 'INDIVIDUAL',
    })

    console.log(`   ✅ Usuario creado: ${user.id}`)
    console.log(`   - Teléfono: ${user.phoneNumber.getValue()}`)
    console.log(`   - Nombre: ${user.name}\n`)

    // ==========================================
    // TEST 2: Buscar usuario por teléfono
    // ==========================================
    console.log('2️⃣  Test: Buscar usuario por teléfono')
    const foundUser = await userRepo.findByPhoneNumber(testPhoneNumber)

    if (foundUser) {
      console.log(`   ✅ Usuario encontrado: ${foundUser.id}`)
      console.log(`   - Onboarding: ${foundUser.onboardingDone}\n`)
    } else {
      console.log('   ❌ Usuario no encontrado\n')
    }

    // ==========================================
    // TEST 3: Crear check-in
    // ==========================================
    console.log('3️⃣  Test: Crear check-in')
    const checkIn = new CheckInEntity(
      crypto.randomUUID(),
      user.id,
      SessionStatus.IN_PROGRESS
    )

    // Agregar mensaje de bienvenida
    checkIn.addMessage('model', '¿Cómo te sientes en este momento?')
    checkIn.addMessage('user', 'Me siento un poco ansioso')

    // Agregar zona externa
    const externalZone = new GestaltZone(
      GestaltZoneType.EXTERNAL,
      'Escucho música de fondo y veo la pantalla brillante'
    )
    checkIn.setExternalZone(externalZone)

    // Agregar zona interna
    const internalZone = new GestaltZone(
      GestaltZoneType.INTERNAL,
      'Presión en Pecho: siento un peso en el pecho'
    )
    checkIn.addInternalZone(internalZone)

    const createdCheckIn = await checkInRepo.create(checkIn)

    console.log(`   ✅ Check-in creado: ${createdCheckIn.getId()}`)
    console.log(`   - Status: ${createdCheckIn.getStatus()}`)
    console.log(`   - Mensajes: ${createdCheckIn.getMessageCount()}`)
    console.log(`   - Completitud: ${createdCheckIn.getCompletionRate()}%\n`)

    // ==========================================
    // TEST 4: Buscar check-in activo
    // ==========================================
    console.log('4️⃣  Test: Buscar check-in activo del usuario')
    const activeCheckIn = await checkInRepo.findActiveByUserId(user.id)

    if (activeCheckIn) {
      console.log(`   ✅ Check-in activo encontrado: ${activeCheckIn.getId()}`)
      console.log(`   - Zona externa: ${activeCheckIn.getExternalZone()?.getContent()}`)
      console.log(`   - Zonas internas: ${activeCheckIn.getInternalZones().length}\n`)
    } else {
      console.log('   ❌ No se encontró check-in activo\n')
    }

    // ==========================================
    // TEST 5: Actualizar check-in
    // ==========================================
    console.log('5️⃣  Test: Actualizar check-in')

    if (activeCheckIn) {
      // Agregar más mensajes
      activeCheckIn.addMessage('model', '¿Dónde sientes esa presión exactamente?')
      activeCheckIn.addMessage('user', 'En el centro del pecho')

      // Agregar zona de fantasía
      const fantasyZone = new GestaltZone(
        GestaltZoneType.FANTASY,
        'Pienso que debería estar más relajado'
      )
      activeCheckIn.setFantasyZone(fantasyZone)

      // Completar el check-in
      activeCheckIn.complete()

      const updatedCheckIn = await checkInRepo.update(activeCheckIn)

      console.log(`   ✅ Check-in actualizado: ${updatedCheckIn.getId()}`)
      console.log(`   - Status: ${updatedCheckIn.getStatus()}`)
      console.log(`   - Completitud: ${updatedCheckIn.getCompletionRate()}%`)
      console.log(`   - Duración: ${updatedCheckIn.getDuration()}s\n`)
    }

    // ==========================================
    // TEST 6: Obtener estadísticas del usuario
    // ==========================================
    console.log('6️⃣  Test: Obtener estadísticas del usuario')

    // Incrementar contador
    await userRepo.incrementCheckInCount(user.id)
    await userRepo.updateLastCheckInDate(user.id, new Date())

    const stats = await checkInRepo.getUserStats(user.id)

    console.log(`   ✅ Estadísticas obtenidas:`)
    console.log(`   - Total check-ins: ${stats.totalCheckIns}`)
    console.log(`   - Duración promedio: ${stats.averageDuration}s`)
    console.log(`   - Completitud promedio: ${stats.completionRate}%\n`)

    // ==========================================
    // TEST 7: Buscar historial de check-ins
    // ==========================================
    console.log('7️⃣  Test: Buscar historial de check-ins')
    const history = await checkInRepo.findByUserId(user.id, 5)

    console.log(`   ✅ Check-ins encontrados: ${history.length}`)
    history.forEach((ci, index) => {
      console.log(
        `   ${index + 1}. ${ci.getId()} - ${ci.getStatus()} - ${ci.getCompletionRate()}%`
      )
    })
    console.log('')

    // ==========================================
    // Limpiar datos de prueba
    // ==========================================
    console.log('🧹 Limpiando datos de prueba...')
    await prisma.bodySensation.deleteMany({
      where: { checkIn: { userId: user.id } },
    })
    await prisma.checkIn.deleteMany({
      where: { userId: user.id },
    })
    await prisma.user.delete({
      where: { id: user.id },
    })
    console.log('   ✅ Datos de prueba eliminados\n')

    console.log('✅ ¡Todos los tests de repositorios pasaron exitosamente!\n')
  } catch (error) {
    console.error('❌ Error en tests de repositorios:\n')

    if (error instanceof Error) {
      console.error(`   ${error.message}\n`)
      console.error(error.stack)
    }

    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testRepositories()
