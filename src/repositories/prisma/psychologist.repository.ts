/**
 * Prisma Psychologist Repository
 *
 * Implementación de IPsychologistRepository usando Prisma.
 * NOTA: Ahora los psicólogos son Users con role PSYCHOLOGIST
 */

import type { PrismaClient } from '@/generated/client'
import type {
  IPsychologistRepository,
  PsychologistData,
} from '../interfaces/psychologist.repository.interface'

export class PrismaPsychologistRepository implements IPsychologistRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByCode(code: string): Promise<PsychologistData | null> {
    const psychologist = await this.prisma.user.findUnique({
      where: {
        psychologistCode: code.toUpperCase(), // Normalizar a mayúsculas
        role: 'PSYCHOLOGIST',
      },
    })

    if (!psychologist) return null

    // Mapear User a PsychologistData
    return {
      id: psychologist.id,
      email: psychologist.email || '',
      name: psychologist.name || '',
      licenseNumber: psychologist.licenseNumber || null,
      code: psychologist.psychologistCode || '',
      isActive: true, // Los Users activos siempre están activos
      createdAt: psychologist.createdAt,
      updatedAt: psychologist.updatedAt,
    }
  }

  async findById(id: string): Promise<PsychologistData | null> {
    const psychologist = await this.prisma.user.findFirst({
      where: {
        id,
        role: 'PSYCHOLOGIST',
      },
    })

    if (!psychologist) return null

    return {
      id: psychologist.id,
      email: psychologist.email || '',
      name: psychologist.name || '',
      licenseNumber: psychologist.licenseNumber || null,
      code: psychologist.psychologistCode || '',
      isActive: true,
      createdAt: psychologist.createdAt,
      updatedAt: psychologist.updatedAt,
    }
  }

  async findByEmail(email: string): Promise<PsychologistData | null> {
    const psychologist = await this.prisma.user.findFirst({
      where: {
        email,
        role: 'PSYCHOLOGIST',
      },
    })

    if (!psychologist) return null

    return {
      id: psychologist.id,
      email: psychologist.email || '',
      name: psychologist.name || '',
      licenseNumber: psychologist.licenseNumber || null,
      code: psychologist.psychologistCode || '',
      isActive: true,
      createdAt: psychologist.createdAt,
      updatedAt: psychologist.updatedAt,
    }
  }
}
