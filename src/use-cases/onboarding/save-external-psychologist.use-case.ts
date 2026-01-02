/**
 * Save External Psychologist Use Case
 *
 * Guarda información de un psicólogo externo (no registrado en Continuum).
 */

import type { IUserRepository } from '../../repositories/interfaces/user.repository.interface'

export type SaveExternalPsychologistInput = {
  userId: string
  name: string
  contact: string // Teléfono o email
}

export class SaveExternalPsychologistUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: SaveExternalPsychologistInput): Promise<void> {
    // Validar que el nombre no esté vacío
    if (!input.name.trim()) {
      throw new Error('El nombre del psicólogo es requerido')
    }

    // Validar que el contacto no esté vacío
    if (!input.contact.trim()) {
      throw new Error('El contacto del psicólogo es requerido')
    }

    // Guardar información
    await this.userRepository.update(input.userId, {
      hasPsychologist: true,
      psychologistName: input.name.trim(),
      psychologistContact: input.contact.trim(),

      // NO vincular con Psychologist (permanece null)
      // role permanece INDIVIDUAL (no es B2B2C)
    })

    console.log(
      `[ONBOARDING] User ${input.userId} saved external psychologist: ${input.name}`
    )
  }
}
