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
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Get emotional trends (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const checkIns = await prisma.checkIn.findMany({
      where: {
        userId: user.id,
        status: 'COMPLETED',
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        createdAt: true,
        emotionalTone: true,
      },
    })

    // Group check-ins by date and emotional tone
    const emotionalTrends: Record<string, Record<string, number>> = {}

    checkIns.forEach((checkIn) => {
      const date = checkIn.createdAt.toISOString().split('T')[0]
      const tone = checkIn.emotionalTone ?? 'neutral'

      if (!emotionalTrends[date]) {
        emotionalTrends[date] = {}
      }
      emotionalTrends[date][tone] = (emotionalTrends[date][tone] || 0) + 1
    })

    // Get body sensations frequency
    const bodySensations = await prisma.bodySensation.findMany({
      where: {
        checkIn: {
          userId: user.id,
          status: 'COMPLETED',
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      },
      select: {
        bodyPart: true,
        intensity: true,
      },
    })

    // Aggregate body sensations
    const bodyPartsFrequency: Record<string, { count: number; avgIntensity: number }> = {}

    bodySensations.forEach((sensation) => {
      if (!bodyPartsFrequency[sensation.bodyPart]) {
        bodyPartsFrequency[sensation.bodyPart] = { count: 0, avgIntensity: 0 }
      }
      bodyPartsFrequency[sensation.bodyPart].count++
      if (sensation.intensity) {
        bodyPartsFrequency[sensation.bodyPart].avgIntensity +=
          sensation.intensity / bodySensations.filter((s) => s.bodyPart === sensation.bodyPart).length
      }
    })

    // Get emotional tone distribution
    const emotionalToneDistribution = await prisma.checkIn.groupBy({
      by: ['emotionalTone'],
      where: {
        userId: user.id,
        status: 'COMPLETED',
        emotionalTone: { not: null },
      },
      _count: {
        emotionalTone: true,
      },
    })

    return NextResponse.json({
      emotionalTrends: Object.entries(emotionalTrends).map(([date, tones]) => ({
        date,
        ...tones,
      })),
      bodyPartsFrequency: Object.entries(bodyPartsFrequency).map(([bodyPart, data]) => ({
        bodyPart,
        count: data.count,
        avgIntensity: Math.round(data.avgIntensity * 10) / 10,
      })),
      emotionalToneDistribution: emotionalToneDistribution.map((item) => ({
        tone: item.emotionalTone,
        count: item._count.emotionalTone,
      })),
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
