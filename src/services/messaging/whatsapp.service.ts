/**
 * WhatsApp Service (Ycloud)
 *
 * Cliente para enviar mensajes de WhatsApp via Ycloud API.
 * Documentación: https://docs.ycloud.com/
 */

import { WHATSAPP_CONFIG } from '../../config/constants'

export type SendMessageInput = {
  to: string // Número de teléfono en formato +[código][número]
  message: string
}

export type SendMessageOutput = {
  success: boolean
  messageId?: string
  error?: string
}

export class WhatsAppService {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string, baseUrl: string = 'https://api.ycloud.com/v2') {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  /**
   * Envía un mensaje de texto por WhatsApp
   */
  async sendMessage(input: SendMessageInput): Promise<SendMessageOutput> {
    try {
      // Validar número de teléfono
      if (!this.isValidPhoneNumber(input.to)) {
        return {
          success: false,
          error: 'Número de teléfono inválido',
        }
      }

      // Construir payload para Ycloud
      const payload = {
        to: input.to,
        type: 'text',
        text: {
          body: input.message,
        },
      }

      console.log(`📤 Enviando mensaje a ${input.to}...`)

      // Hacer request a Ycloud API
      const response = await fetch(`${this.baseUrl}/whatsapp/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(WHATSAPP_CONFIG.apiTimeout),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Error de Ycloud API:', errorData)

        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      const data = await response.json()

      console.log(`✅ Mensaje enviado exitosamente. ID: ${data.id || 'N/A'}`)

      return {
        success: true,
        messageId: data.id || data.messageId,
      }
    } catch (error) {
      console.error('❌ Error al enviar mensaje de WhatsApp:', error)

      if (error instanceof Error) {
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: false,
        error: 'Error desconocido al enviar mensaje',
      }
    }
  }

  /**
   * Envía múltiples mensajes (para respuestas largas)
   * WhatsApp tiene límite de caracteres por mensaje
   */
  async sendLongMessage(to: string, message: string): Promise<SendMessageOutput> {
    const maxLength = 4096 // Límite de WhatsApp

    // Si el mensaje es corto, enviar directamente
    if (message.length <= maxLength) {
      return this.sendMessage({ to, message })
    }

    // Dividir mensaje en partes
    const parts = this.splitMessage(message, maxLength)

    console.log(`📤 Enviando mensaje largo en ${parts.length} partes...`)

    // Enviar cada parte secuencialmente
    for (let i = 0; i < parts.length; i++) {
      const result = await this.sendMessage({
        to,
        message: parts[i],
      })

      if (!result.success) {
        return {
          success: false,
          error: `Error en parte ${i + 1}/${parts.length}: ${result.error}`,
        }
      }

      // Pequeña pausa entre mensajes para no saturar
      if (i < parts.length - 1) {
        await this.sleep(1000)
      }
    }

    return {
      success: true,
      messageId: 'multiple',
    }
  }

  /**
   * Valida que el número de teléfono tenga formato correcto
   */
  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Debe empezar con + y tener 10-15 dígitos
    return /^\+\d{10,15}$/.test(phoneNumber)
  }

  /**
   * Divide un mensaje largo en partes respetando saltos de línea
   */
  private splitMessage(message: string, maxLength: number): string[] {
    const parts: string[] = []
    let currentPart = ''

    const lines = message.split('\n')

    for (const line of lines) {
      // Si agregar esta línea excede el límite
      if ((currentPart + line + '\n').length > maxLength) {
        // Guardar parte actual si no está vacía
        if (currentPart.trim()) {
          parts.push(currentPart.trim())
          currentPart = ''
        }

        // Si la línea sola excede el límite, dividirla
        if (line.length > maxLength) {
          const lineChunks = this.splitLine(line, maxLength)
          parts.push(...lineChunks.slice(0, -1))
          currentPart = lineChunks[lineChunks.length - 1] + '\n'
        } else {
          currentPart = line + '\n'
        }
      } else {
        currentPart += line + '\n'
      }
    }

    // Agregar última parte
    if (currentPart.trim()) {
      parts.push(currentPart.trim())
    }

    return parts
  }

  /**
   * Divide una línea muy larga en chunks
   */
  private splitLine(line: string, maxLength: number): string[] {
    const chunks: string[] = []
    let remaining = line

    while (remaining.length > maxLength) {
      // Buscar último espacio antes del límite
      let splitAt = remaining.lastIndexOf(' ', maxLength)

      if (splitAt === -1) {
        splitAt = maxLength
      }

      chunks.push(remaining.substring(0, splitAt))
      remaining = remaining.substring(splitAt).trim()
    }

    if (remaining) {
      chunks.push(remaining)
    }

    return chunks
  }

  /**
   * Utilidad para pausar ejecución
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Verifica que el webhook de Ycloud está configurado correctamente
   */
  async verifyWebhook(webhookUrl: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      })

      if (response.ok) {
        return { valid: true }
      }

      return {
        valid: false,
        error: `Webhook returned ${response.status}`,
      }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}
