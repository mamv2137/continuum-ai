/**
 * Onboarding Step Value Object
 *
 * Representa los estados del proceso de onboarding conversacional.
 */

export enum OnboardingStep {
  NOT_STARTED = 'NOT_STARTED', // Usuario nuevo, nunca habló con el bot
  USER_TYPE = 'USER_TYPE', // Preguntando si es profesional o busca apoyo personal

  // ===== FLUJO PARA USUARIOS INDIVIDUALES =====
  NAME = 'NAME', // Mostrando mensaje de bienvenida y preguntando nombre
  WAITING_NAME = 'WAITING_NAME', // Esperando respuesta con el nombre
  EXPECTATIONS = 'EXPECTATIONS', // Preguntando qué lo trae aquí
  PSYCHOLOGIST = 'PSYCHOLOGIST', // Preguntando si tiene psicólogo (sí/no)
  PSYCHOLOGIST_REGISTERED = 'PSYCHOLOGIST_REGISTERED', // Preguntando si está registrado en Continuum
  PSYCHOLOGIST_CODE = 'PSYCHOLOGIST_CODE', // Esperando código del psicólogo
  PSYCHOLOGIST_NAME = 'PSYCHOLOGIST_NAME', // Preguntando nombre de psicólogo externo
  PSYCHOLOGIST_CONTACT = 'PSYCHOLOGIST_CONTACT', // Preguntando contacto de psicólogo externo
  EMERGENCY_CONTACT = 'EMERGENCY_CONTACT', // Preguntando si tiene contacto de emergencia
  EMERGENCY_CONTACT_NAME = 'EMERGENCY_CONTACT_NAME', // Pidiendo nombre del contacto
  EMERGENCY_CONTACT_PHONE = 'EMERGENCY_CONTACT_PHONE', // Pidiendo teléfono del contacto

  // ===== FLUJO PARA PSICÓLOGOS =====
  PSYCHO_NAME = 'PSYCHO_NAME', // Preguntando nombre del psicólogo
  PSYCHO_LICENSE = 'PSYCHO_LICENSE', // Preguntando cédula profesional (opcional)
  PSYCHO_PASSWORD = 'PSYCHO_PASSWORD', // Preguntando si quiere crear contraseña para web
  PSYCHO_PASSWORD_INPUT = 'PSYCHO_PASSWORD_INPUT', // Esperando la contraseña
  PSYCHO_COMPLETED = 'PSYCHO_COMPLETED', // Mostrando código de vinculación

  COMPLETED = 'COMPLETED', // Onboarding terminado
}

export class OnboardingState {
  constructor(private step: OnboardingStep) {}

  getStep(): OnboardingStep {
    return this.step
  }

  isCompleted(): boolean {
    return this.step === OnboardingStep.COMPLETED
  }

  /**
   * Obtiene el siguiente paso en la secuencia del onboarding
   */
  nextStep(skipPsychologist = false): OnboardingStep {
    const mainSequence = [
      OnboardingStep.NOT_STARTED,
      OnboardingStep.NAME,
      OnboardingStep.EXPECTATIONS,
      OnboardingStep.PSYCHOLOGIST,
      OnboardingStep.EMERGENCY_CONTACT,
      OnboardingStep.COMPLETED,
    ]

    // Si estamos en un sub-flujo de psicólogo, avanzar dentro de ese flujo
    if (
      this.step === OnboardingStep.PSYCHOLOGIST_CODE ||
      this.step === OnboardingStep.PSYCHOLOGIST_NAME ||
      this.step === OnboardingStep.PSYCHOLOGIST_CONTACT
    ) {
      // Estos sub-flujos eventualment llevan a EMERGENCY_CONTACT
      return OnboardingStep.EMERGENCY_CONTACT
    }

    const currentIndex = mainSequence.indexOf(this.step)

    if (currentIndex === -1 || currentIndex === mainSequence.length - 1) {
      return OnboardingStep.COMPLETED
    }

    let nextStep = mainSequence[currentIndex + 1]

    // Si el usuario no tiene psicólogo, saltar esa pregunta
    if (nextStep === OnboardingStep.PSYCHOLOGIST && skipPsychologist) {
      nextStep = OnboardingStep.EMERGENCY_CONTACT
    }

    return nextStep
  }

  /**
   * Verifica si el paso actual es parte de un sub-flujo
   */
  isSubFlow(): boolean {
    return (
      this.step === OnboardingStep.PSYCHOLOGIST_CODE ||
      this.step === OnboardingStep.PSYCHOLOGIST_NAME ||
      this.step === OnboardingStep.PSYCHOLOGIST_CONTACT
    )
  }

  /**
   * Obtiene el paso principal si estamos en un sub-flujo
   */
  getMainStep(): OnboardingStep {
    if (this.isSubFlow()) {
      return OnboardingStep.PSYCHOLOGIST
    }
    return this.step
  }
}
