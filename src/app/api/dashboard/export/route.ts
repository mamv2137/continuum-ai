import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        onboardingDone: true,
        createdAt: true,
        totalCheckIns: true,
        lastCheckInAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Get all check-ins with body sensations
    const checkIns = await prisma.checkIn.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        bodySensations: {
          select: {
            bodyPart: true,
            sensationType: true,
            intensity: true,
            description: true,
            createdAt: true,
          },
        },
      },
    })

    // Format data for export
    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        onboardingDone: user.onboardingDone,
        createdAt: user.createdAt.toISOString(),
        totalCheckIns: user.totalCheckIns,
        lastCheckInAt: user.lastCheckInAt?.toISOString() ?? null,
      },
      checkIns: checkIns.map((checkIn) => ({
        status: checkIn.status,
        externalZone: checkIn.externalZone,
        fantasyZone: checkIn.fantasyZone,
        aiInsight: checkIn.aiInsight,
        emotionalTone: checkIn.emotionalTone,
        duration: checkIn.duration,
        messageCount: checkIn.messageCount,
        createdAt: checkIn.createdAt.toISOString(),
        completedAt: checkIn.completedAt?.toISOString() ?? null,
        bodySensations: checkIn.bodySensations.map((sensation) => ({
          bodyPart: sensation.bodyPart,
          sensationType: sensation.sensationType,
          intensity: sensation.intensity,
          description: sensation.description,
          createdAt: sensation.createdAt.toISOString(),
        })),
      })),
    }

    return NextResponse.json(exportData)
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
