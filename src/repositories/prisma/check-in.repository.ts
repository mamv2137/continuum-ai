/**
 * Prisma CheckIn Repository
 *
 * Implementación del repositorio de check-ins usando Prisma.
 */

import { PrismaClient } from '@/generated/client'
import { ICheckInRepository } from '../interfaces/check-in.repository.interface'
import { CheckInEntity } from '../../domain/entities/check-in.entity'
import { CheckInMapper } from './mappers/check-in.mapper'

export class PrismaCheckInRepository implements ICheckInRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Crea un nuevo check-in
   */
  async create(checkIn: CheckInEntity): Promise<CheckInEntity> {
    const prismaData = CheckInMapper.toPrismaCreate(checkIn)
    const bodySensations = CheckInMapper.extractBodySensations(checkIn)

    // Usar transacción para crear check-in y sensaciones corporales
    const created = await this.prisma.$transaction(async (tx) => {
      // 1. Crear check-in
      const createdCheckIn = await tx.checkIn.create({
        data: {
          ...prismaData,
          // Crear body sensations en la misma transacción
          bodySensations: {
            create: bodySensations.map((sensation) => ({
              bodyPart: sensation.bodyPart,
              sensationType: sensation.sensationType,
              intensity: sensation.intensity,
              description: sensation.description,
            })),
          },
        },
        include: {
          bodySensations: true,
        },
      })

      return createdCheckIn
    })

    return CheckInMapper.toDomain(created)
  }

  /**
   * Encuentra un check-in por ID
   */
  async findById(id: string): Promise<CheckInEntity | null> {
    const checkIn = await this.prisma.checkIn.findUnique({
      where: { id },
      include: {
        bodySensations: true,
      },
    })

    if (!checkIn) return null

    return CheckInMapper.toDomain(checkIn)
  }

  /**
   * Encuentra el check-in activo (IN_PROGRESS) de un usuario
   */
  async findActiveByUserId(userId: string): Promise<CheckInEntity | null> {
    const checkIn = await this.prisma.checkIn.findFirst({
      where: {
        userId,
        status: 'IN_PROGRESS',
      },
      include: {
        bodySensations: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!checkIn) return null

    return CheckInMapper.toDomain(checkIn)
  }

  /**
   * Encuentra todos los check-ins de un usuario
   */
  async findByUserId(userId: string, limit: number = 10): Promise<CheckInEntity[]> {
    const checkIns = await this.prisma.checkIn.findMany({
      where: { userId },
      include: {
        bodySensations: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    return checkIns.map((checkIn) => CheckInMapper.toDomain(checkIn))
  }

  /**
   * Actualiza un check-in existente
   */
  async update(checkIn: CheckInEntity): Promise<CheckInEntity> {
    const prismaData = CheckInMapper.toPrismaUpdate(checkIn)
    const bodySensations = CheckInMapper.extractBodySensations(checkIn)

    // Usar transacción para actualizar check-in y sensaciones
    const updated = await this.prisma.$transaction(async (tx) => {
      // 1. Eliminar sensaciones corporales antiguas
      await tx.bodySensation.deleteMany({
        where: { checkInId: checkIn.getId() },
      })

      // 2. Actualizar check-in y crear nuevas sensaciones
      const updatedCheckIn = await tx.checkIn.update({
        where: { id: checkIn.getId() },
        data: {
          ...prismaData,
          bodySensations: {
            create: bodySensations.map((sensation) => ({
              bodyPart: sensation.bodyPart,
              sensationType: sensation.sensationType,
              intensity: sensation.intensity,
              description: sensation.description,
            })),
          },
        },
        include: {
          bodySensations: true,
        },
      })

      return updatedCheckIn
    })

    return CheckInMapper.toDomain(updated)
  }

  /**
   * Obtiene estadísticas de check-ins de un usuario
   */
  async getUserStats(userId: string): Promise<{
    totalCheckIns: number
    averageDuration: number
    completionRate: number
  }> {
    // Total de check-ins completados
    const totalCheckIns = await this.prisma.checkIn.count({
      where: {
        userId,
        status: 'COMPLETED',
      },
    })

    // Check-ins con duración
    const checkInsWithDuration = await this.prisma.checkIn.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        duration: { not: null },
      },
      select: {
        duration: true,
        completionRate: true,
      },
    })

    // Calcular duración promedio
    const averageDuration =
      checkInsWithDuration.length > 0
        ? checkInsWithDuration.reduce((sum, checkIn) => sum + (checkIn.duration || 0), 0) /
          checkInsWithDuration.length
        : 0

    // Calcular completion rate promedio
    const averageCompletionRate =
      checkInsWithDuration.length > 0
        ? checkInsWithDuration.reduce(
            (sum, checkIn) => sum + (checkIn.completionRate || 0),
            0
          ) / checkInsWithDuration.length
        : 0

    return {
      totalCheckIns,
      averageDuration: Math.round(averageDuration),
      completionRate: Math.round(averageCompletionRate),
    }
  }
}
