import { NextRequest, NextResponse } from 'next/server'
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
        psychologistCode: true,
        onboardingDone: true,
        createdAt: true,
        lastCheckInAt: true,
        totalCheckIns: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Calculate stats
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const weeklyCheckIns = await prisma.checkIn.count({
      where: {
        userId: user.id,
        status: 'COMPLETED',
        createdAt: {
          gte: startOfWeek,
        },
      },
    })

    // Calculate current streak
    let currentStreak = 0
    if (user.lastCheckInAt) {
      const checkIns = await prisma.checkIn.findMany({
        where: {
          userId: user.id,
          status: 'COMPLETED',
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          createdAt: true,
        },
        take: 30, // Look at last 30 check-ins max
      })

      if (checkIns.length > 0) {
        // Group check-ins by date
        const checkInDates = new Set(
          checkIns.map((c) => c.createdAt.toISOString().split('T')[0])
        )

        // Count consecutive days from today
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        let currentDate = new Date(today)
        while (checkInDates.has(currentDate.toISOString().split('T')[0])) {
          currentStreak++
          currentDate.setDate(currentDate.getDate() - 1)
        }
      }
    }

    const stats = {
      totalCheckIns: user.totalCheckIns,
      weeklyCheckIns,
      currentStreak,
      lastCheckInAt: user.lastCheckInAt?.toISOString() ?? null,
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        psychologistCode: user.psychologistCode,
        onboardingDone: user.onboardingDone,
        createdAt: user.createdAt.toISOString(),
      },
      stats,
    })
  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
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

    const body = await request.json()
    const { name, role, phoneNumber } = body

    console.log('🔐 [API] PATCH user:', { name, role, phoneNumber })

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(name !== undefined && { name }),
        ...(role !== undefined && { role }),
        ...(phoneNumber !== undefined && { phoneNumber }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
      },
    })

    console.log('🔐 [API] Updated user:', user)

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
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

    // Delete all related data in order (cascade)
    // 1. Delete body sensations (via check-ins)
    await prisma.bodySensation.deleteMany({
      where: { checkIn: { userId: user.id } },
    })

    // 2. Delete check-ins
    await prisma.checkIn.deleteMany({
      where: { userId: user.id },
    })

    // 3. Delete sessions
    await prisma.session.deleteMany({
      where: { userId: user.id },
    })

    // 4. Delete accounts
    await prisma.account.deleteMany({
      where: { userId: user.id },
    })

    // 5. Delete user
    await prisma.user.delete({
      where: { id: user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
