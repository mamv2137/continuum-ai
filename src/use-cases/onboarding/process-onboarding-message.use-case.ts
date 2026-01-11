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
import { ProcessPsychologistOnboardingUseCase } from './process-psychologist-onboarding.use-case'
import { UserRole } from '@/generated/client'

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
  private psychologistOnboardingUseCase: ProcessPsychologistOnboardingUseCase

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
    this.psychologistOnboardingUseCase = new ProcessPsychologistOnboardingUseCase(
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
      case OnboardingStep.USER_TYPE:
        return await this.handleUserTypeStep(input, user)

      case OnboardingStep.NAME:
        return await this.handleNameStep(input, user)

      case OnboardingStep.WAITING_NAME:
        return await this.handleWaitingNameStep(input, user)

      case OnboardingStep.EXPECTATIONS:
        return await this.handleExpectationsStep(input, user)

      case OnboardingStep.PSYCHOLOGIST:
        return await this.handlePsychologistStep(input, user)

      case OnboardingStep.PSYCHOLOGIST_REGISTERED:
        return await this.handlePsychologistRegisteredStep(input, user)

      case OnboardingStep.PSYCHOLOGIST_CODE:
        return await this.handlePsychologistCodeStep(input, user)

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

      // ===== FLUJO DE PSICÓLOGOS =====
      case OnboardingStep.PSYCHO_NAME:
      case OnboardingStep.PSYCHO_LICENSE:
      case OnboardingStep.PSYCHO_PASSWORD:
      case OnboardingStep.PSYCHO_PASSWORD_INPUT:
      case OnboardingStep.PSYCHO_COMPLETED:
        return await this.psychologistOnboardingUseCase.execute({
          userId: input.userId,
          message: input.message,
          currentStep: currentStep,
        })

      default:
        return {
          response: '¿Cómo te sientes en este momento?',
          nextStep: OnboardingStep.COMPLETED,
          onboardingCompleted: true,
        }
    }
  }

  private async handleUserTypeStep(
    input: ProcessOnboardingMessageInput,
    user: any
  ): Promise<ProcessOnboardingMessageOutput> {
    const message = input.message.toLowerCase().trim()

    // Detectar si es profesional
    const isProfessional =
      message.includes('profesional') ||
      message.includes('psicólogo') ||
      message.includes('psicologo') ||
      message.includes('terapeuta') ||
      message.includes('coach') ||
      message.includes('soy profesional') ||
      message.includes('a)') ||
      message === 'a'

    // Detectar si busca apoyo personal
    const isPersonal =
      message.includes('personal') ||
      message.includes('para mí') ||
      message.includes('para mi') ||
      message.includes('apoyo') ||
      message.includes('busco ayuda') ||
      message.includes('paciente') ||
      message.includes('b)') ||
      message === 'b'

    if (isProfessional) {
      // Iniciar flujo de psicólogo
      await this.userRepository.update(user.id, {
        role: UserRole.PSYCHOLOGIST,
        onboardingStep: OnboardingStep.PSYCHO_NAME,
      })

      return {
        response: `¡Bienvenido/a a Continuum! 🌱

Entiendo que eres un profesional de la salud mental. Voy a registrarte como tal.

Para comenzar, ¿cuál es tu nombre completo?`,
        nextStep: OnboardingStep.PSYCHO_NAME,
        onboardingCompleted: false,
      }
    }

    if (isPersonal) {
      // Iniciar flujo de usuario individual
      await this.userRepository.update(user.id, {
        role: UserRole.INDIVIDUAL,
        onboardingStep: OnboardingStep.NAME,
      })

      return {
        response: `¡Bienvenido/a a Continuum! 🌱

Soy tu asistente de check-in basado en Terapia Gestalt. Mi objetivo es ayudarte a conectar con el momento presente a través de las 3 zonas: externa (sentidos), interna (cuerpo) y de fantasía (pensamientos).

Para comenzar, ¿cómo te llamas?`,
        nextStep: OnboardingStep.NAME,
        onboardingCompleted: false,
      }
    }

    // Si no entendimos, mostrar el mensaje inicial
    await this.userRepository.update(user.id, {
      onboardingStep: OnboardingStep.USER_TYPE,
    })

    return {
      response: `¡Hola! Bienvenido a Continuum 🌱

Para poder acompañarte mejor, cuéntame:
¿vienes como profesional (psicólogo/terapeuta) o buscas apoyo personal?`,
      nextStep: OnboardingStep.USER_TYPE,
      onboardingCompleted: false,
    }
  }

  private extractName(message: string): string {
    let name = message.trim()

    // Prefijos comunes que el usuario puede usar al dar su nombre
    const prefixes = [
      'me llamo',
      'mi nombre es',
      'soy',
      'me dicen',
      'me pueden decir',
      'puedes llamarme',
      'llamame',
      'llámame',
      'dime',
    ]

    const lowerName = name.toLowerCase()
    for (const prefix of prefixes) {
      if (lowerName.startsWith(prefix)) {
        name = name.slice(prefix.length).trim()
        break
      }
    }

    // Capitalizar primera letra de cada palabra
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  private async handleNameStep(
    input: ProcessOnboardingMessageInput,
    user: any
  ): Promise<ProcessOnboardingMessageOutput> {
    // El usuario individual ya fue identificado, ahora guarda su nombre
    const name = this.extractName(input.message)

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

  private async handleWaitingNameStep(
    input: ProcessOnboardingMessageInput,
    user: any
  ): Promise<ProcessOnboardingMessageOutput> {
    // Este paso ya no se usa en el nuevo flujo, redirigir a PSYCHOLOGIST
    return await this.handleNameStep(input, user)
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
      message.includes('no tengo') ||
      message === 'no' ||
      message === '2' ||
      (message.includes('no') && !message.includes('si'))
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

    // Caso 2: Usuario dice que SÍ tiene psicólogo
    if (
      message.includes('sí') ||
      message.includes('si') ||
      message.includes('tengo') ||
      message === '1' ||
      message === 's'
    ) {
      await this.userRepository.update(user.id, {
        hasPsychologist: true,
        onboardingStep: OnboardingStep.PSYCHOLOGIST_REGISTERED,
      })

      return {
        response: `¡Qué bien que tengas acompañamiento profesional!

¿Tu psicólogo está registrado en Continuum? Si es así, te habrá compartido un código para vincularte.

Responde:
1️⃣ "Sí, tengo código"
2️⃣ "No está en Continuum"`,
        nextStep: OnboardingStep.PSYCHOLOGIST_REGISTERED,
        onboardingCompleted: false,
      }
    }

    // No entendimos la respuesta
    return {
      response: `¿Tienes un psicólogo o terapeuta con quien trabajas actualmente?

Responde:
1️⃣ "Sí"
2️⃣ "No"`,
      nextStep: OnboardingStep.PSYCHOLOGIST,
      onboardingCompleted: false,
    }
  }

  private async handlePsychologistRegisteredStep(
    input: ProcessOnboardingMessageInput,
    user: any
  ): Promise<ProcessOnboardingMessageOutput> {
    const message = input.message.toLowerCase().trim()

    // Caso 1: Psicólogo está en Continuum, tiene código
    if (
      message.includes('sí') ||
      message.includes('si') ||
      message.includes('código') ||
      message.includes('codigo') ||
      message.includes('tengo código') ||
      message === '1'
    ) {
      await this.userRepository.update(user.id, {
        onboardingStep: OnboardingStep.PSYCHOLOGIST_CODE,
      })

      return {
        response: `Por favor, escribe el código que te dio tu psicólogo:`,
        nextStep: OnboardingStep.PSYCHOLOGIST_CODE,
        onboardingCompleted: false,
      }
    }

    // Caso 2: Psicólogo NO está en Continuum
    if (
      message.includes('no') ||
      message.includes('no está') ||
      message.includes('no esta') ||
      message === '2'
    ) {
      await this.userRepository.update(user.id, {
        onboardingStep: OnboardingStep.PSYCHOLOGIST_NAME,
      })

      return {
        response: `Entendido. Puedo guardar los datos de tu psicólogo para que lo contactes si lo necesitas.

¿Cuál es su nombre completo?`,
        nextStep: OnboardingStep.PSYCHOLOGIST_NAME,
        onboardingCompleted: false,
      }
    }

    // No entendimos
    return {
      response: `¿Tu psicólogo está registrado en Continuum?

Responde:
1️⃣ "Sí, tengo código"
2️⃣ "No está en Continuum"`,
      nextStep: OnboardingStep.PSYCHOLOGIST_REGISTERED,
      onboardingCompleted: false,
    }
  }

  private async handlePsychologistCodeStep(
    input: ProcessOnboardingMessageInput,
    user: any
  ): Promise<ProcessOnboardingMessageOutput> {
    const message = input.message.trim()

    // Intentar extraer código
    const code = this.codeExtractor.extractCode(message)

    if (code) {
      const result = await this.linkPsychologistUseCase.execute({
        userId: user.id,
        code,
      })

      if (result.success) {
        await this.userRepository.update(user.id, {
          onboardingStep: OnboardingStep.EMERGENCY_CONTACT,
        })

        return {
          response: `¡Perfecto! Te he vinculado con ${result.psychologist!.name}.

Si detecto patrones que necesiten atención, podré sugerirte contactarlo directamente.

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
3️⃣ "Continuar sin vincular"`,
          nextStep: OnboardingStep.PSYCHOLOGIST_CODE,
          onboardingCompleted: false,
        }
      }
    }

    // Manejar opciones numéricas después de error
    const lowerMessage = message.toLowerCase()

    if (lowerMessage === '1' || lowerMessage.includes('intentar')) {
      return {
        response: 'Por favor, escribe el código de tu psicólogo:',
        nextStep: OnboardingStep.PSYCHOLOGIST_CODE,
        onboardingCompleted: false,
      }
    }

    if (lowerMessage === '2' || lowerMessage.includes('manual')) {
      await this.userRepository.update(user.id, {
        onboardingStep: OnboardingStep.PSYCHOLOGIST_NAME,
      })

      return {
        response: '¿Cuál es el nombre completo de tu psicólogo/a?',
        nextStep: OnboardingStep.PSYCHOLOGIST_NAME,
        onboardingCompleted: false,
      }
    }

    if (lowerMessage === '3' || lowerMessage.includes('continuar')) {
      await this.userRepository.update(user.id, {
        onboardingStep: OnboardingStep.EMERGENCY_CONTACT,
      })

      return {
        response: `Entendido. Puedes vincular tu psicólogo más adelante.

Por último, ¿tienes algún contacto de confianza que quieras que notifiquemos solo en caso de emergencia?

(Esto es opcional)`,
        nextStep: OnboardingStep.EMERGENCY_CONTACT,
        onboardingCompleted: false,
      }
    }

    // No se encontró código válido
    return {
      response: `No pude identificar un código válido. Los códigos tienen entre 5 y 30 caracteres (letras y números).

Por favor, verifica el código con tu psicólogo y escríbelo de nuevo, o escoge una opción:

1️⃣ "Intentar otro código"
2️⃣ "Ingresar datos manualmente"
3️⃣ "Continuar sin vincular"`,
      nextStep: OnboardingStep.PSYCHOLOGIST_CODE,
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
