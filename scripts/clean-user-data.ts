/**
 * Clean User Data Script
 *
 * Limpia todos los datos de usuarios, check-ins y mensajes de la BD.
 * Útil para testing y desarrollo.
 *
 * IMPORTANTE: NO ejecutar en producción.
 *
 * Uso:
 * npm run db:clean-users
 * npm run db:clean-users -- --phone=+5491121913619  (limpiar solo un usuario)
 */

import { PrismaClient } from '../src/generated/client.js'

const prisma = new PrismaClient()

async function cleanUserData(phoneNumber?: string) {
  console.log('🧹 Limpiando datos de usuarios...\n')

  try {
    if (phoneNumber) {
      // Limpiar solo un usuario específico
      console.log(`📱 Buscando usuario: ${phoneNumber}`)

      const user = await prisma.user.findUnique({
        where: { phoneNumber },
        include: {
          checkIns: {
            include: {
              bodySensations: true,
            },
          },
        },
      })

      if (!user) {
        console.log(`❌ Usuario no encontrado: ${phoneNumber}`)
        return
      }

      console.log(`✓ Usuario encontrado: ${user.name || phoneNumber}`)
      console.log(`  - Check-ins: ${user.checkIns.length}`)

      // Eliminar check-ins (cascade eliminará bodySensations)
      const deletedCheckIns = await prisma.checkIn.deleteMany({
        where: { userId: user.id },
      })

      console.log(`  ✓ ${deletedCheckIns.count} check-ins eliminados`)

      // Resetear estado de onboarding del usuario
      await prisma.user.update({
        where: { id: user.id },
        data: {
          onboardingDone: false,
          onboardingStep: 'NAME',
          name: null,
          hasPsychologist: false,
          psychologistId: null,
          psychologistName: null,
          psychologistContact: null,
          emergencyContactName: null,
          emergencyContactPhone: null,
          totalCheckIns: 0,
          lastCheckInAt: null,
        },
      })

      console.log(`  ✓ Usuario reseteado a estado inicial`)
      console.log(`\n✅ Datos del usuario limpiados exitosamente!\n`)
    } else {
      // Limpiar TODOS los usuarios (excepto los del seed)
      console.log('⚠️  Limpiando TODOS los usuarios de prueba...\n')

      // Obtener usuarios que no son del seed
      const seedPhones = ['+5215512345678', '+5215587654321']
      const users = await prisma.user.findMany({
        where: {
          phoneNumber: {
            notIn: seedPhones,
          },
        },
        include: {
          checkIns: true,
        },
      })

      console.log(`📊 Usuarios a limpiar: ${users.length}`)

      for (const user of users) {
        console.log(`  - ${user.phoneNumber} (${user.checkIns.length} check-ins)`)
      }

      // Eliminar body sensations
      const deletedSensations = await prisma.bodySensation.deleteMany({
        where: {
          checkIn: {
            user: {
              phoneNumber: {
                notIn: seedPhones,
              },
            },
          },
        },
      })

      console.log(`\n✓ ${deletedSensations.count} sensaciones corporales eliminadas`)

      // Eliminar check-ins
      const deletedCheckIns = await prisma.checkIn.deleteMany({
        where: {
          user: {
            phoneNumber: {
              notIn: seedPhones,
            },
          },
        },
      })

      console.log(`✓ ${deletedCheckIns.count} check-ins eliminados`)

      // Eliminar usuarios
      const deletedUsers = await prisma.user.deleteMany({
        where: {
          phoneNumber: {
            notIn: seedPhones,
          },
        },
      })

      console.log(`✓ ${deletedUsers.count} usuarios eliminados`)

      console.log(`\n✅ Todos los datos de prueba limpiados!\n`)
    }
  } catch (error) {
    console.error('❌ Error limpiando datos:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Parsear argumentos
const args = process.argv.slice(2)
const phoneArg = args.find((arg) => arg.startsWith('--phone='))
const phoneNumber = phoneArg ? phoneArg.split('=')[1] : undefined

cleanUserData(phoneNumber)
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
