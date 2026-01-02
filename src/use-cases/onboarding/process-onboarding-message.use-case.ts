/**
 * Process Onboarding Message Use Case
 *
 * Maneja los mensajes durante el proceso de onboarding conversacional.
 */

import type { IUserRepository } from '../../repositories/interfaces/user.repository.interface'
import type { IPsychologistRepository } from '../../repositories/interfaces/psychologist.repository.interface'
import { OnboardingStep } from '../../domain/value-objects/onboarding-step.vo'
import { PsychologistCodeExtractorService } from '../../services/onboarding/psychologist-code-extractor.service'
import { LinkWithPsychologistUseCase } from './link-with-psychologist.use-case'
import { SaveExternalPsychologistUseCase } from './save-external-psychologist.use-case'

export type ProcessOnboardingMessageInput = {
  userId: string
  message: string
  currentStep: string | null
}

export type ProcessOnboardingMessageOutput = {
  response: string
  nextStep: string
  onboardingCompleted: boolean
}

export class ProcessOnboardingMessageUseCase {
  private codeExtractor: PsychologistCodeExtractorService
  private linkPsychologistUseCase: LinkWithPsychologistUseCase
  private saveExternalPsychologistUseCase: SaveExternalPsychologistUseCase

  constructor(
    private readonly userRepository: IUserRepository,
    psychologistRepository: IPsychologistRepository
  ) {
    this.codeExtractor = new PsychologistCodeExtractorService()
    this.linkPsychologistUseCase = new LinkWithPsychologistUseCase(
      userRepository,
      psychologistRepository
    )
    this.saveExternalPsychologistUseCase = new SaveExternalPsychologistUseCase(
      userRepository
    )
  }

  async execute(
    input: ProcessOnboardingMessageInput
  ): Promise<ProcessOnboardingMessageOutput> {
    const currentStep =
      (input.currentStep as OnboardingStep) || OnboardingStep.NOT_STARTED
    const user = await this.userRepository.findById(input.userId)

    if (!user) {
      throw new Error('User not found')
    }

    // Manejar cada paso del onboarding
    switch (currentStep) {
      case OnboardingStep.NOT_STARTED:
      case OnboardingStep.NAME:
        return await this.handleNameStep(input, user)

      case OnboardingStep.WAITING_NAME:
        return await this.handleWaitingNameStep(input, user)

      case OnboardingStep.EXPECTATIONS:
        return await this.handleExpectationsStep(input, user)

      case OnboardingStep.PSYCHOLOGIST:
        return await this.handlePsychologistStep(input, user)

      case OnboardingStep.PSYCHOLOGIST_NAME:
        return await this.handlePsychologistNameStep(input, user)

      case OnboardingStep.PSYCHOLOGIST_CONTACT:
        return await this.handlePsychologistContactStep(input, user)

      case OnboardingStep.EMERGENCY_CONTACT:
        return await this.handleEmergencyContactStep(input, user)

      case OnboardingStep.EMERGENCY_CONTACT_NAME:
        return await this.handleEmergencyContactNameStep(input, user)

      case OnboardingStep.EMERGENCY_CONTACT_PHONE:
        return await this.handleEmergencyContactPhoneStep(input, user)

      default:
        return {
          response: '¿Cómo te sientes en este momento?',
          nextStep: OnboardingStep.COMPLETED,
          onboardingCompleted: true,
        }
    }
  }

  private async handleNameStep(
    input: ProcessOnboardingMessageInput,
    user: any
  ): Promise<ProcessOnboardingMessageOutput> {
    // Mostrar mensaje de bienvenida y pregunta del nombre
    // Cambiar al estado WAITING_NAME para esperar la respuesta
    await this.userRepository.update(user.id, {
      onboardingStep: OnboardingStep.WAITING_NAME,
    })

    return {
      response: `¡Bienvenido/a a Continuum! 🌱

Soy tu asistente de check-in basado en Terapia Gestalt. Mi objetivo es ayudarte a conectar con el momento presente a través de las 3 zonas: externa (sentidos), interna (cuerpo) y de fantasía (pensamientos).

Para comenzar, ¿cómo te llamas?`,
      nextStep: OnboardingStep.WAITING_NAME,
      onboardingCompleted: false,
    }
  }

  private async handleWaitingNameStep(
    input: ProcessOnboardingMessageInput,
    user: any
  ): Promise<ProcessOnboardingMessageOutput> {
    // El usuario está respondiendo con su nombre
    const name = input.message.trim()

    await this.userRepository.update(user.id, {
      name,
      onboardingStep: OnboardingStep.PSYCHOLOGIST,
    })

    return {
      response: `Encantado, ${name}. Antes de empezar, me gustaría hacerte un par de preguntas para conocerte mejor.

¿Tienes un psicólogo o terapeuta con quien trabajas actualmente?

Si tu psicólogo está registrado en Continuum, puedes compartir el código que te dio para vincularte automáticamente.`,
      nextStep: OnboardingStep.PSYCHOLOGIST,
      onboardingCompleted: false,
    }
  }

  private async handleExpectationsStep(
    input: ProcessOnboardingMessageInput,
    user: any
  ): Promise<ProcessOnboardingMessageOutput> {
    // Completar onboarding después de recopilar expectativas
    await this.userRepository.update(user.id, {
      onboardingDone: true,
      onboardingStep: OnboardingStep.COMPLETED,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    })

    return {
      response: `Gracias por compartir eso${user.name ? `, ${user.name}` : ''}.

¡Perfecto! Ya estamos listos para comenzar.

En el próximo mensaje, empezaremos tu primer check-in. 🌱`,
      nextStep: OnboardingStep.COMPLETED,
      onboardingCompleted: true,
    }
  }

  private async handlePsychologistStep(
    input: ProcessOnboardingMessageInput,
    user: any
  ): Promise<ProcessOnboardingMessageOutput> {
    const message = input.message.toLowerCase().trim()

    // Caso 1: Usuario dice que NO tiene psicólogo
    if (
      message.includes('no') ||
      message.includes('no tengo') ||
      message === 'no'
    ) {
      await this.userRepository.update(user.id, {
        hasPsychologist: false,
        onboardingStep: OnboardingStep.EMERGENCY_CONTACT,
      })

      return {
        response: `Entendido${user.name ? `, ${user.name}` : ''}. Si en algún momento necesitas apoyo profesional, puedo sugerirte recursos.

Por último, ¿tienes algún contacto de confianza que quieras que notifiquemos solo en caso de emergencia?

(Esto es completamente opcional)`,
        nextStep: OnboardingStep.EMERGENCY_CONTACT,
        onboardingCompleted: false,
      }
    }

    // Caso 2: Intentar extraer código
    const code = this.codeExtractor.extractCode(input.message)

    if (code) {
      const result = await this.linkPsychologistUseCase.execute({
        userId: user.id,
        code,
      })

      if (result.success) {
        // Código válido
        await this.userRepository.update(user.id, {
          onboardingStep: OnboardingStep.EMERGENCY_CONTACT,
        })

        return {
          response: `¡Perfecto! Te he vinculado con ${result.psychologist!.name}.

Ahora, si detecto patrones que necesiten atención, podré sugerirte contactarlo directamente. ¿Te parece bien?

Por último, ¿tienes algún contacto de confianza que quieras que notifiquemos solo en caso de emergencia?

(Esto es opcional)`,
          nextStep: OnboardingStep.EMERGENCY_CONTACT,
          onboardingCompleted: false,
        }
      } else {
        // Código inválido
        return {
          response: `${result.error}

¿Quieres intentar de nuevo o prefieres ingresar los datos de tu psicólogo manualmente?

Responde:
1️⃣ "Intentar otro código"
2️⃣ "Ingresar datos manualmente"
3️⃣ "No tengo psicólogo"`,
          nextStep: OnboardingStep.PSYCHOLOGIST,
          onboardingCompleted: false,
        }
      }
    }

    // Caso 3: Usuario dice que SÍ tiene pero no dio código
    if (message.includes('sí') || message.includes('si') || message.includes('tengo')) {
      await this.userRepository.update(user.id, {
        onboardingStep: OnboardingStep.PSYCHOLOGIST_NAME,
      })

      return {
        response: `Entendido. Si quieres, puedo guardar su información para que puedas contactarlo/a en caso de necesitarlo.

¿Cuál es su nombre completo?`,
        nextStep: OnboardingStep.PSYCHOLOGIST_NAME,
        onboardingCompleted: false,
      }
    }

    // Caso 4: Usuario selecciona opción numérica
    if (message === '1' || message.includes('intentar')) {
      return {
        response: 'Por favor, escribe el código de tu psicólogo:',
        nextStep: OnboardingStep.PSYCHOLOGIST,
        onboardingCompleted: false,
      }
    }

    if (message === '2' || message.includes('manual')) {
      await this.userRepository.update(user.id, {
        onboardingStep: OnboardingStep.PSYCHOLOGIST_NAME,
      })

      return {
        response: '¿Cuál es el nombre completo de tu psicólogo/a?',
        nextStep: OnboardingStep.PSYCHOLOGIST_NAME,
        onboardingCompleted: false,
      }
    }

    if (message === '3') {
      await this.userRepository.update(user.id, {
        hasPsychologist: false,
        onboardingStep: OnboardingStep.EMERGENCY_CONTACT,
      })

      return {
        response: `Entendido. Por último, ¿tienes algún contacto de confianza que quieras que notifiquemos solo en caso de emergencia?

(Esto es opcional)`,
        nextStep: OnboardingStep.EMERGENCY_CONTACT,
        onboardingCompleted: false,
      }
    }

    // No entendimos la respuesta
    return {
      response: `No estoy seguro de entender. ¿Tienes un psicólogo o terapeuta?

Puedes responder:
- "Sí" (y compartir su código si lo tienes)
- "Sí, pero no tengo código"
- "No"`,
      nextStep: OnboardingStep.PSYCHOLOGIST,
      onboardingCompleted: false,
    }
  }

  private async handlePsychologistNameStep(
    input: ProcessOnboardingMessageInput,
    user: any
  ): Promise<ProcessOnboardingMessageOutput> {
    const name = input.message.trim()

    await this.userRepository.update(user.id, {
      psychologistName: name,
      onboardingStep: OnboardingStep.PSYCHOLOGIST_CONTACT,
    })

    return {
      response: `¿Y tienes su número de teléfono o email?`,
      nextStep: OnboardingStep.PSYCHOLOGIST_CONTACT,
      onboardingCompleted: false,
    }
  }

  private async handlePsychologistContactStep(
    input: ProcessOnboardingMessageInput,
    user: any
  ): Promise<ProcessOnboardingMessageOutput> {
    const contact = input.message.trim()

    await this.saveExternalPsychologistUseCase.execute({
      userId: user.id,
      name: user.psychologistName!,
      contact,
    })

    await this.userRepository.update(user.id, {
      onboardingStep: OnboardingStep.EMERGENCY_CONTACT,
    })

    return {
      response: `Perfecto, guardé los datos de tu psicólogo/a.

Si en algún momento necesitas contactarlo/a, puedo recordarte su número.

Por último, ¿tienes algún contacto de confianza que quieras que notifiquemos solo en caso de emergencia?

(Esto es opcional)`,
      nextStep: OnboardingStep.EMERGENCY_CONTACT,
      onboardingCompleted: false,
    }
  }

  private async handleEmergencyContactStep(
    input: ProcessOnboardingMessageInput,
    user: any
  ): Promise<ProcessOnboardingMessageOutput> {
    const message = input.message.toLowerCase().trim()

    // Si dice que no o pasa
    if (
      message.includes('no') ||
      message.includes('paso') ||
      message.includes('skip') ||
      message.includes('prefiero no')
    ) {
      await this.userRepository.update(user.id, {
        onboardingStep: OnboardingStep.EXPECTATIONS,
      })

      return {
        response: `Entendido${user.name ? `, ${user.name}` : ''}.

Ahora, me gustaría saber qué esperas de mí. ¿Cómo te gustaría que te acompañe?`,
        nextStep: OnboardingStep.EXPECTATIONS,
        onboardingCompleted: false,
      }
    }

    // Si dice que sí, pedir el nombre del contacto
    if (
      message.includes('sí') ||
      message.includes('si') ||
      message.includes('tengo') ||
      message === 's' ||
      message === 'y'
    ) {
      await this.userRepository.update(user.id, {
        onboardingStep: OnboardingStep.EMERGENCY_CONTACT_NAME,
      })

      return {
        response: '¿Cuál es el nombre de tu contacto de emergencia?',
        nextStep: OnboardingStep.EMERGENCY_CONTACT_NAME,
        onboardingCompleted: false,
      }
    }

    // Si no entendimos, volver a preguntar
    return {
      response: `No estoy seguro de entender. ¿Tienes algún contacto de confianza para emergencias?

Puedes responder "Sí" o "No"`,
      nextStep: OnboardingStep.EMERGENCY_CONTACT,
      onboardingCompleted: false,
    }
  }

  private async handleEmergencyContactNameStep(
    input: ProcessOnboardingMessageInput,
    user: any
  ): Promise<ProcessOnboardingMessageOutput> {
    const name = input.message.trim()

    // Guardar el nombre temporalmente y pedir el teléfono
    await this.userRepository.update(user.id, {
      emergencyContactName: name,
      onboardingStep: OnboardingStep.EMERGENCY_CONTACT_PHONE,
    })

    return {
      response: `¿Y cuál es el teléfono de ${name}?`,
      nextStep: OnboardingStep.EMERGENCY_CONTACT_PHONE,
      onboardingCompleted: false,
    }
  }

  private async handleEmergencyContactPhoneStep(
    input: ProcessOnboardingMessageInput,
    user: any
  ): Promise<ProcessOnboardingMessageOutput> {
    const phone = input.message.trim()

    // Guardar el teléfono y pasar a expectations
    await this.userRepository.update(user.id, {
      emergencyContactPhone: phone,
      onboardingStep: OnboardingStep.EXPECTATIONS,
    })

    return {
      response: `Gracias, he guardado el contacto de emergencia.

Ahora, me gustaría saber qué esperas de mí. ¿Cómo te gustaría que te acompañe?`,
      nextStep: OnboardingStep.EXPECTATIONS,
      onboardingCompleted: false,
    }
  }
}
