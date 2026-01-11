/**
 * Tipos TypeScript de Continuum AI
 *
 * Exporta tipos derivados de Prisma y tipos personalizados para la app
 */

import { Prisma } from '@/generated/client'

// ==========================================
// TIPOS DERIVADOS DE PRISMA
// ==========================================

export type User = Prisma.UserGetPayload<{}>
export type UserWithAccount = Prisma.UserGetPayload<{
  include: { account: true }
}>
export type UserWithCheckIns = Prisma.UserGetPayload<{
  include: { checkIns: true }
}>
export type UserWithPsychologist = Prisma.UserGetPayload<{
  include: { psychologist: true }
}>

export type CheckIn = Prisma.CheckInGetPayload<{}>
export type CheckInWithSensations = Prisma.CheckInGetPayload<{
  include: { bodySensations: true }
}>
export type CheckInWithUser = Prisma.CheckInGetPayload<{
  include: { user: true }
}>
export type CheckInComplete = Prisma.CheckInGetPayload<{
  include: {
    user: true
    bodySensations: true
  }
}>

export type BodySensation = Prisma.BodySensationGetPayload<{}>

// NOTA: Los psicólogos ahora son Users con role: PSYCHOLOGIST
export type Psychologist = User // Alias para mantener compatibilidad
export type PsychologistWithPatients = Prisma.UserGetPayload<{
  include: { patients: true }
}>

// ==========================================
// TIPOS PARA GEMINI AI
// ==========================================

export type ChatMessage = {
  role: 'user' | 'model'
  content: string
  timestamp: string
}

export type GestaltZone = 'external' | 'internal' | 'fantasy'

export type CheckInAnalysis = {
  emotionalTone?: string
  completionRate: number
  insight?: string
  suggestedFollowUp?: string
}

// ==========================================
// TIPOS PARA WHATSAPP (YCLOUD)
// ==========================================

export type WhatsAppMessage = {
  from: string // Número de teléfono
  text: string
  timestamp: string
  messageId: string
}

export type WhatsAppWebhookPayload = {
  eventType: 'message.received' | 'message.delivered' | 'message.read'
  data: {
    from: string
    to: string
    message: {
      type: 'text' | 'image' | 'audio' | 'video'
      text?: {
        body: string
      }
    }
    timestamp: string
  }
}

// ==========================================
// TIPOS PARA DASHBOARD
// ==========================================

export type EmotionalTrend = {
  date: string
  tone: string
  count: number
}

export type BodyHeatMapData = {
  bodyPart: string
  intensity: number
  frequency: number
}

export type CheckInStats = {
  totalCheckIns: number
  averageDuration: number
  completionRate: number
  mostCommonTone: string
  streakDays: number
}

// ==========================================
// TIPOS DE RESPUESTA API
// ==========================================

export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type PaginatedResponse<T> = ApiResponse<{
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}>
