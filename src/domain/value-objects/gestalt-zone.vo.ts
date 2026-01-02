/**
 * Gestalt Zone Value Object
 *
 * Representa las 3 zonas de la Terapia Gestalt.
 * Cada zona tiene un propósito específico en el proceso de awareness.
 */

export enum GestaltZoneType {
  EXTERNAL = 'external', // Zona Externa: sentidos (ver, oír, tocar, oler, saborear)
  INTERNAL = 'internal', // Zona Interna: sensaciones corporales (presión, calor, nudos)
  FANTASY = 'fantasy',   // Zona de Fantasía: pensamientos, juicios, interpretaciones
}

export class GestaltZone {
  private readonly type: GestaltZoneType
  private readonly content: string

  constructor(type: GestaltZoneType, content: string) {
    this.type = type
    this.content = content.trim()
  }

  getType(): GestaltZoneType {
    return this.type
  }

  getContent(): string {
    return this.content
  }

  isEmpty(): boolean {
    return this.content.length === 0
  }

  /**
   * Detecta si el contenido contiene palabras que indican intelectualización
   * (señal de que el usuario está en la zona de fantasía cuando debería estar en interna)
   */
  hasIntellectualizationMarkers(): boolean {
    const markers = [
      'porque',
      'creo que',
      'pienso que',
      'debe ser',
      'supongo',
      'imagino que',
      'tal vez',
      'probablemente',
    ]

    const lowerContent = this.content.toLowerCase()
    return markers.some((marker) => lowerContent.includes(marker))
  }

  /**
   * Detecta si el contenido describe sensaciones corporales
   */
  hasSomaticMarkers(): boolean {
    const markers = [
      'siento',
      'noto',
      'percibo',
      'en mi cuerpo',
      'en el pecho',
      'en el estómago',
      'en la garganta',
      'tensión',
      'presión',
      'calor',
      'frío',
      'nudo',
      'peso',
    ]

    const lowerContent = this.content.toLowerCase()
    return markers.some((marker) => lowerContent.includes(marker))
  }

  toString(): string {
    return `[${this.type}] ${this.content}`
  }
}
