/**
 * User Repository Interface
 *
 * Define el contrato para persistir y recuperar usuarios.
 */

import { PhoneNumber } from '../../domain/value-objects/phone-number.vo'

export interface UserEntity {
  id: string
  phoneNumber: PhoneNumber
  name: string | null
  role: 'INDIVIDUAL' | 'PATIENT'
  onboardingDone: boolean
  onboardingStep: string | null
  termsAccepted: boolean
  termsAcceptedAt: Date | null
  hasPsychologist: boolean
  psychologistId: string | null
  psychologistName: string | null
  psychologistContact: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  totalCheckIns: number
  lastCheckInAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface IUserRepository {
  /**
   * Crea un nuevo usuario
   */
  create(data: {
    phoneNumber: PhoneNumber
    name?: string
    role?: 'INDIVIDUAL' | 'PATIENT'
    onboardingStep?: string
  }): Promise<UserEntity>

  /**
   * Encuentra un usuario por ID
   */
  findById(id: string): Promise<UserEntity | null>

  /**
   * Encuentra un usuario por número de teléfono
   */
  findByPhoneNumber(phoneNumber: PhoneNumber): Promise<UserEntity | null>

  /**
   * Actualiza un usuario
   */
  update(id: string, data: Partial<UserEntity>): Promise<UserEntity>

  /**
   * Actualiza el contador de check-ins del usuario
   */
  incrementCheckInCount(userId: string): Promise<void>

  /**
   * Actualiza la fecha del último check-in
   */
  updateLastCheckInDate(userId: string, date: Date): Promise<void>
}
