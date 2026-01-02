/**
 * Chat Reset API Route
 *
 * Endpoint para resetear la conversación de un usuario.
 * Solo disponible en desarrollo.
 *
 * POST /api/chat/reset
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { PhoneNumber } from '@/domain/value-objects/phone-number.vo'

type ResetRequest = {
  phoneNumber: string
}

/**
 * POST handler - Resetea la conversación de un usuario
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
    const body: ResetRequest = await request.json()

    console.log('🔄 [CHAT RESET] Reseteando conversación:', body.phoneNumber)

    // Validar input
    if (!body.phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'phoneNumber is required' },
        { status: 400 }
      )
    }

    // Validar formato de teléfono
    const phoneNumber = new PhoneNumber(body.phoneNumber)

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { phoneNumber: body.phoneNumber },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Eliminar todos los check-ins del usuario
    const deletedCheckIns = await prisma.checkIn.deleteMany({
      where: { userId: user.id },
    })

    console.log(`✅ [CHAT RESET] ${deletedCheckIns.count} check-ins eliminados`)

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

    console.log(`✅ [CHAT RESET] Usuario reseteado a estado inicial`)
    console.log(`✅ [CHAT RESET] Conversación reseteada para ${body.phoneNumber}`)

    return NextResponse.json({
      success: true,
      message: 'User and conversation reset successfully',
      data: {
        userId: user.id,
        checkInsDeleted: deletedCheckIns.count,
      },
    })
  } catch (error) {
    console.error('❌ [CHAT RESET] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
