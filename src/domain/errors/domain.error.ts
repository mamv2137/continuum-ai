/**
 * Errores de Dominio
 *
 * Representa violaciones de reglas de negocio.
 * Estos errores se lanzan en la capa de dominio cuando se violan invariantes.
 */

export class DomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DomainError'
  }
}

export class InvalidPhoneNumberError extends DomainError {
  constructor(phoneNumber: string) {
    super(`Número de teléfono inválido: ${phoneNumber}`)
    this.name = 'InvalidPhoneNumberError'
  }
}

export class CheckInAlreadyCompletedError extends DomainError {
  constructor(checkInId: string) {
    super(`El check-in ${checkInId} ya está completado`)
    this.name = 'CheckInAlreadyCompletedError'
  }
}

export class InsufficientCheckInDataError extends DomainError {
  constructor() {
    super('El check-in debe tener al menos una zona completada')
    this.name = 'InsufficientCheckInDataError'
  }
}

export class InvalidIntensityError extends DomainError {
  constructor(intensity: number) {
    super(`La intensidad debe estar entre 1 y 10. Recibido: ${intensity}`)
    this.name = 'InvalidIntensityError'
  }
}
