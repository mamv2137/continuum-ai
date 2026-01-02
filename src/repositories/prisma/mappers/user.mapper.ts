/**
 * User Mapper
 *
 * Convierte entre modelos de Prisma y entidades de dominio para User.
 */

import { User as PrismaUser, UserRole as PrismaUserRole } from '@/generated/client'
import { UserEntity } from '../../interfaces/user.repository.interface'
import { PhoneNumber } from '../../../domain/value-objects/phone-number.vo'

export class UserMapper {
  /**
   * Convierte de Prisma User a Domain UserEntity
   */
  static toDomain(prismaUser: PrismaUser): UserEntity {
    // Cast to any to access new fields until TypeScript Language Server refreshes
    const user = prismaUser as any

    return {
      id: prismaUser.id,
      phoneNumber: new PhoneNumber(prismaUser.phoneNumber),
      name: prismaUser.name,
      role: prismaUser.role as 'INDIVIDUAL' | 'PATIENT',
      onboardingDone: prismaUser.onboardingDone,
      onboardingStep: user.onboardingStep,
      termsAccepted: prismaUser.termsAccepted,
      termsAcceptedAt: prismaUser.termsAcceptedAt,
      hasPsychologist: user.hasPsychologist,
      psychologistId: prismaUser.psychologistId,
      psychologistName: user.psychologistName,
      psychologistContact: user.psychologistContact,
      emergencyContactName: user.emergencyContactName,
      emergencyContactPhone: user.emergencyContactPhone,
      totalCheckIns: prismaUser.totalCheckIns,
      lastCheckInAt: prismaUser.lastCheckInAt,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    }
  }

  /**
   * Convierte de Domain UserEntity a datos para Prisma
   * (usado en create/update)
   */
  static toPrismaCreate(data: {
    phoneNumber: PhoneNumber
    name?: string
    role?: 'INDIVIDUAL' | 'PATIENT'
    onboardingStep?: string
  }): {
    phoneNumber: string
    name?: string
    role?: PrismaUserRole
    onboardingStep?: string
  } {
    return {
      phoneNumber: data.phoneNumber.getValue(),
      name: data.name,
      role: data.role as PrismaUserRole,
      onboardingStep: data.onboardingStep,
    }
  }

  /**
   * Convierte datos de actualización a formato Prisma
   */
  static toPrismaUpdate(
    data: Partial<Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>>
  ): Partial<PrismaUser> {
    const prismaData: any = {}

    if (data.phoneNumber) {
      prismaData.phoneNumber = data.phoneNumber.getValue()
    }

    if (data.name !== undefined) {
      prismaData.name = data.name
    }

    if (data.role) {
      prismaData.role = data.role as PrismaUserRole
    }

    if (data.onboardingDone !== undefined) {
      prismaData.onboardingDone = data.onboardingDone
    }

    if (data.onboardingStep !== undefined) {
      prismaData.onboardingStep = data.onboardingStep
    }

    if (data.termsAccepted !== undefined) {
      prismaData.termsAccepted = data.termsAccepted
    }

    if (data.hasPsychologist !== undefined) {
      prismaData.hasPsychologist = data.hasPsychologist
    }

    if (data.psychologistId !== undefined) {
      prismaData.psychologistId = data.psychologistId
    }

    if (data.psychologistName !== undefined) {
      prismaData.psychologistName = data.psychologistName
    }

    if (data.psychologistContact !== undefined) {
      prismaData.psychologistContact = data.psychologistContact
    }

    if (data.emergencyContactName !== undefined) {
      prismaData.emergencyContactName = data.emergencyContactName
    }

    if (data.emergencyContactPhone !== undefined) {
      prismaData.emergencyContactPhone = data.emergencyContactPhone
    }

    if (data.termsAcceptedAt !== undefined) {
      prismaData.termsAcceptedAt = data.termsAcceptedAt
    }

    return prismaData
  }
}
