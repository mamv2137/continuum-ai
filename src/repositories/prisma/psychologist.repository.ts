/**
 * Prisma Psychologist Repository
 *
 * Implementación de IPsychologistRepository usando Prisma.
 */

import type { PrismaClient } from '@prisma/client'
import type {
  IPsychologistRepository,
  PsychologistData,
} from '../interfaces/psychologist.repository.interface'

export class PrismaPsychologistRepository implements IPsychologistRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByCode(code: string): Promise<PsychologistData | null> {
    const psychologist = await this.prisma.psychologist.findUnique({
      where: { code: code.toLowerCase() }, // Normalizar a minúsculas
    })

    return psychologist
  }

  async findById(id: string): Promise<PsychologistData | null> {
    const psychologist = await this.prisma.psychologist.findUnique({
      where: { id },
    })

    return psychologist
  }

  async findByEmail(email: string): Promise<PsychologistData | null> {
    const psychologist = await this.prisma.psychologist.findUnique({
      where: { email },
    })

    return psychologist
  }
}
