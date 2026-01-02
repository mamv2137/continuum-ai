/**
 * Constants for Continuum AI
 *
 * Configuración centralizada de constantes de la aplicación.
 */

export const APP_CONFIG = {
  name: 'Continuum AI',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
} as const

export const GESTALT_CONFIG = {
  // Número de sesiones previas a incluir como contexto para Gemini
  contextSessionsLimit: 5,

  // Tiempo máximo de inactividad antes de abandonar check-in (en minutos)
  sessionTimeoutMinutes: 30,

  // Número máximo de mensajes por check-in
  maxMessagesPerCheckIn: 50,
} as const

export const GEMINI_CONFIG = {
  model: 'gemini-2.5-flash',
  maxTokens: 1024,
  temperature: 0.7,

  // Safety settings
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
  ],
} as const

export const WHATSAPP_CONFIG = {
  // Timeout para esperar respuesta de Ycloud API (ms)
  apiTimeout: 10000,

  // Rate limiting: máximo de mensajes por usuario por minuto
  rateLimitPerMinute: 10,
} as const

export const DATABASE_CONFIG = {
  // Timeout para queries (ms)
  queryTimeout: 10000,

  // Pool size para Prisma
  connectionPoolSize: 10,
} as const

export const VALIDATION_CONFIG = {
  // Regex para validar números de teléfono
  phoneNumberRegex: /^\+\d{10,15}$/,

  // Longitud mínima de mensajes del usuario
  minMessageLength: 1,

  // Longitud máxima de mensajes del usuario
  maxMessageLength: 1000,
} as const

export const ERROR_MESSAGES = {
  // Errores de dominio
  INVALID_PHONE_NUMBER: 'Número de teléfono inválido',
  CHECK_IN_ALREADY_COMPLETED: 'El check-in ya está completado',
  INSUFFICIENT_CHECK_IN_DATA: 'El check-in debe tener al menos una zona completada',

  // Errores de aplicación
  USER_NOT_FOUND: 'Usuario no encontrado',
  CHECK_IN_NOT_FOUND: 'Check-in no encontrado',

  // Errores de infraestructura
  DATABASE_ERROR: 'Error de base de datos',
  AI_SERVICE_ERROR: 'Error del servicio de IA',
  WHATSAPP_SERVICE_ERROR: 'Error del servicio de WhatsApp',

  // Errores genéricos
  INTERNAL_ERROR: 'Error interno del servidor',
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Acceso prohibido',
} as const
