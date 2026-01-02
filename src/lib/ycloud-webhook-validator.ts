/**
 * Ycloud Webhook Signature Validator
 *
 * Valida que los webhooks realmente provienen de Ycloud usando HMAC SHA256.
 * Documentación: https://docs.ycloud.com/reference/webhooks-security
 */

import { createHmac } from 'crypto'

export type WebhookValidationResult = {
  valid: boolean
  error?: string
}

export class YcloudWebhookValidator {
  private webhookSecret: string

  constructor(webhookSecret: string) {
    if (!webhookSecret) {
      throw new Error('YCLOUD_WEBHOOK_SECRET is required for webhook validation')
    }
    this.webhookSecret = webhookSecret
  }

  /**
   * Valida la firma del webhook de Ycloud
   *
   * @param signature - Header X-YCloud-Signature del request
   * @param body - Body raw del request (string)
   * @param timestamp - Timestamp del request (opcional, para prevenir replay attacks)
   * @returns WebhookValidationResult
   */
  validateSignature(
    signature: string | null,
    body: string,
    timestamp?: string
  ): WebhookValidationResult {
    // 1. Verificar que la firma existe
    if (!signature) {
      return {
        valid: false,
        error: 'Missing X-YCloud-Signature header',
      }
    }

    // 2. Generar firma esperada
    const expectedSignature = this.generateSignature(body, timestamp)

    // 3. Comparar firmas de manera segura (timing-safe)
    const isValid = this.secureCompare(signature, expectedSignature)

    if (!isValid) {
      return {
        valid: false,
        error: 'Invalid webhook signature',
      }
    }

    // 4. Verificar timestamp (opcional, previene replay attacks)
    if (timestamp) {
      const timestampAge = Date.now() - parseInt(timestamp, 10) * 1000

      // Rechazar si el webhook tiene más de 5 minutos
      if (timestampAge > 5 * 60 * 1000) {
        return {
          valid: false,
          error: 'Webhook timestamp too old (possible replay attack)',
        }
      }
    }

    return { valid: true }
  }

  /**
   * Genera la firma HMAC SHA256 del body
   */
  private generateSignature(body: string, timestamp?: string): string {
    // Si hay timestamp, incluirlo en el payload
    const payload = timestamp ? `${timestamp}.${body}` : body

    const hmac = createHmac('sha256', this.webhookSecret)
    hmac.update(payload)

    return hmac.digest('hex')
  }

  /**
   * Compara dos strings de manera segura (timing-safe)
   * Previene timing attacks
   */
  private secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false
    }

    let result = 0
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }

    return result === 0
  }

  /**
   * Helper: Valida un webhook de Next.js Request
   */
  static async validateNextRequest(
    request: Request,
    webhookSecret: string
  ): Promise<WebhookValidationResult> {
    const validator = new YcloudWebhookValidator(webhookSecret)

    const signature = request.headers.get('X-YCloud-Signature')
    const timestamp = request.headers.get('X-YCloud-Timestamp')

    // Leer body como texto (sin parsear a JSON aún)
    const bodyText = await request.text()

    return validator.validateSignature(signature, bodyText, timestamp || undefined)
  }
}
