/**
 * CheckIn Mapper
 *
 * Convierte entre modelos de Prisma y entidades de dominio para CheckIn.
 */

import {
  CheckIn as PrismaCheckIn,
  BodySensation as PrismaBodySensation,
  SessionStatus as PrismaSessionStatus,
} from '@prisma/client'
import {
  CheckInEntity,
  SessionStatus,
  ChatMessage,
} from '../../../domain/entities/check-in.entity'
import { GestaltZone, GestaltZoneType } from '../../../domain/value-objects/gestalt-zone.vo'
import { EmotionalTone, EmotionalToneType } from '../../../domain/value-objects/emotional-tone.vo'

type PrismaCheckInWithSensations = PrismaCheckIn & {
  bodySensations?: PrismaBodySensation[]
}

export class CheckInMapper {
  /**
   * Convierte de Prisma CheckIn a Domain CheckInEntity
   */
  static toDomain(prismaCheckIn: PrismaCheckInWithSensations): CheckInEntity {
    // Convertir zonas de Gestalt
    const externalZone = prismaCheckIn.externalZone
      ? new GestaltZone(GestaltZoneType.EXTERNAL, prismaCheckIn.externalZone)
      : null

    const fantasyZone = prismaCheckIn.fantasyZone
      ? new GestaltZone(GestaltZoneType.FANTASY, prismaCheckIn.fantasyZone)
      : null

    // Convertir sensaciones corporales a zonas internas
    const internalZones: GestaltZone[] = []
    if (prismaCheckIn.bodySensations) {
      prismaCheckIn.bodySensations.forEach((sensation) => {
        const description = `${sensation.sensationType} en ${sensation.bodyPart}${
          sensation.description ? `: ${sensation.description}` : ''
        }`
        internalZones.push(new GestaltZone(GestaltZoneType.INTERNAL, description))
      })
    }

    // Convertir chat log
    const chatHistory: ChatMessage[] = []
    if (prismaCheckIn.rawChatLog && Array.isArray(prismaCheckIn.rawChatLog)) {
      prismaCheckIn.rawChatLog.forEach((msg: any) => {
        chatHistory.push({
          role: msg.role as 'user' | 'model',
          content: msg.content,
          timestamp: new Date(msg.timestamp),
        })
      })
    }

    // Convertir tono emocional
    const emotionalTone = prismaCheckIn.emotionalTone
      ? new EmotionalTone(prismaCheckIn.emotionalTone as EmotionalToneType)
      : null

    // Convertir status
    const status = this.mapPrismaStatusToDomain(prismaCheckIn.status)

    return new CheckInEntity(
      prismaCheckIn.id,
      prismaCheckIn.userId,
      status,
      externalZone,
      internalZones,
      fantasyZone,
      chatHistory,
      emotionalTone,
      prismaCheckIn.aiInsight,
      prismaCheckIn.createdAt,
      prismaCheckIn.completedAt
    )
  }

  /**
   * Convierte de Domain CheckInEntity a datos para Prisma (create)
   */
  static toPrismaCreate(checkIn: CheckInEntity): {
    id: string
    userId: string
    status: PrismaSessionStatus
    externalZone?: string
    fantasyZone?: string
    rawChatLog?: any
    emotionalTone?: string
    aiInsight?: string
    messageCount: number
    completionRate?: number
    duration?: number
    createdAt: Date
    completedAt?: Date
  } {
    const externalZone = checkIn.getExternalZone()
    const fantasyZone = checkIn.getFantasyZone()
    const emotionalTone = checkIn.getEmotionalTone()

    return {
      id: checkIn.getId(),
      userId: checkIn.getUserId(),
      status: this.mapDomainStatusToPrisma(checkIn.getStatus()),
      externalZone: externalZone?.getContent(),
      fantasyZone: fantasyZone?.getContent(),
      rawChatLog: checkIn.getChatHistory().map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
      })),
      emotionalTone: emotionalTone?.getTone(),
      aiInsight: checkIn.getAiInsight() || undefined,
      messageCount: checkIn.getMessageCount(),
      completionRate: checkIn.getCompletionRate(),
      duration: checkIn.getDuration() || undefined,
      createdAt: checkIn.getCreatedAt(),
      completedAt: checkIn.getCompletedAt() || undefined,
    }
  }

  /**
   * Convierte de Domain CheckInEntity a datos para Prisma (update)
   */
  static toPrismaUpdate(checkIn: CheckInEntity): {
    status: PrismaSessionStatus
    externalZone?: string
    fantasyZone?: string
    rawChatLog?: any
    emotionalTone?: string
    aiInsight?: string
    messageCount: number
    completionRate?: number
    duration?: number
    completedAt?: Date
  } {
    const externalZone = checkIn.getExternalZone()
    const fantasyZone = checkIn.getFantasyZone()
    const emotionalTone = checkIn.getEmotionalTone()

    return {
      status: this.mapDomainStatusToPrisma(checkIn.getStatus()),
      externalZone: externalZone?.getContent(),
      fantasyZone: fantasyZone?.getContent(),
      rawChatLog: checkIn.getChatHistory().map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
      })),
      emotionalTone: emotionalTone?.getTone(),
      aiInsight: checkIn.getAiInsight() || undefined,
      messageCount: checkIn.getMessageCount(),
      completionRate: checkIn.getCompletionRate(),
      duration: checkIn.getDuration() || undefined,
      completedAt: checkIn.getCompletedAt() || undefined,
    }
  }

  /**
   * Extrae body sensations de un CheckInEntity
   * (para crear registros separados en la tabla BodySensation)
   */
  static extractBodySensations(checkIn: CheckInEntity): Array<{
    bodyPart: string
    sensationType: string
    intensity?: number
    description?: string
  }> {
    const internalZones = checkIn.getInternalZones()
    const sensations: Array<{
      bodyPart: string
      sensationType: string
      intensity?: number
      description?: string
    }> = []

    internalZones.forEach((zone) => {
      const content = zone.getContent()

      // Intentar extraer bodyPart y sensationType del contenido
      // Formato esperado: "Presión en Pecho: descripción"
      const match = content.match(/(\w+)\s+en\s+(\w+)(?::\s+(.+))?/)

      if (match) {
        sensations.push({
          sensationType: match[1],
          bodyPart: match[2],
          description: match[3],
          intensity: 5, // Default, idealmente debería venir de los datos
        })
      } else {
        // Fallback: usar el contenido completo
        sensations.push({
          sensationType: 'Sensación',
          bodyPart: 'Cuerpo',
          description: content,
          intensity: 5,
        })
      }
    })

    return sensations
  }

  /**
   * Mapea SessionStatus de Prisma a Domain
   */
  private static mapPrismaStatusToDomain(status: PrismaSessionStatus): SessionStatus {
    switch (status) {
      case 'IN_PROGRESS':
        return SessionStatus.IN_PROGRESS
      case 'COMPLETED':
        return SessionStatus.COMPLETED
      case 'ABANDONED':
        return SessionStatus.ABANDONED
      default:
        return SessionStatus.IN_PROGRESS
    }
  }

  /**
   * Mapea SessionStatus de Domain a Prisma
   */
  private static mapDomainStatusToPrisma(status: SessionStatus): PrismaSessionStatus {
    switch (status) {
      case SessionStatus.IN_PROGRESS:
        return 'IN_PROGRESS'
      case SessionStatus.COMPLETED:
        return 'COMPLETED'
      case SessionStatus.ABANDONED:
        return 'ABANDONED'
      default:
        return 'IN_PROGRESS'
    }
  }
}
