/**
 * Phone Number Value Object
 *
 * Representa un número de teléfono válido para WhatsApp.
 * Formato esperado: +[código país][número]
 * Ejemplo: +5215512345678
 */

import { InvalidPhoneNumberError } from '../errors/domain.error'

export class PhoneNumber {
  private readonly value: string

  constructor(phoneNumber: string) {
    this.validate(phoneNumber)
    this.value = this.normalize(phoneNumber)
  }

  private validate(phoneNumber: string): void {
    // Debe comenzar con +
    if (!phoneNumber.startsWith('+')) {
      throw new InvalidPhoneNumberError(phoneNumber)
    }

    // Debe tener al menos 10 dígitos (sin contar el +)
    const digitsOnly = phoneNumber.slice(1).replace(/\D/g, '')
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      throw new InvalidPhoneNumberError(phoneNumber)
    }

    // Solo debe contener + y dígitos
    if (!/^\+\d+$/.test(phoneNumber)) {
      throw new InvalidPhoneNumberError(phoneNumber)
    }
  }

  private normalize(phoneNumber: string): string {
    // Remover espacios o caracteres especiales, mantener solo + y dígitos
    return phoneNumber.replace(/[^\d+]/g, '')
  }

  getValue(): string {
    return this.value
  }

  equals(other: PhoneNumber): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
