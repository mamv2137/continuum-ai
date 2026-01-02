/**
 * Gemini AI Service
 *
 * Cliente para interactuar con Google Gemini AI.
 * Maneja la generación de respuestas del bot siguiendo el System Prompt de Gestalt.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  GESTALT_SYSTEM_PROMPT,
  GENERATE_INSIGHT_PROMPT,
  DETECT_EMOTIONAL_TONE_PROMPT,
} from '../../config/prompts/gestalt-system.prompt'
import { GEMINI_CONFIG } from '../../config/constants'
import { ChatMessage } from '../../domain/entities/check-in.entity'
import { EmotionalToneType } from '../../domain/value-objects/emotional-tone.vo'

export type GenerateResponseInput = {
  userMessage: string
  chatHistory: ChatMessage[]
  gestaltGuidance?: {
    isIntellectualizing: boolean
    suggestedRedirect: string | null
    nextQuestion: string
  }
}

export type GenerateResponseOutput = {
  response: string
  tokensUsed?: number
}

export class GeminiService {
  private genAI: GoogleGenerativeAI
  private model: any

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({
      model: GEMINI_CONFIG.model,
      systemInstruction: GESTALT_SYSTEM_PROMPT,
    })
  }

  /**
   * Genera respuesta del bot basándose en el mensaje del usuario
   */
  async generateResponse(input: GenerateResponseInput): Promise<GenerateResponseOutput> {
    try {
      // Construir el historial de conversación para Gemini
      const history = this.buildChatHistory(input.chatHistory)

      // Agregar contexto de Gestalt Coach si está disponible
      let userMessageWithContext = input.userMessage

      if (input.gestaltGuidance?.isIntellectualizing) {
        // Si está intelectualizando, dar pista al modelo
        userMessageWithContext = `[NOTA INTERNA: El usuario está intelectualizando. Redirige suavemente al cuerpo.]\n\nUsuario: ${input.userMessage}`
      }

      // Iniciar chat con historial
      const chat = this.model.startChat({
        history,
        generationConfig: {
          maxOutputTokens: GEMINI_CONFIG.maxTokens,
          temperature: GEMINI_CONFIG.temperature,
        },
      })

      // Generar respuesta
      const result = await chat.sendMessage(userMessageWithContext)
      const response = result.response.text()

      return {
        response: response.trim(),
        tokensUsed: result.response.usageMetadata?.totalTokenCount,
      }
    } catch (error) {
      console.error('Error generating response with Gemini:', error)
      throw new Error('Error al generar respuesta de IA')
    }
  }

  /**
   * Genera un insight sobre la sesión completa
   */
  async generateInsight(chatHistory: ChatMessage[]): Promise<string> {
    try {
      // Construir contexto de la conversación
      const conversationSummary = chatHistory
        .map((msg) => `${msg.role === 'user' ? 'Usuario' : 'Continuum'}: ${msg.content}`)
        .join('\n')

      const prompt = `${GENERATE_INSIGHT_PROMPT}\n\n=== CONVERSACIÓN ===\n${conversationSummary}`

      const result = await this.model.generateContent(prompt)
      const insight = result.response.text()

      return insight.trim()
    } catch (error) {
      console.error('Error generating insight:', error)
      return 'Gracias por tomarte este tiempo para conectar con tu experiencia presente.'
    }
  }

  /**
   * Detecta el tono emocional predominante en los mensajes del usuario
   */
  async detectEmotionalTone(userMessages: string[]): Promise<EmotionalToneType> {
    try {
      const messagesSummary = userMessages.join('\n')
      const prompt = `${DETECT_EMOTIONAL_TONE_PROMPT}\n\nMensajes del usuario:\n${messagesSummary}`

      const result = await this.model.generateContent(prompt)
      const tone = result.response.text().trim()

      // Mapear a EmotionalToneType
      const toneMap: Record<string, EmotionalToneType> = {
        Ansiedad: EmotionalToneType.ANXIETY,
        Calma: EmotionalToneType.CALM,
        Tristeza: EmotionalToneType.SADNESS,
        Enojo: EmotionalToneType.ANGER,
        Alegría: EmotionalToneType.JOY,
        Miedo: EmotionalToneType.FEAR,
        Confusión: EmotionalToneType.CONFUSION,
        Neutral: EmotionalToneType.NEUTRAL,
      }

      return toneMap[tone] || EmotionalToneType.NEUTRAL
    } catch (error) {
      console.error('Error detecting emotional tone:', error)
      return EmotionalToneType.NEUTRAL
    }
  }

  /**
   * Construye el historial de chat en formato de Gemini
   *
   * IMPORTANTE: Gemini requiere que el primer mensaje del historial sea del usuario.
   * Si el primer mensaje es del modelo (ej. mensaje de bienvenida), lo excluimos.
   */
  private buildChatHistory(
    chatHistory: ChatMessage[]
  ): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
    // Si el historial está vacío, retornar array vacío
    if (chatHistory.length === 0) {
      return []
    }

    // Si el primer mensaje es del modelo (mensaje de bienvenida),
    // excluirlo del historial para cumplir con la regla de Gemini
    const historyToUse =
      chatHistory[0].role === 'model' ? chatHistory.slice(1) : chatHistory

    return historyToUse.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }))
  }

  /**
   * Genera una pregunta de apertura personalizada
   */
  async generateWelcomeQuestion(
    userName: string | null,
    onboardingDone: boolean,
    previousCheckInsCount: number
  ): Promise<string> {
    if (!onboardingDone) {
      return `¡Bienvenido/a a Continuum! 🌱

Soy tu asistente de check-in basado en Terapia Gestalt. Mi objetivo es ayudarte a conectar con el momento presente.

No estoy aquí para diagnosticar o dar consejos, sino para acompañarte en tu proceso de autoconocimiento.

¿Cómo te sientes en este momento?`
    }

    const greeting = userName ? `¡Hola ${userName}!` : '¡Hola!'

    if (previousCheckInsCount === 0) {
      return `${greeting} ¿Cómo te sientes en este momento?`
    }

    // Para usuarios recurrentes
    const welcomeMessages = [
      `${greeting} ¿Cómo estás en este momento?`,
      `${greeting} ¿Qué estás notando ahora?`,
      `${greeting} ¿Cómo te encuentras?`,
    ]

    return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
  }
}
