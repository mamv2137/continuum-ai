/**
 * Prisma User Repository
 *
 * Implementación del repositorio de usuarios usando Prisma.
 */

import { PrismaClient } from '@/generated/client'
import { IUserRepository, UserEntity } from '../interfaces/user.repository.interface'
import { PhoneNumber } from '../../domain/value-objects/phone-number.vo'
import { UserMapper } from './mappers/user.mapper'

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Crea un nuevo usuario
   */
  async create(data: {
    phoneNumber?: PhoneNumber
    email: string
    name?: string
    role?: 'INDIVIDUAL' | 'PATIENT' | 'PSYCHOLOGIST'
  }): Promise<UserEntity> {
    const prismaData = UserMapper.toPrismaCreate(data)

    const createdUser = await this.prisma.user.create({
      data: prismaData,
    })

    return UserMapper.toDomain(createdUser)
  }

  /**
   * Encuentra un usuario por ID
   */
  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) return null

    return UserMapper.toDomain(user)
  }

  /**
   * Encuentra un usuario por número de teléfono
   */
  async findByPhoneNumber(phoneNumber: PhoneNumber): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber: phoneNumber.getValue() },
    })

    if (!user) return null

    return UserMapper.toDomain(user)
  }

  /**
   * Actualiza un usuario
   */
  async update(
    id: string,
    data: Partial<Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<UserEntity> {
    const prismaData = UserMapper.toPrismaUpdate(data)

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: prismaData,
    })

    return UserMapper.toDomain(updatedUser)
  }

  /**
   * Incrementa el contador de check-ins del usuario
   */
  async incrementCheckInCount(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        totalCheckIns: { increment: 1 },
      },
    })
  }

  /**
   * Actualiza la fecha del último check-in
   */
  async updateLastCheckInDate(userId: string, date: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lastCheckInAt: date,
      },
    })
  }
}
