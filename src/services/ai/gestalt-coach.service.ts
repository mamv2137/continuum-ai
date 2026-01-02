/**
 * Gestalt Coach Service
 *
 * Implementa la lógica de las 3 zonas de la Terapia Gestalt.
 * Detecta intelectualización y guía al usuario de regreso al cuerpo.
 */

import { GestaltZoneType } from '../../domain/value-objects/gestalt-zone.vo'

export type GestaltAnalysis = {
  detectedZone: GestaltZoneType | null
  isIntellectualizing: boolean
  hasSomaticContent: boolean
  suggestedRedirect: string | null
  nextQuestion: string
}

export class GestaltCoachService {
  /**
   * Analiza un mensaje del usuario y determina la zona y próximos pasos
   */
  analyzeMessage(userMessage: string): GestaltAnalysis {
    const lowerMessage = userMessage.toLowerCase()

    const isIntellectualizing = this.detectIntellectualization(lowerMessage)
    const hasSomaticContent = this.detectSomaticContent(lowerMessage)
    const detectedZone = this.detectZone(lowerMessage)

    // REGLA DE ORO: Si está intelectualizando, redirigir al cuerpo
    if (isIntellectualizing) {
      return {
        detectedZone: GestaltZoneType.FANTASY,
        isIntellectualizing: true,
        hasSomaticContent,
        suggestedRedirect: 'body',
        nextQuestion: this.getBodyRedirectQuestion(),
      }
    }

    // Si ya está hablando del cuerpo, profundizar
    if (hasSomaticContent) {
      return {
        detectedZone: GestaltZoneType.INTERNAL,
        isIntellectualizing: false,
        hasSomaticContent: true,
        suggestedRedirect: null,
        nextQuestion: this.getDeepeningQuestion(),
      }
    }

    // Si está describiendo lo que percibe con los sentidos
    if (detectedZone === GestaltZoneType.EXTERNAL) {
      return {
        detectedZone: GestaltZoneType.EXTERNAL,
        isIntellectualizing: false,
        hasSomaticContent: false,
        suggestedRedirect: 'body',
        nextQuestion: this.getTransitionToBodyQuestion(),
      }
    }

    // Default: guiar a conectar con el cuerpo
    return {
      detectedZone: null,
      isIntellectualizing: false,
      hasSomaticContent: false,
      suggestedRedirect: 'body',
      nextQuestion: this.getBodyAwarenessQuestion(),
    }
  }

  /**
   * Detecta si el usuario está intelectualizando (explicando el "por qué")
   */
  private detectIntellectualization(message: string): boolean {
    const markers = [
      'porque',
      'creo que',
      'pienso que',
      'debe ser',
      'supongo',
      'imagino que',
      'probablemente',
      'tal vez',
      'quizás',
      'me parece que',
      'es que',
      'lo que pasa es',
    ]

    return markers.some((marker) => message.includes(marker))
  }

  /**
   * Detecta si el mensaje contiene contenido somático (sensaciones corporales)
   */
  private detectSomaticContent(message: string): boolean {
    const somaticMarkers = [
      'siento en',
      'noto en',
      'percibo en',
      'en mi cuerpo',
      'en el pecho',
      'en mi pecho',
      'en el estómago',
      'en mi estómago',
      'en la garganta',
      'en mi garganta',
      'en los hombros',
      'en mis hombros',
      'tensión',
      'presión',
      'calor',
      'frío',
      'nudo',
      'peso',
      'opresión',
      'vacío',
      'hormigueo',
      'palpitaciones',
    ]

    return somaticMarkers.some((marker) => message.includes(marker))
  }

  /**
   * Detecta la zona de Gestalt basándose en el contenido del mensaje
   */
  private detectZone(message: string): GestaltZoneType | null {
    // Marcadores de zona externa (sentidos)
    const externalMarkers = [
      'veo',
      'escucho',
      'oigo',
      'huelo',
      'saboreo',
      'toco',
      'percibo con',
      'mis ojos',
      'mis oídos',
      'sonido',
      'ruido',
      'luz',
      'olor',
    ]

    // Marcadores de zona interna (soma)
    const internalMarkers = [
      'siento en mi',
      'noto en mi',
      'cuerpo',
      'pecho',
      'estómago',
      'garganta',
      'tensión',
      'presión',
    ]

    // Marcadores de zona de fantasía (pensamientos)
    const fantasyMarkers = [
      'pienso',
      'creo',
      'imagino',
      'recuerdo',
      'me pregunto',
      'preocupa',
    ]

    if (externalMarkers.some((m) => message.includes(m))) {
      return GestaltZoneType.EXTERNAL
    }

    if (internalMarkers.some((m) => message.includes(m))) {
      return GestaltZoneType.INTERNAL
    }

    if (fantasyMarkers.some((m) => message.includes(m))) {
      return GestaltZoneType.FANTASY
    }

    return null
  }

  /**
   * Pregunta para redirigir del pensamiento al cuerpo
   */
  private getBodyRedirectQuestion(): string {
    const questions = [
      'Entiendo. Ahora, ¿qué estás notando en tu cuerpo mientras me cuentas esto?',
      'Te escucho. ¿Dónde sientes eso en tu cuerpo?',
      'Gracias por compartir. ¿Qué sensaciones físicas acompañan a ese pensamiento?',
      'Comprendo. ¿Podrías notar qué está pasando en tu cuerpo en este momento?',
    ]

    return questions[Math.floor(Math.random() * questions.length)]
  }

  /**
   * Pregunta para profundizar en la consciencia corporal
   */
  private getDeepeningQuestion(): string {
    const questions = [
      '¿Puedes describir esa sensación con más detalle?',
      '¿Cómo es exactamente esa sensación? ¿Tiene temperatura, forma, peso?',
      'Si esa sensación tuviera una intensidad del 1 al 10, ¿cuál sería?',
      '¿Hay alguna otra parte de tu cuerpo donde notes algo?',
      '¿Esa sensación se queda quieta o se mueve?',
    ]

    return questions[Math.floor(Math.random() * questions.length)]
  }

  /**
   * Pregunta para transicionar de sentidos externos al cuerpo
   */
  private getTransitionToBodyQuestion(): string {
    const questions = [
      'Ahora que has notado lo que percibes afuera, ¿qué estás sintiendo dentro de ti?',
      'Gracias por compartir lo que percibes. ¿Qué sensaciones hay en tu cuerpo ahora?',
      '¿Y en tu cuerpo, qué estás notando en este momento?',
    ]

    return questions[Math.floor(Math.random() * questions.length)]
  }

  /**
   * Pregunta general de consciencia corporal
   */
  private getBodyAwarenessQuestion(): string {
    const questions = [
      '¿Qué estás notando en tu cuerpo ahora mismo?',
      '¿Dónde sientes algo en tu cuerpo en este momento?',
      '¿Hay alguna sensación física que llame tu atención?',
      'Tómate un momento... ¿qué percibes en tu cuerpo?',
    ]

    return questions[Math.floor(Math.random() * questions.length)]
  }
}
