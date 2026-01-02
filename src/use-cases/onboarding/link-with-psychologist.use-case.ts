/**
 * Link With Psychologist Use Case
 *
 * Vincula un usuario con un psicólogo registrado usando su código.
 */

import type { IUserRepository } from '../../repositories/interfaces/user.repository.interface'
import type { IPsychologistRepository } from '../../repositories/interfaces/psychologist.repository.interface'
import { UserRole } from '@prisma/client'

export type LinkWithPsychologistInput = {
  userId: string
  code: string
}

export type LinkWithPsychologistOutput = {
  success: boolean
  psychologist?: {
    id: string
    name: string
    email: string
  }
  error?: string
}

export class LinkWithPsychologistUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly psychologistRepository: IPsychologistRepository
  ) {}

  async execute(
    input: LinkWithPsychologistInput
  ): Promise<LinkWithPsychologistOutput> {
    // 1. Validar formato del código
    if (!this.isValidCodeFormat(input.code)) {
      return {
        success: false,
        error: 'El código tiene un formato inválido',
      }
    }

    // 2. Buscar psicólogo por código
    const psychologist = await this.psychologistRepository.findByCode(
      input.code.toLowerCase()
    )

    if (!psychologist) {
      return {
        success: false,
        error: 'Código no encontrado. Verifica que esté bien escrito.',
      }
    }

    // 3. Verificar que el psicólogo esté activo
    if (!psychologist.isActive) {
      return {
        success: false,
        error: 'Este psicólogo no está disponible actualmente.',
      }
    }

    // 4. Vincular usuario con psicólogo
    await this.userRepository.update(input.userId, {
      hasPsychologist: true,
      psychologistId: psychologist.id,
      role: UserRole.PATIENT, // Ahora es paciente B2B2C

      // Limpiar datos de psicólogo externo si existían
      psychologistName: null,
      psychologistContact: null,
    })

    // 5. Log para auditoría
    console.log(
      `[ONBOARDING] User ${input.userId} linked with psychologist ${psychologist.id} (code: ${input.code})`
    )

    return {
      success: true,
      psychologist: {
        id: psychologist.id,
        name: psychologist.name,
        email: psychologist.email,
      },
    }
  }

  private isValidCodeFormat(code: string): boolean {
    return /^[a-z0-9_-]{5,30}$/.test(code)
  }
}
