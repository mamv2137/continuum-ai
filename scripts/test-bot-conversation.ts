/**
 * Script para probar el bot localmente sin necesidad de WhatsApp
 *
 * Simula una conversación completa con el bot de Gestalt.
 *
 * Uso:
 * npx tsx scripts/test-bot-conversation.ts
 */

import { PrismaClient } from '@prisma/client'
import { PrismaUserRepository } from '../src/repositories/prisma/user.repository'
import { PrismaCheckInRepository } from '../src/repositories/prisma/check-in.repository'
import { GestaltCoachService } from '../src/services/ai/gestalt-coach.service'
import { GeminiService } from '../src/services/ai/gemini.service'
import { ProcessMessageUseCase } from '../src/use-cases/check-in/process-message.use-case'

const prisma = new PrismaClient({
  log: ['error'],
})

async function testBotConversation() {
  console.log('🤖 Probando Conversación con el Bot de Gestalt\n')

  // Número de teléfono de prueba
  const testPhone = '+5215500000002'

  // Verificar que GEMINI_API_KEY exista
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ ERROR: GEMINI_API_KEY no está configurada en .env.local')
    console.error('   Obtén tu API key en: https://makersuite.google.com/app/apikey\n')
    process.exit(1)
  }

  try {
    // Inicializar servicios
    const userRepo = new PrismaUserRepository(prisma)
    const checkInRepo = new PrismaCheckInRepository(prisma)
    const gestaltCoach = new GestaltCoachService()
    const geminiService = new GeminiService(process.env.GEMINI_API_KEY)

    // Crear caso de uso
    const processMessage = new ProcessMessageUseCase(
      userRepo,
      checkInRepo,
      gestaltCoach,
      geminiService
    )

    console.log('╔═══════════════════════════════════════════════════════════╗')
    console.log('║           CONVERSACIÓN CON CONTINUUM BOT                 ║')
    console.log('╚═══════════════════════════════════════════════════════════╝\n')

    // Simulación de conversación
    const conversation = [
      'Hola',
      'Me siento un poco estresado',
      'En el pecho, como una presión',
      'Es pesada, como si tuviera algo encima',
      'Como un 7 de intensidad',
      'También siento tensión en los hombros',
      'Gracias, listo',
    ]

    for (let i = 0; i < conversation.length; i++) {
      const userMessage = conversation[i]

      console.log(`\n${'─'.repeat(60)}`)
      console.log(`👤 Usuario: ${userMessage}`)
      console.log(`${'─'.repeat(60)}\n`)

      // Procesar mensaje
      const result = await processMessage.execute({
        phoneNumber: testPhone,
        message: userMessage,
      })

      console.log(`🤖 Continuum: ${result.response}\n`)

      if (i === 0) {
        console.log(`   ℹ️  Nuevo usuario: ${result.isNewUser}`)
        console.log(`   ℹ️  Nuevo check-in: ${result.isNewCheckIn}`)
        console.log(`   ℹ️  Check-in ID: ${result.checkInId}`)
      }

      // Pausa para efecto de conversación natural
      await sleep(1000)
    }

    console.log('\n╔═══════════════════════════════════════════════════════════╗')
    console.log('║                  FIN DE CONVERSACIÓN                     ║')
    console.log('╚═══════════════════════════════════════════════════════════╝\n')

    // Obtener estadísticas finales
    const user = await userRepo.findByPhoneNumber(
      new (await import('../src/domain/value-objects/phone-number.vo')).PhoneNumber(testPhone)
    )

    if (user) {
      const stats = await checkInRepo.getUserStats(user.id)

      console.log('📊 Estadísticas del Usuario:\n')
      console.log(`   - Total check-ins completados: ${stats.totalCheckIns}`)
      console.log(`   - Duración promedio: ${stats.averageDuration}s`)
      console.log(`   - Completitud promedio: ${stats.completionRate}%\n`)

      // Limpiar datos de prueba
      console.log('🧹 ¿Deseas limpiar los datos de prueba? (se eliminará en 5 segundos)\n')

      await sleep(5000)

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
    }

    console.log('✅ ¡Prueba completada exitosamente!\n')
    console.log('💡 Tip: Revisa los logs para ver cómo funciona el Gestalt Coach\n')
  } catch (error) {
    console.error('\n❌ Error durante la prueba:\n')

    if (error instanceof Error) {
      console.error(`   ${error.message}\n`)

      if (error.message.includes('API key')) {
        console.error('   💡 Verifica que GEMINI_API_KEY esté correctamente configurada\n')
      }
    }

    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

testBotConversation()
