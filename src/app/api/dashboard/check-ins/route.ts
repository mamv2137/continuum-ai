import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') ?? '10', 10)
    const status = searchParams.get('status')

    const where = {
      userId: user.id,
      ...(status ? { status: status as 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED' } : {}),
    }

    const [checkIns, total] = await Promise.all([
      prisma.checkIn.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          bodySensations: {
            select: {
              id: true,
              bodyPart: true,
              sensationType: true,
              intensity: true,
              description: true,
            },
          },
        },
      }),
      prisma.checkIn.count({ where }),
    ])

    return NextResponse.json({
      checkIns: checkIns.map((checkIn) => ({
        id: checkIn.id,
        status: checkIn.status,
        externalZone: checkIn.externalZone,
        fantasyZone: checkIn.fantasyZone,
        aiInsight: checkIn.aiInsight,
        emotionalTone: checkIn.emotionalTone,
        duration: checkIn.duration,
        messageCount: checkIn.messageCount,
        createdAt: checkIn.createdAt.toISOString(),
        completedAt: checkIn.completedAt?.toISOString() ?? null,
        bodySensations: checkIn.bodySensations,
      })),
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Error fetching check-ins:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
