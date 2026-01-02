/**
 * Emotional Tone Value Object
 *
 * Representa el tono emocional detectado en un check-in.
 * Categorías basadas en las emociones básicas de la Terapia Gestalt.
 */

export enum EmotionalToneType {
  ANXIETY = 'Ansiedad',
  CALM = 'Calma',
  SADNESS = 'Tristeza',
  ANGER = 'Enojo',
  JOY = 'Alegría',
  FEAR = 'Miedo',
  CONFUSION = 'Confusión',
  NEUTRAL = 'Neutral',
}

export class EmotionalTone {
  private readonly tone: EmotionalToneType
  private readonly confidence: number // 0-100

  constructor(tone: EmotionalToneType, confidence: number = 80) {
    this.tone = tone
    this.confidence = Math.max(0, Math.min(100, confidence))
  }

  getTone(): EmotionalToneType {
    return this.tone
  }

  getConfidence(): number {
    return this.confidence
  }

  isHighConfidence(): boolean {
    return this.confidence >= 70
  }

  toString(): string {
    return `${this.tone} (${this.confidence}% confianza)`
  }

  /**
   * Sugiere una pregunta de follow-up basada en el tono emocional
   */
  getSuggestedFollowUp(): string {
    switch (this.tone) {
      case EmotionalToneType.ANXIETY:
        return '¿Dónde sientes esa ansiedad en tu cuerpo ahora mismo?'
      case EmotionalToneType.SADNESS:
        return '¿Qué estás notando en tu cuerpo mientras hablas de esto?'
      case EmotionalToneType.ANGER:
        return '¿Cómo se manifiesta ese enojo en tu cuerpo?'
      case EmotionalToneType.FEAR:
        return '¿Qué sensaciones físicas acompañan a ese miedo?'
      case EmotionalToneType.CALM:
        return '¿Qué estás percibiendo en este momento de calma?'
      case EmotionalToneType.JOY:
        return '¿Cómo se siente esa alegría en tu cuerpo?'
      case EmotionalToneType.CONFUSION:
        return '¿Qué estás sintiendo físicamente en este momento?'
      default:
        return '¿Qué estás notando en tu cuerpo ahora?'
    }
  }
}
