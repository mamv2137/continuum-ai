/**
 * Psychologist Code Extractor Service
 *
 * Extrae códigos de psicólogo de los mensajes del usuario.
 */

export class PsychologistCodeExtractorService {
  /**
   * Extrae un código de psicólogo del mensaje del usuario
   *
   * Patrones reconocidos:
   * - "código: sersentiryconectar"
   * - "codigo sersentiryconectar"
   * - "sersentiryconectar" (palabra única)
   * - "sí, me dio este código: sersentiryconectar"
   */
  extractCode(message: string): string | null {
    const lowerMessage = message.toLowerCase().trim()

    // Patrón 1: "código: XXXXX" o "codigo XXXXX"
    const pattern1 = /c[oó]digo:?\s*([a-z0-9_-]+)/i
    const match1 = lowerMessage.match(pattern1)
    if (match1 && this.isValidCodeFormat(match1[1])) {
      return match1[1]
    }

    // Patrón 2: Palabra única sin espacios (probablemente el código)
    // Ej: "sersentiryconectar"
    const words = lowerMessage.split(/\s+/)
    if (words.length === 1 && this.isValidCodeFormat(words[0])) {
      return words[0]
    }

    // Patrón 3: Buscar palabras que parezcan códigos (5-30 chars, solo letras/números/guiones)
    for (const word of words) {
      const cleaned = word.replace(/[^a-z0-9_-]/g, '')
      if (cleaned.length >= 5 && this.isValidCodeFormat(cleaned)) {
        return cleaned
      }
    }

    return null
  }

  /**
   * Valida que el código tenga formato correcto
   *
   * Reglas:
   * - Solo letras minúsculas, números, guiones y guiones bajos
   * - Longitud: 5-30 caracteres
   */
  isValidCodeFormat(code: string): boolean {
    return /^[a-z0-9_-]{5,30}$/.test(code)
  }

  /**
   * Detecta si el usuario está intentando proporcionar un código
   *
   * Útil para saber si debemos preguntarle específicamente por el código
   */
  seemsLikeCode(message: string): boolean {
    const lowerMessage = message.toLowerCase()

    // Menciona "código" o "codigo"
    if (/c[oó]digo/i.test(lowerMessage)) {
      return true
    }

    // El mensaje es muy corto y tiene formato de código
    const words = lowerMessage.trim().split(/\s+/)
    if (words.length <= 2) {
      for (const word of words) {
        if (this.isValidCodeFormat(word)) {
          return true
        }
      }
    }

    return false
  }
}
