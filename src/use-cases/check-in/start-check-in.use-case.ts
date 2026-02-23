/**
 * Start CheckIn Use Case
 *
 * Inicia una nueva sesión de check-in para un usuario.
 * Si el usuario ya tiene un check-in activo, lo retorna en lugar de crear uno nuevo.
 */

import { CheckInEntity, SessionStatus } from '../../domain/entities/check-in.entity'
import { ICheckInRepository } from '../../repositories/interfaces/check-in.repository.interface'
import { IUserRepository } from '../../repositories/interfaces/user.repository.interface'
import { PhoneNumber } from '../../domain/value-objects/phone-number.vo'

export type StartCheckInInput = {
  phoneNumber: string
}

export type StartCheckInOutput = {
  checkIn: CheckInEntity
  isNewSession: boolean
  welcomeMessage: string
}

export class StartCheckInUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly checkInRepository: ICheckInRepository
  ) {}

  async execute(input: StartCheckInInput): Promise<StartCheckInOutput> {
    // 1. Validar y crear PhoneNumber Value Object
    const phoneNumber = new PhoneNumber(input.phoneNumber)

    // 2. Buscar o crear usuario
    let user = await this.userRepository.findByPhoneNumber(phoneNumber)

    if (!user) {
      // Generar email a partir del teléfono para usuarios de WhatsApp
      const phoneClean = phoneNumber.getValue().replace(/\+/g, '')
      const generatedEmail = `${phoneClean}@wa.continuum.local`

      user = await this.userRepository.create({
        phoneNumber,
        email: generatedEmail,
        role: 'INDIVIDUAL',
      })
    }

    // 3. Verificar si ya tiene un check-in activo
    const activeCheckIn = await this.checkInRepository.findActiveByUserId(user.id)

    if (activeCheckIn) {
      return {
        checkIn: activeCheckIn,
        isNewSession: false,
        welcomeMessage: '¡Hola de nuevo! Continuemos con tu check-in.',
      }
    }

    // 4. Crear nuevo check-in
    const newCheckIn = new CheckInEntity(
      crypto.randomUUID(),
      user.id,
      SessionStatus.IN_PROGRESS
    )

    // 5. Agregar mensaje de bienvenida al chat
    newCheckIn.addMessage(
      'model',
      this.getWelcomeMessage(user.name, user.onboardingDone)
    )

    // 6. Persistir
    const savedCheckIn = await this.checkInRepository.create(newCheckIn)

    return {
      checkIn: savedCheckIn,
      isNewSession: true,
      welcomeMessage: this.getWelcomeMessage(user.name, user.onboardingDone),
    }
  }

  private getWelcomeMessage(name: string | null, onboardingDone: boolean): string {
    if (!onboardingDone) {
      return `¡Bienvenido/a a Continuum! 🌱

Soy tu asistente de check-in basado en Terapia Gestalt. Mi objetivo es ayudarte a conectar con el momento presente a través de tres aspectos:

1. **Lo que percibes** (tus sentidos)
2. **Lo que sientes en tu cuerpo** (sensaciones físicas)
3. **Lo que piensas** (tus pensamientos)

No estoy aquí para diagnosticar o dar consejos, sino para acompañarte en tu proceso de autoconocimiento.

¿Cómo te sientes en este momento?`
    }

    const greeting = name ? `¡Hola ${name}!` : '¡Hola!'
    return `${greeting} 👋

¿Cómo te sientes en este momento?`
  }
}
