/**
 * Psychologist Repository Interface
 *
 * Define las operaciones de persistencia para psicólogos.
 */

export type PsychologistData = {
  id: string
  email: string
  name: string
  code: string
  licenseNumber: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IPsychologistRepository {
  /**
   * Busca un psicólogo por su código único
   */
  findByCode(code: string): Promise<PsychologistData | null>

  /**
   * Busca un psicólogo por ID
   */
  findById(id: string): Promise<PsychologistData | null>

  /**
   * Busca un psicólogo por email
   */
  findByEmail(email: string): Promise<PsychologistData | null>
}
