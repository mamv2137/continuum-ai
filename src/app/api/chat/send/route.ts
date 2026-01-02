/**
 * Chat Testing API Route
 *
 * Endpoint para probar el bot sin usar WhatsApp.
 * Solo disponible en desarrollo.
 *
 * POST /api/chat/send
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { PrismaUserRepository } from '@/repositories/prisma/user.repository'
import { PrismaCheckInRepository } from '@/repositories/prisma/check-in.repository'
import { PrismaPsychologistRepository } from '@/repositories/prisma/psychologist.repository'
import { GestaltCoachService } from '@/services/ai/gestalt-coach.service'
import { GeminiService } from '@/services/ai/gemini.service'
import { ProcessMessageUseCase } from '@/use-cases/check-in/process-message.use-case'
import { DomainError } from '@/domain/errors/domain.error'

type SendMessageRequest = {
  phoneNumber: string
  message: string
}

/**
 * POST handler - Envía mensaje al bot (solo testing)
 */
export async function POST(request: NextRequest) {
  // Solo disponible en desarrollo
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: 'This endpoint is only available in development' },
      { status: 403 }
    )
  }

  try {
    const body: SendMessageRequest = await request.json()

    console.log('💬 [CHAT TEST] Mensaje recibido:', body)

    // Validar input
    if (!body.phoneNumber || !body.message) {
      return NextResponse.json(
        { success: false, error: 'phoneNumber and message are required' },
        { status: 400 }
      )
    }

    // Validar que GEMINI_API_KEY exista
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY no está configurada' },
        { status: 500 }
      )
    }

    // Inicializar servicios
    const userRepo = new PrismaUserRepository(prisma)
    const checkInRepo = new PrismaCheckInRepository(prisma)
    const psychologistRepo = new PrismaPsychologistRepository(prisma)
    const gestaltCoach = new GestaltCoachService()
    const geminiService = new GeminiService(process.env.GEMINI_API_KEY)

    // Crear y ejecutar caso de uso
    const processMessageUseCase = new ProcessMessageUseCase(
      userRepo,
      checkInRepo,
      psychologistRepo,
      gestaltCoach,
      geminiService
    )

    const result = await processMessageUseCase.execute({
      phoneNumber: body.phoneNumber,
      message: body.message,
    })

    console.log('✅ [CHAT TEST] Respuesta generada:', {
      checkInId: result.checkInId,
      isNewUser: result.isNewUser,
      isNewCheckIn: result.isNewCheckIn,
    })

    // Retornar respuesta (siempre incluir response en testing)
    return NextResponse.json({
      success: true,
      data: {
        response: result.response,
        checkInId: result.checkInId,
        isNewUser: result.isNewUser,
        isNewCheckIn: result.isNewCheckIn,
      },
    })
  } catch (error) {
    console.error('❌ [CHAT TEST] Error:', error)

    // Manejo de errores específicos
    if (error instanceof DomainError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      )
    }

    // Error genérico
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
