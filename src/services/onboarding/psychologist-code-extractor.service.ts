/**
 * Psychologist Code Extractor Service
 *
 * Extrae códigos de psicólogo de los mensajes del usuario.
 */

export class PsychologistCodeExtractorService {
  // Palabras comunes que NO deben interpretarse como códigos
  private readonly COMMON_WORDS = new Set([
    // Español
    'tengo',
    'codigo',
    'código',
    'psicologo',
    'psicólogo',
    'terapeuta',
    'doctor',
    'doctora',
    'gracias',
    'hola',
    'buenas',
    'buenos',
    'tardes',
    'noches',
    'mañana',
    'manana',
    'perfecto',
    'claro',
    'entiendo',
    'entendido',
    'continuum',
    'vincularte',
    'vincular',
    // Inglés
    'hello',
    'thanks',
    'please',
    'doctor',
  ])

  /**
   * Extrae un código de psicólogo del mensaje del usuario
   *
   * Patrones reconocidos:
   * - "código: sersentiryconectar"
   * - "codigo sersentiryconectar"
   * - "sersentiryconectar" (palabra única, si no es palabra común)
   */
  extractCode(message: string): string | null {
    const lowerMessage = message.toLowerCase().trim()

    // Patrón 1: "código: XXXXX" o "codigo XXXXX" o "código es XXXXX"
    const pattern1 = /c[oó]digo:?\s*(?:es\s+)?([a-z0-9_-]+)/i
    const match1 = lowerMessage.match(pattern1)
    if (match1 && this.isValidCodeFormat(match1[1]) && !this.isCommonWord(match1[1])) {
      return match1[1]
    }

    // Patrón 2: Palabra única sin espacios (probablemente el código)
    // Solo si NO es una palabra común
    const words = lowerMessage.split(/\s+/)
    if (words.length === 1 && this.isValidCodeFormat(words[0]) && !this.isCommonWord(words[0])) {
      return words[0]
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
   * Verifica si la palabra es una palabra común que no debe ser código
   */
  private isCommonWord(word: string): boolean {
    return this.COMMON_WORDS.has(word.toLowerCase())
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
