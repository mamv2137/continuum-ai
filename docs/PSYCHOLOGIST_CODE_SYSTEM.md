# Sistema de Códigos de Psicólogos

> Sistema para vincular pacientes con psicólogos registrados mediante códigos únicos.

## 📋 Visión General

Los psicólogos registrados en Continuum tienen un **código único** (ej: `sersentiryconectar`) que pueden compartir con sus pacientes. Cuando un paciente ingresa este código durante el onboarding, se vincula automáticamente con el psicólogo.

## 🎯 Beneficios

✅ **Para el paciente:**
- Vinculación instantánea con su psicólogo
- El bot puede escalar alertas directamente al profesional
- El psicólogo puede ver su historial de check-ins

✅ **Para el psicólogo:**
- Fácil onboarding de pacientes (solo compartir código)
- Dashboard automático con todos sus pacientes
- Alertas proactivas cuando pacientes necesitan atención

---

## 🔄 Flujo Completo del Onboarding

### Estado: `PSYCHOLOGIST`

**Bot pregunta:**
```
Gracias por compartir eso, María.

Una pregunta: ¿Tienes un psicólogo o terapeuta con quien
trabajas actualmente?
```

---

### Caso A: Usuario tiene código del psicólogo 🔑

**Usuario responde:**
```
"Sí, me dio este código: sersentiryconectar"
```

**Sistema ejecuta:**

1. **Detecta código** (con Gemini o regex)
   ```typescript
   const code = extractPsychologistCode(message) // "sersentiryconectar"
   ```

2. **Busca psicólogo en BD**
   ```typescript
   const psychologist = await prisma.psychologist.findUnique({
     where: { code: 'sersentiryconectar' }
   })
   ```

3. **Si el código existe:**
   ```typescript
   // Vincular paciente con psicólogo
   await prisma.user.update({
     where: { id: user.id },
     data: {
       hasPsychologist: true,
       psychologistId: psychologist.id,
       role: 'PATIENT', // Ahora es paciente B2B2C
     }
   })
   ```

   **Bot responde:**
   ```
   ¡Perfecto! Te he vinculado con [Dr./Dra. Nombre Apellido].

   Ahora, si detecto patrones que necesiten atención, podré
   sugerirte contactarlo directamente. ¿Te parece bien?
   ```

4. **Si el código NO existe:**
   ```
   Hmm, no encuentro ese código.

   Verifica que esté bien escrito o pídele a tu psicólogo
   que te lo confirme.

   ¿Quieres intentar de nuevo o prefieres agregarlo más adelante?

   Opciones:
   1️⃣ Intentar otro código
   2️⃣ Agregarlo más adelante
   3️⃣ Mi psicólogo no tiene código (ingresar datos manualmente)
   ```

---

### Caso B: Usuario tiene psicólogo NO registrado 📝

**Usuario responde:**
```
"Sí, voy con la Dra. López pero no me dio ningún código"
```

o

```
"3" (selecciona: Mi psicólogo no tiene código)
```

**Sistema pregunta (sub-paso):**

**Pregunta 1: Nombre**
```
Entendido. Si quieres, puedo guardar su información para
que puedas contactarla en caso de necesitarlo.

¿Cuál es su nombre completo?
```

**Usuario:**
```
"Dra. Ana López"
```

**Pregunta 2: Contacto**
```
¿Y tienes su número de teléfono o email?
```

**Usuario:**
```
"+54 911 9876-5432"
```

**Sistema guarda:**
```typescript
await prisma.user.update({
  where: { id: user.id },
  data: {
    hasPsychologist: true,
    psychologistName: 'Dra. Ana López',
    psychologistContact: '+5491198765432',
    // NO se vincula con Psychologist (permanece null)
    // role sigue siendo INDIVIDUAL (no es B2B2C)
  }
})
```

**Bot responde:**
```
Perfecto, guardé los datos de tu psicóloga.

Si en algún momento necesitas contactarla, puedo recordarte
su número. ¿Te parece bien?
```

---

### Caso C: No tiene psicólogo ❌

**Usuario responde:**
```
"No, no voy a terapia"
```

**Sistema guarda:**
```typescript
await prisma.user.update({
  where: { id: user.id },
  data: {
    hasPsychologist: false,
  }
})
```

**Bot responde:**
```
Entendido, María. Si en algún momento necesitas apoyo profesional,
puedo sugerirte recursos. ¿Te parece bien?
```

---

## 🗄️ Cambios en la Base de Datos

### Psychologist Model (Actualizar)

```prisma
model Psychologist {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  licenseNumber String?   @unique

  // === CÓDIGO ÚNICO ===
  code          String    @unique  // Ej: "sersentiryconectar", "mindfulconnect"

  isActive      Boolean   @default(true)

  // Relación con pacientes
  patients      User[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([email])
  @@index([licenseNumber])
  @@index([code])  // ← NUEVO: Para búsquedas rápidas
}
```

### User Model (Actualizar)

```prisma
model User {
  id              String           @id @default(cuid())
  phoneNumber     String           @unique
  name            String?
  role            UserRole         @default(INDIVIDUAL)

  // === INFORMACIÓN PERSONAL ===
  hasPsychologist         Boolean  @default(false)

  // Si psicólogo NO está registrado en Continuum:
  psychologistName        String?  // "Dra. Ana López"
  psychologistContact     String?  // "+54 911 xxxx-xxxx"

  // === RELACIONES ===
  // Si psicólogo SÍ está registrado:
  psychologistId  String?
  psychologist    Psychologist?    @relation(fields: [psychologistId], references: [id], onDelete: SetNull)

  // ...resto de campos
}
```

**Regla importante:**
- Si `psychologistId` tiene valor → Psicólogo registrado (B2B2C) → `role = PATIENT`
- Si `psychologistName` tiene valor → Psicólogo externo → `role = INDIVIDUAL`
- No pueden estar ambos llenos al mismo tiempo

---

## 💻 Implementación Técnica

### 1. Extracción del Código

```typescript
// src/services/onboarding/psychologist-code-extractor.service.ts

export class PsychologistCodeExtractorService {
  /**
   * Extrae un código de psicólogo del mensaje del usuario
   * Puede ser con o sin prompt de Gemini
   */
  extractCode(message: string): string | null {
    const lowerMessage = message.toLowerCase().trim()

    // Patrón 1: "código: XXXXX" o "codigo XXXXX"
    const pattern1 = /c[oó]digo:?\s*([a-z0-9_-]+)/i
    const match1 = lowerMessage.match(pattern1)
    if (match1) return match1[1]

    // Patrón 2: Palabra única sin espacios (probablemente el código)
    // Ej: "sersentiryconectar"
    if (/^[a-z0-9_-]+$/.test(lowerMessage) && lowerMessage.length >= 5) {
      return lowerMessage
    }

    // Patrón 3: Con Gemini (más robusto)
    // "Sí, me dio este código sersentiryconectar"
    // Gemini puede extraer: "sersentiryconectar"

    return null
  }

  /**
   * Valida que el código tenga formato correcto
   */
  isValidCodeFormat(code: string): boolean {
    // Solo letras minúsculas, números, guiones y guiones bajos
    // Longitud: 5-30 caracteres
    return /^[a-z0-9_-]{5,30}$/.test(code)
  }
}
```

### 2. Caso de Uso: Vincular con Psicólogo

```typescript
// src/use-cases/onboarding/link-with-psychologist.use-case.ts

export type LinkWithPsychologistInput = {
  userId: string
  code: string
}

export type LinkWithPsychologistOutput = {
  success: boolean
  psychologist?: {
    id: string
    name: string
    email: string
  }
  error?: string
}

export class LinkWithPsychologistUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly psychologistRepository: IPsychologistRepository
  ) {}

  async execute(
    input: LinkWithPsychologistInput
  ): Promise<LinkWithPsychologistOutput> {
    // 1. Validar formato del código
    if (!this.isValidCodeFormat(input.code)) {
      return {
        success: false,
        error: 'El código tiene un formato inválido',
      }
    }

    // 2. Buscar psicólogo por código
    const psychologist = await this.psychologistRepository.findByCode(
      input.code
    )

    if (!psychologist) {
      return {
        success: false,
        error: 'Código no encontrado. Verifica que esté bien escrito.',
      }
    }

    // 3. Verificar que el psicólogo esté activo
    if (!psychologist.isActive) {
      return {
        success: false,
        error: 'Este psicólogo no está disponible actualmente.',
      }
    }

    // 4. Vincular usuario con psicólogo
    await this.userRepository.update(input.userId, {
      hasPsychologist: true,
      psychologistId: psychologist.id,
      role: 'PATIENT', // Ahora es paciente B2B2C

      // Limpiar datos de psicólogo externo si existían
      psychologistName: null,
      psychologistContact: null,
    })

    // 5. Log para auditoría
    console.log(
      `[ONBOARDING] User ${input.userId} linked with psychologist ${psychologist.id}`
    )

    return {
      success: true,
      psychologist: {
        id: psychologist.id,
        name: psychologist.name,
        email: psychologist.email,
      },
    }
  }

  private isValidCodeFormat(code: string): boolean {
    return /^[a-z0-9_-]{5,30}$/.test(code)
  }
}
```

### 3. Caso de Uso: Guardar Psicólogo Externo

```typescript
// src/use-cases/onboarding/save-external-psychologist.use-case.ts

export type SaveExternalPsychologistInput = {
  userId: string
  name: string
  contact: string // Teléfono o email
}

export class SaveExternalPsychologistUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: SaveExternalPsychologistInput): Promise<void> {
    // Validar que el nombre no esté vacío
    if (!input.name.trim()) {
      throw new Error('El nombre del psicólogo es requerido')
    }

    // Validar que el contacto no esté vacío
    if (!input.contact.trim()) {
      throw new Error('El contacto del psicólogo es requerido')
    }

    // Guardar información
    await this.userRepository.update(input.userId, {
      hasPsychologist: true,
      psychologistName: input.name.trim(),
      psychologistContact: input.contact.trim(),

      // NO vincular con Psychologist
      psychologistId: null,
      // role permanece INDIVIDUAL
    })

    console.log(
      `[ONBOARDING] User ${input.userId} saved external psychologist: ${input.name}`
    )
  }
}
```

### 4. Integración en Process Onboarding Message

```typescript
// src/use-cases/onboarding/process-onboarding-message.use-case.ts

export class ProcessOnboardingMessageUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly linkWithPsychologistUseCase: LinkWithPsychologistUseCase,
    private readonly saveExternalPsychologistUseCase: SaveExternalPsychologistUseCase,
    private readonly codeExtractor: PsychologistCodeExtractorService,
    private readonly geminiService: GeminiService
  ) {}

  async execute(input: { userId: string; message: string }) {
    const user = await this.userRepository.findById(input.userId)

    if (!user || user.onboardingDone) {
      throw new Error('User already completed onboarding')
    }

    const currentStep = user.onboardingStep || OnboardingStep.NOT_STARTED

    // ====== ESTADO: PSYCHOLOGIST ======
    if (currentStep === OnboardingStep.PSYCHOLOGIST) {
      // Intentar extraer código
      const code = this.codeExtractor.extractCode(input.message)

      if (code) {
        // Usuario proporcionó un código
        const result = await this.linkWithPsychologistUseCase.execute({
          userId: user.id,
          code,
        })

        if (result.success) {
          // Código válido - Vinculado exitosamente
          const response = `¡Perfecto! Te he vinculado con ${result.psychologist!.name}.

Ahora, si detecto patrones que necesiten atención, podré
sugerirte contactarlo directamente. ¿Te parece bien?`

          // Avanzar al siguiente paso
          await this.userRepository.update(user.id, {
            onboardingStep: OnboardingStep.EMERGENCY_CONTACT,
          })

          return { response, nextStep: OnboardingStep.EMERGENCY_CONTACT }
        } else {
          // Código inválido
          const response = `${result.error}

¿Quieres intentar de nuevo o prefieres agregarlo más adelante?

Opciones:
1️⃣ Intentar otro código
2️⃣ Agregarlo más adelante
3️⃣ Mi psicólogo no tiene código`

          return { response, nextStep: OnboardingStep.PSYCHOLOGIST }
        }
      }

      // No hay código - Detectar intención
      const intent = await this.geminiService.detectPsychologistIntent(
        input.message
      )

      if (intent === 'HAS_EXTERNAL') {
        // Tiene psicólogo pero sin código
        const response = `Entendido. Si quieres, puedo guardar su información.

¿Cuál es su nombre completo?`

        await this.userRepository.update(user.id, {
          onboardingStep: OnboardingStep.PSYCHOLOGIST_NAME,
        })

        return { response, nextStep: OnboardingStep.PSYCHOLOGIST_NAME }
      }

      if (intent === 'NO_PSYCHOLOGIST') {
        // No tiene psicólogo
        const response = `Entendido, ${user.name || ''}. Si en algún momento
necesitas apoyo profesional, puedo sugerirte recursos. ¿Te parece bien?`

        await this.userRepository.update(user.id, {
          hasPsychologist: false,
          onboardingStep: OnboardingStep.EMERGENCY_CONTACT,
        })

        return { response, nextStep: OnboardingStep.EMERGENCY_CONTACT }
      }
    }

    // ====== SUB-ESTADO: PSYCHOLOGIST_NAME ======
    if (currentStep === OnboardingStep.PSYCHOLOGIST_NAME) {
      // Guardar nombre del psicólogo externo
      const psychologistName = input.message.trim()

      await this.userRepository.update(user.id, {
        psychologistName,
        onboardingStep: OnboardingStep.PSYCHOLOGIST_CONTACT,
      })

      const response = `¿Y tienes su número de teléfono o email?`

      return { response, nextStep: OnboardingStep.PSYCHOLOGIST_CONTACT }
    }

    // ====== SUB-ESTADO: PSYCHOLOGIST_CONTACT ======
    if (currentStep === OnboardingStep.PSYCHOLOGIST_CONTACT) {
      // Guardar contacto del psicólogo externo
      await this.saveExternalPsychologistUseCase.execute({
        userId: user.id,
        name: user.psychologistName!, // Ya guardado en paso anterior
        contact: input.message.trim(),
      })

      const response = `Perfecto, guardé los datos de tu psicólogo/a.

Si en algún momento necesitas contactarlo/a, puedo recordarte
su número. ¿Te parece bien?`

      await this.userRepository.update(user.id, {
        onboardingStep: OnboardingStep.EMERGENCY_CONTACT,
      })

      return { response, nextStep: OnboardingStep.EMERGENCY_CONTACT }
    }

    // ... otros estados (NAME, EXPECTATIONS, etc.)
  }
}
```

---

## 📊 Estados Adicionales

Agregar nuevos estados para manejar psicólogo externo:

```typescript
export enum OnboardingStep {
  NOT_STARTED = 'NOT_STARTED',
  NAME = 'NAME',
  EXPECTATIONS = 'EXPECTATIONS',
  PSYCHOLOGIST = 'PSYCHOLOGIST',

  // Nuevos sub-estados para psicólogo externo
  PSYCHOLOGIST_NAME = 'PSYCHOLOGIST_NAME',      // Preguntando nombre
  PSYCHOLOGIST_CONTACT = 'PSYCHOLOGIST_CONTACT', // Preguntando contacto

  EMERGENCY_CONTACT = 'EMERGENCY_CONTACT',
  COMPLETED = 'COMPLETED',
}
```

---

## 🔐 Generación de Códigos para Psicólogos

### Opción 1: Manual (Admin asigna)

Cuando se registra un psicólogo, el admin crea un código único:

```typescript
// src/use-cases/admin/create-psychologist.use-case.ts

export class CreatePsychologistUseCase {
  async execute(input: {
    name: string
    email: string
    licenseNumber?: string
  }) {
    // Generar código basado en el nombre
    const code = this.generateCode(input.name)

    // Verificar que sea único
    const exists = await this.psychologistRepository.findByCode(code)
    if (exists) {
      throw new Error('El código ya existe, intenta con otro nombre')
    }

    const psychologist = await this.psychologistRepository.create({
      ...input,
      code,
      isActive: true,
    })

    return psychologist
  }

  private generateCode(name: string): string {
    // "Dr. Carlos Sánchez" → "carlossanchez"
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9]/g, '') // Solo letras y números
      .slice(0, 20)
  }
}
```

### Opción 2: Auto-generado (Slug único)

```typescript
import { nanoid } from 'nanoid'

private generateCode(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 15)

  const randomSuffix = nanoid(5) // 5 caracteres aleatorios

  return `${slug}${randomSuffix}` // Ej: "carlossanchez3k9j2"
}
```

### Opción 3: Personalizado (Psicólogo elige)

Permitir que el psicólogo elija su propio código al registrarse, con validación de disponibilidad.

---

## 🎨 UX: Mensajes del Bot

### Éxito al vincular:
```
¡Perfecto! Te he vinculado con Dr./Dra. [Nombre].

Ahora, si detecto patrones que necesiten atención, podré
sugerirte contactarlo directamente. ¿Te parece bien?
```

### Código inválido:
```
Hmm, no encuentro ese código.

Verifica que esté bien escrito o pídele a tu psicólogo
que te lo confirme.

¿Quieres intentar de nuevo?
```

### Psicólogo externo guardado:
```
Perfecto, guardé los datos de tu psicólogo/a.

Si en algún momento necesitas contactarlo/a, puedo recordarte
su número.
```

---

## 🧪 Testing

### Casos de prueba:

1. **Código válido existente:**
   - Input: `"sersentiryconectar"`
   - Expected: Vinculación exitosa, role = PATIENT

2. **Código inválido:**
   - Input: `"codigofalso123"`
   - Expected: Error "Código no encontrado"

3. **Código con formato incorrecto:**
   - Input: `"ABC-123!@#"`
   - Expected: Error "Formato inválido"

4. **Psicólogo externo completo:**
   - Input 1: `"Dra. Ana López"`
   - Input 2: `"+54 911 1234-5678"`
   - Expected: Datos guardados, role = INDIVIDUAL

5. **Sin psicólogo:**
   - Input: `"No, no voy a terapia"`
   - Expected: hasPsychologist = false

---

## 📝 Migración de BD

```prisma
-- Agregar campo code a Psychologist
ALTER TABLE "Psychologist" ADD COLUMN "code" TEXT;

-- Crear índice único
CREATE UNIQUE INDEX "Psychologist_code_key" ON "Psychologist"("code");
CREATE INDEX "Psychologist_code_idx" ON "Psychologist"("code");

-- Agregar campo psychologistContact a User
ALTER TABLE "User" ADD COLUMN "psychologistContact" TEXT;

-- Renombrar campo si es necesario
-- ALTER TABLE "User" RENAME COLUMN "psychologistInfo" TO "psychologistName";
```

---

## 🚀 Próximos Pasos

1. Actualizar `prisma/schema.prisma` con nuevo campo `code`
2. Ejecutar migración
3. Implementar `PsychologistCodeExtractorService`
4. Implementar `LinkWithPsychologistUseCase`
5. Implementar `SaveExternalPsychologistUseCase`
6. Actualizar `ProcessOnboardingMessageUseCase`
7. Crear endpoint de admin para generar códigos
8. Testing end-to-end con UI de chat

---

**Documento vivo** - Última actualización: 2024-12-30
