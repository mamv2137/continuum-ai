/**
 * Process Psychologist Onboarding Use Case
 *
 * Maneja el flujo de onboarding específico para psicólogos
 */

import type { IUserRepository, UserEntity } from '../../repositories/interfaces/user.repository.interface'
import { OnboardingStep } from '../../domain/value-objects/onboarding-step.vo'
import { hashSync } from 'bcrypt'

export type ProcessPsychologistOnboardingInput = {
  userId: string
  message: string
  currentStep: OnboardingStep
}

export type ProcessPsychologistOnboardingOutput = {
  response: string
  nextStep: OnboardingStep
  onboardingCompleted: boolean
}

export class ProcessPsychologistOnboardingUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(
    input: ProcessPsychologistOnboardingInput
  ): Promise<ProcessPsychologistOnboardingOutput> {
    const user = await this.userRepository.findById(input.userId)

    if (!user) {
      throw new Error('User not found')
    }

    switch (input.currentStep) {
      case OnboardingStep.PSYCHO_NAME:
        return await this.handlePsychoNameStep(input, user)

      case OnboardingStep.PSYCHO_LICENSE:
        return await this.handlePsychoLicenseStep(input, user)

      case OnboardingStep.PSYCHO_PASSWORD:
        return await this.handlePsychoPasswordStep(input, user)

      case OnboardingStep.PSYCHO_PASSWORD_INPUT:
        return await this.handlePsychoPasswordInputStep(input, user)

      case OnboardingStep.PSYCHO_COMPLETED:
        return await this.handlePsychoCompletedStep(input, user)

      default:
        throw new Error(`Unknown psychologist onboarding step: ${input.currentStep}`)
    }
  }

  private extractName(message: string): string {
    let name = message.trim()

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

    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  private async handlePsychoNameStep(
    input: ProcessPsychologistOnboardingInput,
    user: UserEntity
  ): Promise<ProcessPsychologistOnboardingOutput> {
    const name = this.extractName(input.message)

    await this.userRepository.update(user.id, {
      name,
      role: 'PSYCHOLOGIST',
      onboardingStep: OnboardingStep.PSYCHO_LICENSE,
    })

    return {
      response: `Encantado, ${name}.

¿Cuál es tu número de cédula profesional?

Si no tienes o prefieres no compartirla ahora, responde "paso".`,
      nextStep: OnboardingStep.PSYCHO_LICENSE,
      onboardingCompleted: false,
    }
  }

  private async handlePsychoLicenseStep(
    input: ProcessPsychologistOnboardingInput,
    user: UserEntity
  ): Promise<ProcessPsychologistOnboardingOutput> {
    const message = input.message.trim().toLowerCase()
    const licenseNumber =
      message === 'paso' || message === 'no' ? null : input.message.trim()

    await this.userRepository.update(user.id, {
      licenseNumber,
      onboardingStep: OnboardingStep.PSYCHO_PASSWORD,
    })

    return {
      response: `Perfecto${user.name ? `, ${user.name}` : ''}.

¿Te gustaría crear una contraseña para acceder al dashboard web con tu email?

Puedes hacerlo ahora o usar magic links (te enviamos un link por WhatsApp cada vez que quieras acceder).

Responde "sí" para crear contraseña ahora, o "no" para usar magic links.`,
      nextStep: OnboardingStep.PSYCHO_PASSWORD,
      onboardingCompleted: false,
    }
  }

  private async handlePsychoPasswordStep(
    input: ProcessPsychologistOnboardingInput,
    user: UserEntity
  ): Promise<ProcessPsychologistOnboardingOutput> {
    const message = input.message.trim().toLowerCase()

    if (
      message.includes('si') ||
      message.includes('sí') ||
      message.includes('contraseña')
    ) {
      await this.userRepository.update(user.id, {
        onboardingStep: OnboardingStep.PSYCHO_PASSWORD_INPUT,
      })

      return {
        response: `Perfecto. Crea una contraseña segura (mínimo 8 caracteres).

⚠️ No compartas esta contraseña con nadie. La necesitarás para acceder al dashboard web.`,
        nextStep: OnboardingStep.PSYCHO_PASSWORD_INPUT,
        onboardingCompleted: false,
      }
    }

    // No quiere contraseña, generar código y completar
    return await this.completeOnboarding(user)
  }

  private async handlePsychoPasswordInputStep(
    input: ProcessPsychologistOnboardingInput,
    user: UserEntity
  ): Promise<ProcessPsychologistOnboardingOutput> {
    const password = input.message.trim()

    if (password.length < 8) {
      return {
        response: `La contraseña debe tener al menos 8 caracteres. Intenta de nuevo.`,
        nextStep: OnboardingStep.PSYCHO_PASSWORD_INPUT,
        onboardingCompleted: false,
      }
    }

    // Hash the password
    const hashedPassword = hashSync(password, 10)

    await this.userRepository.update(user.id, {
      password: hashedPassword,
    })

    return await this.completeOnboarding(user)
  }

  private async handlePsychoCompletedStep(
    input: ProcessPsychologistOnboardingInput,
    user: UserEntity
  ): Promise<ProcessPsychologistOnboardingOutput> {
    return await this.completeOnboarding(user)
  }

  private async completeOnboarding(
    user: UserEntity
  ): Promise<ProcessPsychologistOnboardingOutput> {
    // Generar código único para vincular pacientes
    const psychologistCode = this.generatePsychologistCode(user.name || 'PSYCHO')

    await this.userRepository.update(user.id, {
      psychologistCode,
      onboardingDone: true,
      onboardingStep: OnboardingStep.COMPLETED,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    })

    return {
      response: `¡Perfecto${user.name ? `, ${user.name}` : ''}! Tu cuenta de profesional está lista. 🎉

**Tu código de vinculación es:** \`${psychologistCode}\`

Comparte este código con tus pacientes para que puedan vincularse contigo.

**Comandos útiles:**
• /dashboard - Acceder a tu panel clínico
• /pacientes - Ver lista de pacientes
• /checkin - Hacer tu check-in personal
• /alertas on/off - Activar/desactivar notificaciones

También puedes pedirme cosas en lenguaje natural, como:
"Dame el reporte de la última sesión de María"
"Muéstrame mis pacientes de hoy"

¿En qué puedo ayudarte?`,
      nextStep: OnboardingStep.COMPLETED,
      onboardingCompleted: true,
    }
  }

  private generatePsychologistCode(name: string): string {
    // Generar código basado en el nombre + timestamp
    const cleanName = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-zA-Z]/g, '') // Solo letras
      .toUpperCase()
      .slice(0, 10)

    const timestamp = Date.now().toString().slice(-4)
    return `${cleanName}_${timestamp}`
  }
}
