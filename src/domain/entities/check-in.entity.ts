/**
 * CheckIn Entity
 *
 * Representa una sesión de check-in del usuario con el bot de Gestalt.
 * Contiene las reglas de negocio relacionadas con las sesiones.
 */

import {
  CheckInAlreadyCompletedError,
  InsufficientCheckInDataError,
} from '../errors/domain.error'
import { GestaltZone, GestaltZoneType } from '../value-objects/gestalt-zone.vo'
import { EmotionalTone } from '../value-objects/emotional-tone.vo'

export enum SessionStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

export type ChatMessage = {
  role: 'user' | 'model'
  content: string
  timestamp: Date
}

export class CheckInEntity {
  constructor(
    private readonly id: string,
    private readonly userId: string,
    private status: SessionStatus,
    private externalZone: GestaltZone | null = null,
    private internalZones: GestaltZone[] = [],
    private fantasyZone: GestaltZone | null = null,
    private chatHistory: ChatMessage[] = [],
    private emotionalTone: EmotionalTone | null = null,
    private aiInsight: string | null = null,
    private readonly createdAt: Date = new Date(),
    private completedAt: Date | null = null
  ) {}

  // ==========================================
  // GETTERS
  // ==========================================

  getId(): string {
    return this.id
  }

  getUserId(): string {
    return this.userId
  }

  getStatus(): SessionStatus {
    return this.status
  }

  getExternalZone(): GestaltZone | null {
    return this.externalZone
  }

  getInternalZones(): GestaltZone[] {
    return this.internalZones
  }

  getFantasyZone(): GestaltZone | null {
    return this.fantasyZone
  }

  getChatHistory(): ChatMessage[] {
    return this.chatHistory
  }

  getEmotionalTone(): EmotionalTone | null {
    return this.emotionalTone
  }

  getAiInsight(): string | null {
    return this.aiInsight
  }

  getCreatedAt(): Date {
    return this.createdAt
  }

  getCompletedAt(): Date | null {
    return this.completedAt
  }

  // ==========================================
  // REGLAS DE NEGOCIO
  // ==========================================

  /**
   * Agrega un mensaje a la conversación
   */
  addMessage(role: 'user' | 'model', content: string): void {
    if (this.status === SessionStatus.COMPLETED) {
      throw new CheckInAlreadyCompletedError(this.id)
    }

    this.chatHistory.push({
      role,
      content,
      timestamp: new Date(),
    })
  }

  /**
   * Establece la zona externa (sentidos)
   */
  setExternalZone(zone: GestaltZone): void {
    if (this.status === SessionStatus.COMPLETED) {
      throw new CheckInAlreadyCompletedError(this.id)
    }

    if (zone.getType() !== GestaltZoneType.EXTERNAL) {
      throw new Error('La zona debe ser de tipo EXTERNAL')
    }

    this.externalZone = zone
  }

  /**
   * Agrega una zona interna (sensaciones corporales)
   */
  addInternalZone(zone: GestaltZone): void {
    if (this.status === SessionStatus.COMPLETED) {
      throw new CheckInAlreadyCompletedError(this.id)
    }

    if (zone.getType() !== GestaltZoneType.INTERNAL) {
      throw new Error('La zona debe ser de tipo INTERNAL')
    }

    this.internalZones.push(zone)
  }

  /**
   * Establece la zona de fantasía (pensamientos)
   */
  setFantasyZone(zone: GestaltZone): void {
    if (this.status === SessionStatus.COMPLETED) {
      throw new CheckInAlreadyCompletedError(this.id)
    }

    if (zone.getType() !== GestaltZoneType.FANTASY) {
      throw new Error('La zona debe ser de tipo FANTASY')
    }

    this.fantasyZone = zone
  }

  /**
   * Establece el tono emocional detectado por IA
   */
  setEmotionalTone(tone: EmotionalTone): void {
    this.emotionalTone = tone
  }

  /**
   * Establece el insight generado por IA
   */
  setAiInsight(insight: string): void {
    this.aiInsight = insight
  }

  /**
   * Completa el check-in
   * Regla de negocio: Debe tener al menos una zona completada
   */
  complete(): void {
    if (this.status === SessionStatus.COMPLETED) {
      throw new CheckInAlreadyCompletedError(this.id)
    }

    if (!this.hasAtLeastOneZoneCompleted()) {
      throw new InsufficientCheckInDataError()
    }

    this.status = SessionStatus.COMPLETED
    this.completedAt = new Date()
  }

  /**
   * Abandona el check-in
   */
  abandon(): void {
    if (this.status === SessionStatus.COMPLETED) {
      throw new CheckInAlreadyCompletedError(this.id)
    }

    this.status = SessionStatus.ABANDONED
    this.completedAt = new Date()
  }

  /**
   * Verifica si el check-in tiene al menos una zona completada
   */
  hasAtLeastOneZoneCompleted(): boolean {
    return (
      (this.externalZone !== null && !this.externalZone.isEmpty()) ||
      this.internalZones.length > 0 ||
      (this.fantasyZone !== null && !this.fantasyZone.isEmpty())
    )
  }

  /**
   * Calcula el porcentaje de completitud (0-100)
   */
  getCompletionRate(): number {
    let completed = 0
    const total = 3 // 3 zonas

    if (this.externalZone !== null && !this.externalZone.isEmpty()) completed++
    if (this.internalZones.length > 0) completed++
    if (this.fantasyZone !== null && !this.fantasyZone.isEmpty()) completed++

    return Math.round((completed / total) * 100)
  }

  /**
   * Obtiene la duración de la sesión en segundos
   */
  getDuration(): number | null {
    if (!this.completedAt) return null

    const durationMs = this.completedAt.getTime() - this.createdAt.getTime()
    return Math.floor(durationMs / 1000)
  }

  /**
   * Cuenta el número de mensajes en el chat
   */
  getMessageCount(): number {
    return this.chatHistory.length
  }
}
