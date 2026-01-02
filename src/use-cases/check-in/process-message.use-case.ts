/**
 * Process Message Use Case
 *
 * Procesa un mensaje del usuario en WhatsApp:
 * 1. Obtiene o crea usuario
 * 2. Obtiene o crea check-in activo
 * 3. Analiza el mensaje con Gestalt Coach
 * 4. Genera respuesta con Gemini AI
 * 5. Actualiza el check-in
 * 6. Retorna la respuesta para enviar al usuario
 */

import { IUserRepository } from '../../repositories/interfaces/user.repository.interface'
import { ICheckInRepository } from '../../repositories/interfaces/check-in.repository.interface'
import { IPsychologistRepository } from '../../repositories/interfaces/psychologist.repository.interface'
import { PhoneNumber } from '../../domain/value-objects/phone-number.vo'
import { CheckInEntity, SessionStatus } from '../../domain/entities/check-in.entity'
import { GestaltCoachService } from '../../services/ai/gestalt-coach.service'
import { GeminiService } from '../../services/ai/gemini.service'
import { EmotionalTone } from '../../domain/value-objects/emotional-tone.vo'
import { ProcessOnboardingMessageUseCase } from '../onboarding/process-onboarding-message.use-case'
import { OnboardingStep } from '../../domain/value-objects/onboarding-step.vo'

export type ProcessMessageInput = {
  phoneNumber: string
  message: string
}

export type ProcessMessageOutput = {
  response: string
  isNewUser: boolean
  isNewCheckIn: boolean
  checkInId: string
}

export class ProcessMessageUseCase {
  private onboardingUseCase: ProcessOnboardingMessageUseCase

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly checkInRepository: ICheckInRepository,
    private readonly psychologistRepository: IPsychologistRepository,
    private readonly gestaltCoach: GestaltCoachService,
    private readonly geminiService: GeminiService
  ) {
    this.onboardingUseCase = new ProcessOnboardingMessageUseCase(
      userRepository,
      psychologistRepository
    )
  }

  async execute(input: ProcessMessageInput): Promise<ProcessMessageOutput> {
    // 1. Validar y crear PhoneNumber VO
    const phoneNumber = new PhoneNumber(input.phoneNumber)

    // 2. Obtener o crear usuario
    let user = await this.userRepository.findByPhoneNumber(phoneNumber)
    const isNewUser = !user

    if (!user) {
      user = await this.userRepository.create({
        phoneNumber,
        role: 'INDIVIDUAL',
        onboardingStep: OnboardingStep.NAME, // Iniciar onboarding
      })
    }

    // ========== FLUJO DE ONBOARDING ==========
    // Si el usuario no ha completado el onboarding, procesarlo
    if (!user.onboardingDone) {
      const onboardingResult = await this.onboardingUseCase.execute({
        userId: user.id,
        message: input.message,
        currentStep: user.onboardingStep,
      })

      // SIEMPRE retornar la respuesta del onboarding (completado o no)
      // El check-in se creará en el SIGUIENTE mensaje del usuario
      return {
        response: onboardingResult.response,
        isNewUser,
        isNewCheckIn: false,
        checkInId: '', // No hay check-in durante onboarding
      }
    }

    // ========== FLUJO NORMAL DE CHECK-IN ==========
    // 3. Obtener o crear check-in activo
    let checkIn = await this.checkInRepository.findActiveByUserId(user.id)
    const isNewCheckIn = !checkIn

    if (!checkIn) {
      // Crear nuevo check-in
      checkIn = new CheckInEntity(crypto.randomUUID(), user.id, SessionStatus.IN_PROGRESS)

      // Generar mensaje de bienvenida
      const welcomeMessage = await this.geminiService.generateWelcomeQuestion(
        user.name,
        user.onboardingDone,
        user.totalCheckIns
      )

      checkIn.addMessage('model', welcomeMessage)
      checkIn = await this.checkInRepository.create(checkIn)

      // Retornar mensaje de bienvenida (primera interacción post-onboarding)
      return {
        response: welcomeMessage,
        isNewUser,
        isNewCheckIn: true,
        checkInId: checkIn.getId(),
      }
    }

    // 4. Agregar mensaje del usuario al check-in
    checkIn.addMessage('user', input.message)

    // 5. Analizar mensaje con Gestalt Coach
    const gestaltAnalysis = this.gestaltCoach.analyzeMessage(input.message)

    // 6. Generar respuesta con Gemini AI
    const aiResponse = await this.geminiService.generateResponse({
      userMessage: input.message,
      chatHistory: checkIn.getChatHistory(),
      gestaltGuidance: gestaltAnalysis,
    })

    // 7. Agregar respuesta del modelo al check-in
    checkIn.addMessage('model', aiResponse.response)

    // 8. Detectar y actualizar tono emocional si hay suficientes mensajes
    if (checkIn.getMessageCount() >= 6) {
      const userMessages = checkIn
        .getChatHistory()
        .filter((msg) => msg.role === 'user')
        .map((msg) => msg.content)

      const emotionalTone = await this.geminiService.detectEmotionalTone(userMessages)
      checkIn.setEmotionalTone(new EmotionalTone(emotionalTone))
    }

    // 9. Detectar si el usuario quiere terminar
    const isEnding = this.detectEndingIntent(input.message)

    if (isEnding && checkIn.hasAtLeastOneZoneCompleted()) {
      // Generar insight final
      const insight = await this.geminiService.generateInsight(checkIn.getChatHistory())
      checkIn.setAiInsight(insight)

      // Completar check-in
      checkIn.complete()

      // Agregar mensaje de cierre
      const closingMessage = `Gracias por tomarte este tiempo para conectar con tu experiencia presente.

${insight}

¡Hasta pronto! 🌱`

      checkIn.addMessage('model', closingMessage)

      // Actualizar estadísticas del usuario
      await this.userRepository.incrementCheckInCount(user.id)
      await this.userRepository.updateLastCheckInDate(user.id, new Date())

      // Guardar y retornar
      await this.checkInRepository.update(checkIn)

      return {
        response: closingMessage,
        isNewUser,
        isNewCheckIn,
        checkInId: checkIn.getId(),
      }
    }

    // 10. Guardar check-in actualizado
    await this.checkInRepository.update(checkIn)

    // 11. Retornar respuesta
    return {
      response: aiResponse.response,
      isNewUser,
      isNewCheckIn,
      checkInId: checkIn.getId(),
    }
  }

  /**
   * Detecta si el usuario tiene intención de terminar la sesión
   */
  private detectEndingIntent(message: string): boolean {
    const lowerMessage = message.toLowerCase().trim()

    const endingKeywords = [
      'gracias',
      'hasta luego',
      'adiós',
      'bye',
      'chao',
      'listo',
      'es todo',
      'suficiente',
      'terminar',
      'finalizar',
      'salir',
    ]

    return endingKeywords.some((keyword) => lowerMessage.includes(keyword))
  }
}
