/**
 * User Info API Route
 *
 * Endpoint para obtener información detallada de un usuario por teléfono.
 * Solo disponible en desarrollo.
 *
 * GET /api/chat/user-info?phoneNumber=+5491121913619
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET handler - Obtiene información del usuario
 */
export async function GET(request: NextRequest) {
  // Solo disponible en desarrollo
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: 'This endpoint is only available in development' },
      { status: 403 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const phoneNumber = searchParams.get('phoneNumber')

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'phoneNumber is required' },
        { status: 400 }
      )
    }

    // Buscar usuario con sus check-ins y sensaciones corporales
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
      include: {
        checkIns: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            bodySensations: true,
          },
        },
        psychologist: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            psychologistCode: true,
          },
        },
        patients: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            lastCheckInAt: true,
            totalCheckIns: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Calcular estadísticas de check-ins
    const stats = {
      totalCheckIns: user.totalCheckIns,
      completedCheckIns: user.checkIns.filter((c) => c.status === 'COMPLETED').length,
      inProgressCheckIns: user.checkIns.filter((c) => c.status === 'IN_PROGRESS').length,
      abandonedCheckIns: user.checkIns.filter((c) => c.status === 'ABANDONED').length,
      lastCheckInAt: user.lastCheckInAt,
      // Tonos emocionales frecuentes
      emotionalTones: user.checkIns
        .map((c) => c.emotionalTone)
        .filter(Boolean)
        .reduce(
          (acc, tone) => {
            acc[tone!] = (acc[tone!] || 0) + 1
            return acc
          },
          {} as Record<string, number>
        ),
      // Partes del cuerpo más frecuentes
      bodyParts: user.checkIns
        .flatMap((c) => c.bodySensations)
        .map((s) => s.bodyPart)
        .reduce(
          (acc, part) => {
            acc[part] = (acc[part] || 0) + 1
            return acc
          },
          {} as Record<string, number>
        ),
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          email: user.email,
          name: user.name,
          role: user.role,
          // Campos de psicólogo
          licenseNumber: user.licenseNumber,
          psychologistCode: user.psychologistCode,
          notificationsEnabled: user.notificationsEnabled,
          // Onboarding
          onboardingDone: user.onboardingDone,
          onboardingStep: user.onboardingStep,
          termsAccepted: user.termsAccepted,
          termsAcceptedAt: user.termsAcceptedAt,
          // Info personal
          hasPsychologist: user.hasPsychologist,
          psychologistName: user.psychologistName,
          psychologistContact: user.psychologistContact,
          emergencyContactName: user.emergencyContactName,
          emergencyContactPhone: user.emergencyContactPhone,
          previousTherapyExperience: user.previousTherapyExperience,
          // Config
          timezone: user.timezone,
          preferredLanguage: user.preferredLanguage,
          // Fechas
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        psychologist: user.psychologist,
        patients: user.patients,
        checkIns: user.checkIns.map((c) => ({
          id: c.id,
          status: c.status,
          emotionalTone: c.emotionalTone,
          aiInsight: c.aiInsight,
          messageCount: c.messageCount,
          duration: c.duration,
          completionRate: c.completionRate,
          externalZone: c.externalZone,
          fantasyZone: c.fantasyZone,
          bodySensations: c.bodySensations,
          createdAt: c.createdAt,
          completedAt: c.completedAt,
        })),
        stats,
      },
    })
  } catch (error) {
    console.error('❌ [USER INFO] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
