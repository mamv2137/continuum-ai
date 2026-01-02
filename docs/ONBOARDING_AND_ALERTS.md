# Sistema de Onboarding y Alertas de Tendencias

> Documentación del sistema de onboarding conversacional y detección de patrones emocionales de riesgo.

## 📋 Índice

1. [Visión General](#visión-general)
2. [Fase 1: Onboarding Conversacional](#fase-1-onboarding-conversacional)
3. [Fase 2: Análisis de Tendencias](#fase-2-análisis-de-tendencias)
4. [Fase 3: Sistema de Alertas](#fase-3-sistema-de-alertas)
5. [Fase 4: Dashboard para Psicólogos](#fase-4-dashboard-para-psicólogos)
6. [Consideraciones Técnicas](#consideraciones-técnicas)
7. [Consideraciones Éticas y Legales](#consideraciones-éticas-y-legales)

---

## Visión General

### Objetivos

1. **Personalización**: Recopilar información básica del usuario para personalizar la experiencia
2. **Prevención de Crisis**: Detectar patrones emocionales de riesgo antes de que escalen
3. **Continuidad de Cuidado**: Conectar usuarios en crisis con sus recursos de apoyo
4. **Insights Clínicos**: Proveer datos valiosos a psicólogos sobre sus pacientes

### Principios Guía

- ✅ **No invasivo**: Las preguntas son opcionales y conversacionales
- ✅ **Transparencia**: El usuario sabe qué datos se recopilan y por qué
- ✅ **Autonomía**: El usuario decide si quiere escalar a ayuda profesional
- ✅ **Privacidad**: Datos sensibles separados (PII/PHI)
- ✅ **Clinicamente validado**: Umbrales de alerta basados en evidencia

---

## Fase 1: Onboarding Conversacional

### 1.1 Objetivo

Recopilar información básica del usuario de forma natural durante la primera conversación, sin formularios ni cuestionarios rígidos.

### 1.2 Flujo de Onboarding

```
Usuario: "Hola"
Bot: "¡Hola! 👋 Soy Continuum, tu asistente de check-in basado en Terapia Gestalt.

Antes de empezar, me gustaría conocerte un poco mejor.
¿Cómo te gustaría que te llame?"

Usuario: "María"
Bot: "Encantado, María. ¿Qué te trae por aquí hoy?"

Usuario: "Tengo ansiedad últimamente"
Bot: "Gracias por compartir eso, María.

Una pregunta más: ¿Tienes un psicólogo o terapeuta con quien trabajas actualmente?"

Usuario: "Sí, voy con la Dra. López"
Bot: "Perfecto. En caso de que notes patrones que necesiten atención,
podría sugerirte contactar con tu psicólogo. ¿Te parece bien?"

Usuario: "Sí, está bien"
Bot: "Excelente, María. Ya estamos listos para comenzar.

¿Cómo te sientes en este momento?"
```

### 1.3 Información a Recopilar

| Campo | Tipo | Obligatorio | Propósito |
|-------|------|-------------|-----------|
| `name` | String | No | Personalización |
| `hasPsychologist` | Boolean | No | Para escalamiento B2B2C |
| `psychologistName` | String | No | Contexto clínico |
| `emergencyContact` | String | No | Crisis |
| `timezone` | String | Sí | Análisis de horarios |
| `expectations` | Text | No | Calibrar experiencia |
| `previousTherapyExperience` | Boolean | No | Ajustar lenguaje |

### 1.4 Cambios en la Base de Datos

#### User Model (Actualizar)

```prisma
model User {
  id              String           @id @default(cuid())
  phoneNumber     String           @unique
  name            String?
  role            UserRole         @default(INDIVIDUAL)

  // === ONBOARDING ===
  onboardingDone      Boolean      @default(false)
  onboardingStep      String?      // "NAME" | "EXPECTATIONS" | "PSYCHOLOGIST" | "COMPLETED"

  // === INFORMACIÓN PERSONAL ===
  hasPsychologist         Boolean  @default(false)
  psychologistName        String?  // Solo si psicólogo NO está registrado
  psychologistContact     String?  // Teléfono/email del psicólogo externo
  emergencyContactName    String?
  emergencyContactPhone   String?
  previousTherapyExperience Boolean @default(false)

  // === CONFIGURACIÓN ===
  termsAccepted       Boolean      @default(false)
  termsAcceptedAt     DateTime?
  timezone            String       @default("America/Mexico_City")
  preferredLanguage   String       @default("es")

  // === RELACIONES ===
  account             Account?
  psychologistId      String?
  psychologist        Psychologist? @relation(fields: [psychologistId], references: [id], onDelete: SetNull)
  checkIns            CheckIn[]

  // === METADATA ===
  lastCheckInAt       DateTime?
  totalCheckIns       Int          @default(0)

  createdAt           DateTime     @default(now())
  updatedAt           DateTime     @updatedAt

  @@index([phoneNumber])
  @@index([psychologistId])
  @@index([role])
  @@index([onboardingDone])
}
```

### 1.5 Sistema de Estados del Onboarding

```typescript
// src/domain/value-objects/onboarding-step.vo.ts

export enum OnboardingStep {
  NOT_STARTED = 'NOT_STARTED',
  NAME = 'NAME',
  EXPECTATIONS = 'EXPECTATIONS',
  PSYCHOLOGIST = 'PSYCHOLOGIST',
  EMERGENCY_CONTACT = 'EMERGENCY_CONTACT',
  COMPLETED = 'COMPLETED',
}

export class OnboardingState {
  constructor(private step: OnboardingStep) {}

  getStep(): OnboardingStep {
    return this.step
  }

  isCompleted(): boolean {
    return this.step === OnboardingStep.COMPLETED
  }

  nextStep(): OnboardingStep {
    const sequence = [
      OnboardingStep.NOT_STARTED,
      OnboardingStep.NAME,
      OnboardingStep.EXPECTATIONS,
      OnboardingStep.PSYCHOLOGIST,
      OnboardingStep.EMERGENCY_CONTACT,
      OnboardingStep.COMPLETED,
    ]

    const currentIndex = sequence.indexOf(this.step)
    if (currentIndex === -1 || currentIndex === sequence.length - 1) {
      return OnboardingStep.COMPLETED
    }

    return sequence[currentIndex + 1]
  }
}
```

### 1.6 Lógica en el System Prompt

```typescript
// src/config/prompts/onboarding.prompt.ts

export const ONBOARDING_SYSTEM_PROMPT = `
Eres Continuum, un asistente de check-in basado en Terapia Gestalt.

# FASE DE ONBOARDING

El usuario es nuevo y necesitas recopilar información básica de forma conversacional.

## Reglas de Onboarding:

1. **Ser natural**: No parecer un formulario. Haz preguntas en el flujo de conversación.
2. **Respetar el ritmo**: Si el usuario quiere hablar de otra cosa, permítelo.
3. **Ser transparente**: Explica por qué preguntas algo si es sensible.
4. **No forzar**: Si el usuario no quiere responder, continúa sin presionar.

## Secuencia de Preguntas:

### 1. Nombre (Opcional)
"¿Cómo te gustaría que te llame?"
- Si responde: Usar ese nombre en adelante
- Si no quiere: "No hay problema, puedes decirme más adelante"

### 2. Expectativas (Opcional)
"¿Qué te trae por aquí hoy?" o "¿Qué esperas de este espacio?"
- Ayuda a calibrar el tipo de acompañamiento

### 3. Psicólogo (Importante para escalamiento)
"¿Tienes un psicólogo o terapeuta con quien trabajas actualmente?"

**Caso A: Usuario tiene código del psicólogo**
- Usuario: "Sí, me dio este código: sersentiryconectar"
- Sistema busca en BD por `Psychologist.code`
- Si existe: Vincula automáticamente (`User.psychologistId`, `User.role = PATIENT`)
- Bot: "¡Perfecto! Te he vinculado con [Nombre]. Podré sugerirte contactarlo si noto patrones importantes."

**Caso B: Usuario tiene psicólogo NO registrado**
- Usuario: "Sí, pero no me dio código"
- Bot: "¿Cuál es su nombre completo?"
- Bot: "¿Y su número o email?"
- Sistema guarda: `User.psychologistName`, `User.psychologistContact`
- Usuario sigue como `INDIVIDUAL` (no B2B2C)

**Caso C: No tiene psicólogo**
- Si dice NO: "Entendido. ¿Te gustaría que te sugiera recursos profesionales si lo necesitas?"

### 4. Contacto de Emergencia (Opcional pero valioso)
"Por último, ¿tienes algún contacto de confianza que quieras que notifiquemos en caso de emergencia?"
- Explicar: Solo se usará en situaciones de crisis
- Si no quiere: Respetar la decisión

### 5. Finalizar Onboarding
"Perfecto, [nombre]. Ya estamos listos para comenzar tu primer check-in.

¿Cómo te sientes en este momento?"

## Después del Onboarding:

- Marca internamente: ONBOARDING_COMPLETED = true
- En futuros check-ins, NO repetir la introducción "Soy Continuum, tu asistente..."
- Usar saludos más directos: "¡Hola María! ¿Cómo estás en este momento?"
`
```

### 1.7 Implementación en el Use Case

```typescript
// src/use-cases/onboarding/process-onboarding-message.use-case.ts

export class ProcessOnboardingMessageUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly geminiService: GeminiService
  ) {}

  async execute(input: { phoneNumber: string; message: string }) {
    const phoneNumber = new PhoneNumber(input.phoneNumber)
    const user = await this.userRepository.findByPhoneNumber(phoneNumber)

    if (!user || user.onboardingDone) {
      throw new Error('User already completed onboarding')
    }

    // Detectar información del mensaje del usuario con Gemini
    const extractedInfo = await this.geminiService.extractOnboardingInfo(
      user.onboardingStep || 'NOT_STARTED',
      input.message
    )

    // Actualizar usuario con la información extraída
    const updates: Partial<User> = {}

    if (extractedInfo.name) updates.name = extractedInfo.name
    if (extractedInfo.hasPsychologist !== undefined) {
      updates.hasPsychologist = extractedInfo.hasPsychologist
    }
    if (extractedInfo.psychologistName) {
      updates.psychologistName = extractedInfo.psychologistName
    }
    // ... otros campos

    // Avanzar al siguiente paso
    const currentStep = user.onboardingStep || OnboardingStep.NOT_STARTED
    const nextStep = this.getNextStep(currentStep, extractedInfo)
    updates.onboardingStep = nextStep

    // Si completó el onboarding
    if (nextStep === OnboardingStep.COMPLETED) {
      updates.onboardingDone = true
    }

    await this.userRepository.update(user.id, updates)

    // Generar siguiente pregunta o iniciar check-in
    const response = await this.geminiService.generateOnboardingResponse(
      nextStep,
      user.name || null
    )

    return { response, nextStep }
  }

  private getNextStep(
    current: string,
    extractedInfo: any
  ): OnboardingStep {
    // Lógica para determinar siguiente paso
    // Puede saltar pasos si el usuario ya proveyó info
    // ...
  }
}
```

---

## Fase 2: Análisis de Tendencias

### 2.1 Objetivo

Analizar el historial de check-ins del usuario para detectar patrones emocionales que puedan indicar riesgo o necesidad de intervención profesional.

### 2.2 Patrones a Detectar

#### Patrón 1: Emoción Recurrente
- **Definición**: Misma emoción negativa (ansiedad, tristeza, enojo) aparece en 3+ check-ins consecutivos
- **Riesgo**: Medio
- **Acción**: Sugerir contactar psicólogo si tiene

#### Patrón 2: Intensidad Alta Sostenida
- **Definición**: Sensaciones corporales con intensidad 8-10/10 durante 3+ días
- **Riesgo**: Alto
- **Acción**: Ofrecer ayuda inmediata

#### Patrón 3: Horario de Crisis
- **Definición**: Check-ins con emociones negativas siempre en el mismo horario (±2h)
- **Riesgo**: Medio
- **Acción**: Insight sobre el patrón temporal + sugerencia de apoyo

#### Patrón 4: Palabras de Riesgo
- **Definición**: Menciones de: "no puedo más", "quiero desaparecer", "autolesión", etc.
- **Riesgo**: Crítico
- **Acción**: Escalamiento inmediato

#### Patrón 5: Abandono Repentino
- **Definición**: Usuario con check-ins regulares que deja de usar la app por 5+ días
- **Riesgo**: Medio-Alto
- **Acción**: Mensaje proactivo preguntando cómo está

### 2.3 Cambios en la Base de Datos

#### TrendAlert Model (Nueva)

```prisma
enum AlertType {
  RECURRING_EMOTION      // Misma emoción 3+ días
  HIGH_INTENSITY         // Intensidad 8-10 sostenida
  TIME_PATTERN           // Crisis en mismo horario
  RISK_KEYWORDS          // Palabras de riesgo
  SUDDEN_ABANDONMENT     // Dejó de usar la app
}

enum AlertSeverity {
  LOW      // Informativo
  MEDIUM   // Sugerir ayuda
  HIGH     // Recomendar contacto
  CRITICAL // Escalamiento inmediato
}

model TrendAlert {
  id              String         @id @default(cuid())
  userId          String
  user            User           @relation(fields: [userId], references: [id], onDelete: Cascade)

  // === TIPO DE ALERTA ===
  type            AlertType
  severity        AlertSeverity

  // === DETALLES DEL PATRÓN ===
  pattern         Json           // Datos específicos del patrón detectado
  affectedCheckIns String[]      // IDs de los check-ins involucrados
  timeWindow      String         // Ej: "últimos 7 días"

  // === MENSAJE PARA EL USUARIO ===
  userMessage     String         @db.Text
  suggestedAction String?        @db.Text

  // === ESTADO ===
  acknowledged    Boolean        @default(false) // Usuario vio la alerta
  actionTaken     String?        // "contacted_psychologist" | "contacted_emergency" | "dismissed"

  // === ESCALAMIENTO ===
  psychologistNotified Boolean   @default(false)
  psychologistNotifiedAt DateTime?
  emergencyNotified    Boolean   @default(false)
  emergencyNotifiedAt  DateTime?

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  @@index([userId, createdAt(sort: Desc)])
  @@index([severity])
  @@index([type])
  @@index([acknowledged])
}
```

### 2.4 Caso de Uso: Analizar Tendencias

```typescript
// src/use-cases/trends/analyze-emotional-trends.use-case.ts

export type TrendAnalysisResult = {
  hasPattern: boolean
  alerts: TrendAlert[]
  insights: string[]
}

export class AnalyzeEmotionalTrendsUseCase {
  constructor(
    private readonly checkInRepository: ICheckInRepository,
    private readonly alertRepository: IAlertRepository
  ) {}

  async execute(userId: string): Promise<TrendAnalysisResult> {
    // 1. Obtener últimos 10 check-ins completados
    const recentCheckIns = await this.checkInRepository.findRecentByUserId(
      userId,
      10
    )

    if (recentCheckIns.length < 3) {
      // No hay suficiente historial
      return { hasPattern: false, alerts: [], insights: [] }
    }

    // 2. Detectar patrones
    const alerts: TrendAlert[] = []

    // Patrón 1: Emoción recurrente
    const recurringEmotion = this.detectRecurringEmotion(recentCheckIns)
    if (recurringEmotion) {
      alerts.push(recurringEmotion)
    }

    // Patrón 2: Intensidad alta sostenida
    const highIntensity = this.detectHighIntensity(recentCheckIns)
    if (highIntensity) {
      alerts.push(highIntensity)
    }

    // Patrón 3: Horario de crisis
    const timePattern = this.detectTimePattern(recentCheckIns)
    if (timePattern) {
      alerts.push(timePattern)
    }

    // 3. Guardar alertas en BD
    for (const alert of alerts) {
      await this.alertRepository.create(alert)
    }

    // 4. Generar insights
    const insights = this.generateInsights(alerts, recentCheckIns)

    return {
      hasPattern: alerts.length > 0,
      alerts,
      insights,
    }
  }

  private detectRecurringEmotion(
    checkIns: CheckInEntity[]
  ): TrendAlert | null {
    // Obtener últimos 5 check-ins
    const last5 = checkIns.slice(0, 5)

    // Contar emociones
    const emotionCounts: Record<string, number> = {}
    for (const checkIn of last5) {
      const tone = checkIn.getEmotionalTone()?.getValue()
      if (tone && tone !== EmotionalToneType.NEUTRAL) {
        emotionCounts[tone] = (emotionCounts[tone] || 0) + 1
      }
    }

    // Si alguna emoción aparece 3+ veces
    for (const [emotion, count] of Object.entries(emotionCounts)) {
      if (count >= 3) {
        return new TrendAlert({
          type: AlertType.RECURRING_EMOTION,
          severity: AlertSeverity.MEDIUM,
          pattern: {
            emotion,
            occurrences: count,
            totalCheckIns: last5.length,
          },
          affectedCheckIns: last5
            .filter((c) => c.getEmotionalTone()?.getValue() === emotion)
            .map((c) => c.getId()),
          timeWindow: 'últimos 5 check-ins',
          userMessage: this.buildRecurringEmotionMessage(emotion, count),
          suggestedAction: 'Considera hablar con tu psicólogo sobre este patrón',
        })
      }
    }

    return null
  }

  private detectHighIntensity(checkIns: CheckInEntity[]): TrendAlert | null {
    // Buscar check-ins con sensaciones de intensidad >= 8
    const highIntensityCheckIns = checkIns.filter((checkIn) => {
      const zones = checkIn.getInternalZones()
      return zones.some((zone) => {
        const intensity = zone.getIntensity()
        return intensity !== null && intensity >= 8
      })
    })

    if (highIntensityCheckIns.length >= 3) {
      return new TrendAlert({
        type: AlertType.HIGH_INTENSITY,
        severity: AlertSeverity.HIGH,
        pattern: {
          count: highIntensityCheckIns.length,
          avgIntensity: this.calculateAvgIntensity(highIntensityCheckIns),
        },
        affectedCheckIns: highIntensityCheckIns.map((c) => c.getId()),
        timeWindow: `últimos ${checkIns.length} check-ins`,
        userMessage:
          'Noto que has estado experimentando sensaciones muy intensas (8-10/10) en varios check-ins recientes.',
        suggestedAction:
          'Esto podría ser importante. ¿Te gustaría hablar con alguien sobre esto?',
      })
    }

    return null
  }

  private detectTimePattern(checkIns: CheckInEntity[]): TrendAlert | null {
    // Analizar horarios de check-ins con emociones negativas
    const negativeCheckIns = checkIns.filter((checkIn) => {
      const tone = checkIn.getEmotionalTone()?.getValue()
      return (
        tone === EmotionalToneType.ANXIETY ||
        tone === EmotionalToneType.SADNESS ||
        tone === EmotionalToneType.ANGER ||
        tone === EmotionalToneType.FEAR
      )
    })

    if (negativeCheckIns.length < 3) return null

    // Obtener horas de los check-ins
    const hours = negativeCheckIns.map((c) => c.getCreatedAt().getHours())

    // Calcular si hay un rango horario recurrente (±2h)
    const hourClusters = this.findHourClusters(hours, 2)

    for (const cluster of hourClusters) {
      if (cluster.count >= 3) {
        return new TrendAlert({
          type: AlertType.TIME_PATTERN,
          severity: AlertSeverity.MEDIUM,
          pattern: {
            peakHour: cluster.centerHour,
            range: `${cluster.centerHour - 2}:00 - ${cluster.centerHour + 2}:00`,
            occurrences: cluster.count,
          },
          affectedCheckIns: negativeCheckIns
            .filter((c) => {
              const h = c.getCreatedAt().getHours()
              return Math.abs(h - cluster.centerHour) <= 2
            })
            .map((c) => c.getId()),
          timeWindow: 'últimos check-ins',
          userMessage: `Noto que tiendes a sentirte más ansioso/a alrededor de las ${cluster.centerHour}:00.`,
          suggestedAction:
            '¿Hay algo que suceda en ese horario que pueda estar relacionado?',
        })
      }
    }

    return null
  }

  private buildRecurringEmotionMessage(
    emotion: string,
    count: number
  ): string {
    const emotionNames: Record<string, string> = {
      [EmotionalToneType.ANXIETY]: 'ansiedad',
      [EmotionalToneType.SADNESS]: 'tristeza',
      [EmotionalToneType.ANGER]: 'enojo',
      [EmotionalToneType.FEAR]: 'miedo',
    }

    const emotionName = emotionNames[emotion] || emotion.toLowerCase()

    return `He notado que en ${count} de tus últimos check-ins has mencionado ${emotionName}.`
  }

  private findHourClusters(
    hours: number[],
    tolerance: number
  ): Array<{ centerHour: number; count: number }> {
    // Agrupar horas similares (±tolerance)
    const clusters: Array<{ centerHour: number; count: number }> = []

    for (let h = 0; h < 24; h++) {
      const matchingHours = hours.filter(
        (hour) => Math.abs(hour - h) <= tolerance
      )
      if (matchingHours.length > 0) {
        clusters.push({ centerHour: h, count: matchingHours.length })
      }
    }

    return clusters.sort((a, b) => b.count - a.count)
  }

  private calculateAvgIntensity(checkIns: CheckInEntity[]): number {
    let total = 0
    let count = 0

    for (const checkIn of checkIns) {
      const zones = checkIn.getInternalZones()
      for (const zone of zones) {
        const intensity = zone.getIntensity()
        if (intensity !== null) {
          total += intensity
          count++
        }
      }
    }

    return count > 0 ? Math.round(total / count) : 0
  }

  private generateInsights(
    alerts: TrendAlert[],
    checkIns: CheckInEntity[]
  ): string[] {
    const insights: string[] = []

    if (alerts.length === 0) {
      insights.push('Tu estado emocional parece estar estable.')
      return insights
    }

    // Generar insights basados en las alertas
    for (const alert of alerts) {
      insights.push(alert.userMessage)
    }

    return insights
  }
}
```

### 2.5 Integración en el Flujo Principal

```typescript
// En process-message.use-case.ts, después de completar un check-in:

// Analizar tendencias si el usuario tiene suficiente historial
if (user.totalCheckIns >= 3) {
  const trendAnalysis = await this.analyzeTrendsUseCase.execute(user.id)

  if (trendAnalysis.hasPattern && trendAnalysis.alerts.length > 0) {
    // Agregar mensaje sobre el patrón detectado
    const alertMessage = this.buildAlertMessage(
      trendAnalysis.alerts,
      user.hasPsychologist
    )

    checkIn.addMessage('model', alertMessage)
  }
}
```

---

## Fase 3: Sistema de Alertas

### 3.1 Objetivo

Ofrecer al usuario opciones de ayuda cuando se detectan patrones de riesgo, y permitir escalamiento a psicólogo o contacto de emergencia.

### 3.2 Flujo de Alerta

```
Bot: "María, he notado algo importante.

En tus últimos 4 check-ins has mencionado ansiedad intensa,
especialmente alrededor de las 22:00.

¿Te gustaría que te ayude a contactar a alguien para hablar sobre esto?"

Opciones:
1️⃣ Contactar a mi psicólogo
2️⃣ Hablar con mi contacto de emergencia
3️⃣ Estoy bien, solo quería hacer mi check-in
4️⃣ Recordármelo más tarde

Usuario: "1"

Bot: "Perfecto. Voy a enviar una notificación a tu psicólogo (Dra. López)
para que pueda revisar tu historial y contactarte.

Mientras tanto, ¿hay algo específico que quieras que sepa?"
```

### 3.3 Detección de Palabras de Riesgo Crítico

```typescript
// src/services/safety/crisis-detection.service.ts

export class CrisisDetectionService {
  private readonly criticalKeywords = [
    // Autolesión
    'autolesión',
    'cortarme',
    'lastimarme',
    'hacerme daño',

    // Suicidio
    'suicidio',
    'matarme',
    'quitarme la vida',
    'acabar con todo',
    'no quiero seguir',
    'quiero desaparecer',

    // Desesperación extrema
    'no puedo más',
    'ya no aguanto',
    'no tiene sentido',
  ]

  detectCrisis(message: string): {
    isCrisis: boolean
    severity: 'HIGH' | 'CRITICAL'
    keywords: string[]
  } {
    const lowerMessage = message.toLowerCase()
    const foundKeywords: string[] = []

    for (const keyword of this.criticalKeywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        foundKeywords.push(keyword)
      }
    }

    if (foundKeywords.length === 0) {
      return { isCrisis: false, severity: 'HIGH', keywords: [] }
    }

    // Palabras de suicidio = CRÍTICO
    const suicideKeywords = foundKeywords.filter((k) =>
      ['suicidio', 'matarme', 'quitarme la vida'].includes(k.toLowerCase())
    )

    const severity = suicideKeywords.length > 0 ? 'CRITICAL' : 'HIGH'

    return { isCrisis: true, severity, keywords: foundKeywords }
  }

  buildCrisisMessage(
    user: User,
    crisisInfo: { severity: 'HIGH' | 'CRITICAL'; keywords: string[] }
  ): string {
    if (crisisInfo.severity === 'CRITICAL') {
      return `${user.name || 'Hola'}, noto que estás pasando por un momento muy difícil.

**Es muy importante que hables con alguien ahora mismo.**

📞 **Líneas de ayuda 24/7:**
• Argentina: 135 (Asistencia al Suicida)
• México: 55 5259-8121 (SAPTEL)
• España: 717 003 717

${
  user.hasPsychologist
    ? '¿Quieres que contacte a tu psicólogo ahora?'
    : '¿Tienes a alguien de confianza que pueda acompañarte en este momento?'
}

No estás solo/a. 💚`
    }

    // HIGH severity
    return `${user.name || 'Hola'}, noto que estás pasando por un momento complicado.

${
  user.hasPsychologist
    ? '¿Te gustaría que contacte a tu psicólogo para que puedan hablar?'
    : '¿Hay alguien de confianza con quien puedas hablar sobre esto?'
}

Recuerda que pedir ayuda es un acto de fortaleza. 💚`
  }
}
```

### 3.4 Escalamiento a Psicólogo

```typescript
// src/use-cases/alerts/escalate-to-psychologist.use-case.ts

export class EscalateToPsychologistUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly alertRepository: IAlertRepository,
    private readonly notificationService: INotificationService
  ) {}

  async execute(input: {
    userId: string
    alertId: string
    userNote?: string
  }): Promise<void> {
    const user = await this.userRepository.findById(input.userId)

    if (!user || !user.psychologistId) {
      throw new Error('User does not have an assigned psychologist')
    }

    const alert = await this.alertRepository.findById(input.alertId)

    if (!alert) {
      throw new Error('Alert not found')
    }

    // Marcar alerta como escalada
    await this.alertRepository.update(input.alertId, {
      actionTaken: 'contacted_psychologist',
      psychologistNotified: true,
      psychologistNotifiedAt: new Date(),
    })

    // Enviar notificación al psicólogo
    await this.notificationService.notifyPsychologist({
      psychologistId: user.psychologistId,
      patientId: user.id,
      patientName: user.name || 'Paciente',
      alertType: alert.type,
      severity: alert.severity,
      message: alert.userMessage,
      patientNote: input.userNote,
      checkInIds: alert.affectedCheckIns,
    })

    // Log para auditoría
    console.log(
      `[ESCALATION] User ${user.id} alert ${alert.id} escalated to psychologist ${user.psychologistId}`
    )
  }
}
```

---

## Fase 4: Dashboard para Psicólogos

### 4.1 Objetivo

Proveer a los psicólogos una vista consolidada de sus pacientes, con énfasis en alertas activas y tendencias emocionales.

### 4.2 Vista de Dashboard

```
╔═══════════════════════════════════════════════════════════════╗
║          Dashboard del Dr. López - Continuum AI               ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  🚨 ALERTAS ACTIVAS (3)                                       ║
║  ────────────────────────────────────────────────────────     ║
║  ⚠️  María García                                             ║
║      • Ansiedad recurrente (4 días consecutivos)              ║
║      • Última actividad: hace 2 horas                         ║
║      [Ver detalles]  [Contactar]                              ║
║                                                               ║
║  🔴 Juan Pérez                                                 ║
║      • Intensidad alta sostenida (8-10/10)                    ║
║      • Última actividad: hace 5 horas                         ║
║      • Paciente solicitó contacto                             ║
║      [Ver detalles]  [Contactar]  [URGENTE]                   ║
║                                                               ║
║  ⚠️  Ana Rodríguez                                            ║
║      • Patrón temporal: crisis nocturnas (22:00-00:00)        ║
║      • Última actividad: hace 1 día                           ║
║      [Ver detalles]  [Contactar]                              ║
║                                                               ║
║  ────────────────────────────────────────────────────────     ║
║                                                               ║
║  📊 MIS PACIENTES (12)                                        ║
║  ────────────────────────────────────────────────────────     ║
║  [Filtros: Todos | Con alertas | Activos | Inactivos]        ║
║                                                               ║
║  Nombre           Último Check-in    Estado       Tendencia   ║
║  ─────────────────────────────────────────────────────────    ║
║  María García     Hace 2 horas       ⚠️ Alerta    ↗️ Ansiedad║
║  Juan Pérez       Hace 5 horas       🔴 Crítico   ↗️↗️ Alta  ║
║  Ana Rodríguez    Hace 1 día         ⚠️ Alerta    → Estable  ║
║  Carlos Sánchez   Hace 3 días        ✅ Bien      ↘️ Mejora  ║
║  ...                                                          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

### 4.3 Vista de Detalle del Paciente

```
╔═══════════════════════════════════════════════════════════════╗
║          María García - Historial Clínico                     ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  📋 INFORMACIÓN BÁSICA                                        ║
║  ────────────────────────────────────────────────────────     ║
║  Teléfono: +54 911 xxxx-3619                                  ║
║  Primera sesión: 15 Dic 2024                                  ║
║  Total check-ins: 12                                          ║
║  Última actividad: Hace 2 horas                               ║
║                                                               ║
║  ────────────────────────────────────────────────────────     ║
║                                                               ║
║  🚨 ALERTAS ACTIVAS (1)                                       ║
║  ────────────────────────────────────────────────────────     ║
║  ⚠️  Ansiedad recurrente                                      ║
║      Detectada: Hace 1 día                                    ║
║      Patrón: Ansiedad en 4 de los últimos 5 check-ins        ║
║      Horario: Principalmente 21:00-23:00                      ║
║      Check-ins afectados: #10, #11, #12, #13                  ║
║                                                               ║
║      Mensaje del paciente:                                    ║
║      "Me gustaría hablar contigo sobre esto"                  ║
║                                                               ║
║      [Ver conversaciones]  [Marcar como revisada]             ║
║                                                               ║
║  ────────────────────────────────────────────────────────     ║
║                                                               ║
║  📈 TENDENCIAS EMOCIONALES (Últimos 30 días)                  ║
║  ────────────────────────────────────────────────────────     ║
║  [Gráfico de línea mostrando evolución de emociones]          ║
║                                                               ║
║  Ansiedad  ████████████████░░░░  80%                          ║
║  Calma     ████░░░░░░░░░░░░░░░  20%                          ║
║  Tristeza  ██████░░░░░░░░░░░░░  30%                          ║
║                                                               ║
║  ────────────────────────────────────────────────────────     ║
║                                                               ║
║  🔍 ÚLTIMOS CHECK-INS                                         ║
║  ────────────────────────────────────────────────────────     ║
║  #13 - Hoy 22:15 - ⚠️ Ansiedad alta                          ║
║       Zona Externa: Habitación en silencio, luz tenue         ║
║       Zona Interna: Presión en el pecho (8/10)                ║
║       Zona Fantasía: "Miedo a no dormir otra vez"             ║
║       [Ver conversación completa]                             ║
║                                                               ║
║  #12 - Ayer 21:45 - ⚠️ Ansiedad                              ║
║       Zona Externa: En la cama, ruido de la calle             ║
║       Zona Interna: Nudo en garganta (7/10)                   ║
║       [Ver conversación completa]                             ║
║                                                               ║
║  #11 - 2 días atrás 22:30 - ⚠️ Ansiedad                      ║
║       [Ver conversación completa]                             ║
║                                                               ║
║  [Ver todos los check-ins]                                    ║
║                                                               ║
║  ────────────────────────────────────────────────────────     ║
║                                                               ║
║  📝 NOTAS CLÍNICAS                                            ║
║  ────────────────────────────────────────────────────────     ║
║  [Agregar nota privada]                                       ║
║                                                               ║
║  • 10 Dic 2024 - Dr. López                                    ║
║    "Paciente presenta insomnio de conciliación relacionado    ║
║     con ansiedad anticipatoria..."                            ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

### 4.4 Endpoints de API para Dashboard

```typescript
// src/app/api/psychologist/dashboard/route.ts

/**
 * GET /api/psychologist/dashboard
 *
 * Retorna resumen del dashboard del psicólogo
 */
export async function GET(request: NextRequest) {
  const psychologistId = await getAuthenticatedPsychologistId(request)

  const dashboard = await getDashboardUseCase.execute({ psychologistId })

  return NextResponse.json({
    success: true,
    data: {
      activeAlerts: dashboard.activeAlerts,
      totalPatients: dashboard.totalPatients,
      recentActivity: dashboard.recentActivity,
      trends: dashboard.trends,
    },
  })
}

/**
 * GET /api/psychologist/patients/:patientId
 *
 * Retorna detalle completo de un paciente
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  const psychologistId = await getAuthenticatedPsychologistId(request)

  const patientDetail = await getPatientDetailUseCase.execute({
    psychologistId,
    patientId: params.patientId,
  })

  return NextResponse.json({
    success: true,
    data: patientDetail,
  })
}
```

---

## Consideraciones Técnicas

### 1. Performance

- **Caché de análisis**: Analizar tendencias solo después de completar check-in, no en cada mensaje
- **Índices de BD**: Agregar índices en `checkIns.userId + createdAt` para queries rápidas
- **Background jobs**: Detección de abandono se puede ejecutar en cron job nocturno

### 2. Privacidad

- **Encriptación**: Considerar encriptar `rawChatLog` en BD
- **Acceso auditado**: Cada vez que un psicólogo ve datos de paciente, registrar en audit log
- **Consentimiento explícito**: Usuario debe aceptar que su psicólogo pueda ver sus check-ins

### 3. Testing

- **Unit tests**: Para cada detector de patrón
- **Integration tests**: Para flujo completo de alerta
- **Mock data**: Crear fixtures de check-ins con patrones conocidos

### 4. Monitoreo

- **Métricas clave**:
  - Número de alertas generadas por día
  - Tasa de escalamiento (% de alertas que resultan en contacto)
  - Tiempo de respuesta del psicólogo a alertas críticas
  - Falsos positivos (alertas que el usuario descarta)

---

## Consideraciones Éticas y Legales

### 1. Limitaciones del Sistema

**Disclaimer claro:**
```
"Continuum es una herramienta de autoconocimiento, NO un servicio
de diagnóstico o tratamiento médico. Las alertas son sugerencias
basadas en patrones, no diagnósticos clínicos."
```

### 2. Autonomía del Usuario

- ✅ El usuario SIEMPRE puede declinar ayuda
- ✅ No enviar notificaciones automáticas sin consentimiento
- ✅ El usuario puede desactivar detección de patrones

### 3. Responsabilidad Profesional

- ⚠️ El psicólogo es responsable de revisar alertas en tiempo razonable
- ⚠️ Sistema debe tener disclaimer de que no reemplaza supervisión clínica
- ⚠️ En caso de crisis crítica, el sistema solo SUGIERE líneas de ayuda, no reemplaza intervención

### 4. Cumplimiento Normativo

- **GDPR/Ley de Protección de Datos**: Usuario puede solicitar eliminación de datos
- **HIPAA (si aplica en USA)**: Separación estricta PII/PHI ya implementada
- **Registro profesional**: Validar que psicólogos tengan licencia activa

### 5. Manejo de Crisis Real

**Si el sistema detecta riesgo suicida:**
1. Mostrar SIEMPRE líneas de ayuda 24/7
2. Ofrecer contactar psicólogo/emergencia (no obligar)
3. Si usuario acepta, enviar notificación con alta prioridad
4. NO asumir responsabilidad de intervención directa

---

## Roadmap de Implementación

### Sprint 1: Onboarding (1-2 semanas)
- [ ] Actualizar schema de BD (User.onboardingStep, etc.)
- [ ] Crear `OnboardingStep` value object
- [ ] Implementar `ProcessOnboardingMessageUseCase`
- [ ] Actualizar `generateWelcomeQuestion()` en GeminiService
- [ ] Agregar lógica de detección de información con Gemini
- [ ] Testing manual con UI de chat
- [ ] Documentar flujo de onboarding

### Sprint 2: Análisis Básico de Tendencias (2 semanas)
- [ ] Crear tabla `TrendAlert` en schema
- [ ] Implementar `AnalyzeEmotionalTrendsUseCase`
- [ ] Desarrollar detectores de patrones:
  - [ ] Emoción recurrente
  - [ ] Intensidad alta
  - [ ] Patrón temporal
- [ ] Integrar análisis en `ProcessMessageUseCase`
- [ ] Tests unitarios de detectores
- [ ] UI: Mostrar insights al usuario

### Sprint 3: Detección de Crisis (1 semana)
- [ ] Implementar `CrisisDetectionService`
- [ ] Lista de palabras clave de riesgo
- [ ] Mensajes de crisis con líneas de ayuda
- [ ] Testing con mensajes de riesgo simulados

### Sprint 4: Sistema de Alertas (2 semanas)
- [ ] Implementar `EscalateToPsychologistUseCase`
- [ ] Implementar `NotificationService` (email/SMS)
- [ ] UI: Opciones de escalamiento para usuario
- [ ] Testing de flujo de escalamiento

### Sprint 5: Dashboard Psicólogo - Fase 1 (2-3 semanas)
- [ ] Autenticación de psicólogos
- [ ] API endpoints de dashboard
- [ ] Vista de alertas activas
- [ ] Vista de lista de pacientes
- [ ] Vista de detalle de paciente básica

### Sprint 6: Dashboard Psicólogo - Fase 2 (2 semanas)
- [ ] Gráficos de tendencias emocionales
- [ ] Vista de conversaciones completas
- [ ] Sistema de notas clínicas
- [ ] Filtros y búsqueda

### Sprint 7: Refinamiento y Testing (1-2 semanas)
- [ ] Testing end-to-end de todos los flujos
- [ ] Ajustes basados en feedback
- [ ] Optimización de performance
- [ ] Documentación completa

**Total estimado: 12-15 semanas**

---

## Referencias

### Papers y Guías Clínicas
- Columbia-Suicide Severity Rating Scale (C-SSRS)
- WHO Guidelines on Mental Health Crisis Intervention
- Gestalt Therapy: Principles and Practices (Perls, Hefferline, Goodman)

### Recursos Técnicos
- Prisma Best Practices: https://www.prisma.io/docs
- Gemini API Safety Settings: https://ai.google.dev/docs/safety_setting_gemini
- GDPR Compliance for Healthcare Apps

---

**Documento vivo** - Última actualización: 2024-12-30
