/**
 * WhatsApp Webhook API Route
 *
 * Recibe mensajes de WhatsApp vía Ycloud y procesa con el bot de Gestalt.
 *
 * POST /api/whatsapp/webhook
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { PrismaUserRepository } from '@/repositories/prisma/user.repository'
import { PrismaCheckInRepository } from '@/repositories/prisma/check-in.repository'
import { PrismaPsychologistRepository } from '@/repositories/prisma/psychologist.repository'
import { GestaltCoachService } from '@/services/ai/gestalt-coach.service'
import { GeminiService } from '@/services/ai/gemini.service'
import { WhatsAppService } from '@/services/messaging/whatsapp.service'
import { ProcessMessageUseCase } from '@/use-cases/check-in/process-message.use-case'
import { DomainError } from '@/domain/errors/domain.error'
import { YcloudWebhookValidator } from '@/lib/ycloud-webhook-validator'

/**
 * POST handler - Recibe mensajes de WhatsApp
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validar firma del webhook (si está configurado YCLOUD_WEBHOOK_SECRET)
    if (process.env.YCLOUD_WEBHOOK_SECRET) {
      const signature = request.headers.get('X-YCloud-Signature')
      const timestamp = request.headers.get('X-YCloud-Timestamp')

      // Clonar el request para poder leer el body dos veces
      const bodyText = await request.text()

      const validator = new YcloudWebhookValidator(process.env.YCLOUD_WEBHOOK_SECRET)
      const validationResult = validator.validateSignature(signature, bodyText, timestamp || undefined)

      if (!validationResult.valid) {
        console.error('🔒 Validación de firma falló:', validationResult.error)
        return NextResponse.json(
          { success: false, error: 'Invalid webhook signature' },
          { status: 401 }
        )
      }

      console.log('🔒 Firma del webhook validada correctamente')

      // Re-parsear el body desde el texto
      const body = JSON.parse(bodyText)
      return processWebhook(body)
    }

    // Si no hay secret configurado, procesar sin validación (solo desarrollo)
    const body = await request.json()
    return processWebhook(body)
  } catch (error) {
    console.error('❌ Error en webhook de WhatsApp:', error)

    // Manejo de errores específicos
    if (error instanceof DomainError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      )
    }

    // Error genérico
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

/**
 * Procesa el webhook después de validar la firma
 */
async function processWebhook(body: any) {
  try {
    console.log('📥 Webhook recibido:', JSON.stringify(body, null, 2))

    // 2. Validar que es un mensaje de texto
    if (!isValidTextMessage(body)) {
      return NextResponse.json(
        { success: false, error: 'Invalid message format' },
        { status: 400 }
      )
    }

    // 3. Extraer datos del mensaje
    const phoneNumber = extractPhoneNumber(body)
    const messageText = extractMessageText(body)

    if (!phoneNumber || !messageText) {
      return NextResponse.json(
        { success: false, error: 'Missing phone number or message' },
        { status: 400 }
      )
    }

    console.log(`📱 Mensaje de ${phoneNumber}: "${messageText}"`)

    // 4. Inicializar servicios
    const userRepo = new PrismaUserRepository(prisma)
    const checkInRepo = new PrismaCheckInRepository(prisma)
    const psychologistRepo = new PrismaPsychologistRepository(prisma)
    const gestaltCoach = new GestaltCoachService()

    // Validar que GEMINI_API_KEY exista
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY no está configurada')
    }

    const geminiService = new GeminiService(process.env.GEMINI_API_KEY)

    // 5. Crear y ejecutar caso de uso
    const processMessageUseCase = new ProcessMessageUseCase(
      userRepo,
      checkInRepo,
      psychologistRepo,
      gestaltCoach,
      geminiService
    )

    const result = await processMessageUseCase.execute({
      phoneNumber,
      message: messageText,
    })

    console.log(`✅ Respuesta generada para ${phoneNumber}`)
    console.log(`   - Nuevo usuario: ${result.isNewUser}`)
    console.log(`   - Nuevo check-in: ${result.isNewCheckIn}`)
    console.log(`   - Check-in ID: ${result.checkInId}`)

    // 6. Enviar respuesta vía WhatsApp
    if (process.env.YCLOUD_API_KEY) {
      const whatsappService = new WhatsAppService(process.env.YCLOUD_API_KEY)

      const sendResult = await whatsappService.sendMessage({
        to: phoneNumber,
        message: result.response,
      })

      if (sendResult.success) {
        console.log(`📤 Mensaje enviado exitosamente. ID: ${sendResult.messageId}`)
      } else {
        console.error(`❌ Error al enviar mensaje: ${sendResult.error}`)
        // No fallar el webhook si falla el envío, solo loguear
      }
    } else {
      console.warn('⚠️  YCLOUD_API_KEY no configurada. Mensaje no enviado.')
      console.log(`📤 Respuesta que se enviaría: "${result.response}"`)
    }

    // 7. Retornar éxito
    return NextResponse.json({
      success: true,
      data: {
        checkInId: result.checkInId,
        isNewUser: result.isNewUser,
        isNewCheckIn: result.isNewCheckIn,
        // No incluir el response en producción por privacidad
        ...(process.env.NODE_ENV === 'development' && {
          response: result.response,
        }),
      },
    })
  } catch (error) {
    console.error('❌ Error procesando webhook:', error)

    // Manejo de errores específicos
    if (error instanceof DomainError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      )
    }

    // Error genérico
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET handler - Verificación del webhook (para Ycloud)
 */
export async function GET(request: NextRequest) {
  // Ycloud puede hacer un GET para verificar que el webhook está activo
  const searchParams = request.nextUrl.searchParams
  const challenge = searchParams.get('challenge')

  if (challenge) {
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({
    status: 'ok',
    webhook: 'active',
  })
}

/**
 * Valida que el mensaje sea de texto y tenga el formato correcto
 */
function isValidTextMessage(body: any): boolean {
  // Formato de Ycloud:
  // {
  //   type: 'whatsapp.inbound_message.received',
  //   whatsappInboundMessage: {
  //     type: 'text',
  //     text: { body: '...' }
  //   }
  // }
  return (
    body &&
    body.type === 'whatsapp.inbound_message.received' &&
    body.whatsappInboundMessage &&
    body.whatsappInboundMessage.type === 'text' &&
    body.whatsappInboundMessage.text &&
    body.whatsappInboundMessage.text.body
  )
}

/**
 * Extrae el número de teléfono del webhook
 */
function extractPhoneNumber(body: any): string | null {
  // Formato de Ycloud: whatsappInboundMessage.from
  return body.whatsappInboundMessage?.from || null
}

/**
 * Extrae el texto del mensaje
 */
function extractMessageText(body: any): string | null {
  // Formato de Ycloud: whatsappInboundMessage.text.body
  return body.whatsappInboundMessage?.text?.body || null
}
