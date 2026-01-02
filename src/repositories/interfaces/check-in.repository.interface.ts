/**
 * CheckIn Repository Interface
 *
 * Define el contrato para persistir y recuperar CheckIns.
 * Las implementaciones concretas pueden usar Prisma, otro ORM, o incluso in-memory.
 */

import { CheckInEntity } from '../../domain/entities/check-in.entity'

export interface ICheckInRepository {
  /**
   * Crea un nuevo check-in
   */
  create(checkIn: CheckInEntity): Promise<CheckInEntity>

  /**
   * Encuentra un check-in por ID
   */
  findById(id: string): Promise<CheckInEntity | null>

  /**
   * Encuentra el check-in activo (IN_PROGRESS) de un usuario
   */
  findActiveByUserId(userId: string): Promise<CheckInEntity | null>

  /**
   * Encuentra todos los check-ins de un usuario
   */
  findByUserId(userId: string, limit?: number): Promise<CheckInEntity[]>

  /**
   * Actualiza un check-in existente
   */
  update(checkIn: CheckInEntity): Promise<CheckInEntity>

  /**
   * Obtiene estadísticas de check-ins de un usuario
   */
  getUserStats(userId: string): Promise<{
    totalCheckIns: number
    averageDuration: number
    completionRate: number
  }>
}
