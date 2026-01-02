# Arquitectura de Software - Continuum AI

## 📐 Visión General

Continuum AI utiliza una **Arquitectura en Capas Simplificada** con principios de **Domain-Driven Design (DDD) Ligero**. Esta arquitectura balancea simplicidad para el MVP con preparación para escalamiento futuro.

## 🎯 Principios Fundamentales

### 1. Separation of Concerns
Cada capa tiene una responsabilidad única y bien definida.

### 2. Dependency Inversion
Las capas de alto nivel (domain, use-cases) NO dependen de las de bajo nivel (repositories, services). Las dependencias fluyen hacia adentro, hacia el dominio.

### 3. Domain-Driven Design Ligero
- **Entities**: Objetos con identidad única que contienen lógica de negocio
- **Value Objects**: Objetos inmutables sin identidad (ej: PhoneNumber)
- **Repositories**: Abstracciones para persistencia de aggregates

### 4. Testability First
Cada capa puede testearse independientemente mediante dependency injection.

---

## 🏗️ Capas de la Arquitectura

```
┌─────────────────────────────────────────────────┐
│          PRESENTATION (Next.js App)             │
│  ┌──────────────────────────────────────────┐   │
│  │  API Routes (WhatsApp, Auth, CheckIn)   │   │
│  │  Pages (Dashboard)                       │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                      ↓ ↑
┌─────────────────────────────────────────────────┐
│         APPLICATION (Use Cases)                 │
│  ┌──────────────────────────────────────────┐   │
│  │  StartCheckInUseCase                     │   │
│  │  ProcessMessageUseCase                   │   │
│  │  RegisterUserUseCase                     │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                      ↓ ↑
┌─────────────────────────────────────────────────┐
│              DOMAIN (Entities)                  │
│  ┌──────────────────────────────────────────┐   │
│  │  CheckInEntity (reglas de negocio)       │   │
│  │  PhoneNumber (value object)              │   │
│  │  GestaltZone (value object)              │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
           ↓ ↑                        ↓ ↑
┌──────────────────────┐    ┌──────────────────────┐
│   REPOSITORIES       │    │     SERVICES         │
│  ┌────────────────┐  │    │  ┌────────────────┐  │
│  │ Prisma Repos   │  │    │  │ Gemini AI      │  │
│  │ (Persistence)  │  │    │  │ Gestalt Coach  │  │
│  └────────────────┘  │    │  │ WhatsApp       │  │
└──────────────────────┘    │  └────────────────┘  │
                            └──────────────────────┘
```

---

## 📦 Descripción de Capas

### 1. Domain Layer (Dominio)

**Ubicación:** `src/domain/`

**Responsabilidad:** Contiene las reglas de negocio puras de Continuum AI.

**Componentes:**
- **Entities** (`entities/`): Objetos con identidad que contienen lógica de negocio
  - `CheckInEntity`: Sesiones de check-in con reglas de las 3 zonas
  - `UserEntity`: Usuarios con validaciones de onboarding

- **Value Objects** (`value-objects/`): Objetos inmutables sin identidad
  - `PhoneNumber`: Validación y normalización de teléfonos
  - `GestaltZone`: Representación de las 3 zonas de Gestalt
  - `EmotionalTone`: Tono emocional con niveles de confianza

- **Errors** (`errors/`): Errores de dominio
  - `DomainError`: Base para errores de reglas de negocio
  - `CheckInAlreadyCompletedError`: Violación de reglas de sesión

**Reglas importantes:**
- ✅ NO tiene dependencias de otras capas
- ✅ NO conoce Prisma, Next.js, o servicios externos
- ✅ Contiene SOLO lógica de negocio pura
- ✅ Completamente testeable sin mocks

**Ejemplo:**
```typescript
// ✅ BIEN: Lógica de negocio en el dominio
class CheckInEntity {
  complete(): void {
    if (!this.hasAtLeastOneZoneCompleted()) {
      throw new InsufficientCheckInDataError()
    }
    this.status = SessionStatus.COMPLETED
  }
}

// ❌ MAL: Lógica de persistencia en el dominio
class CheckInEntity {
  async save(): Promise<void> {
    await prisma.checkIn.update(...) // ❌ NO!
  }
}
```

---

### 2. Application Layer (Casos de Uso)

**Ubicación:** `src/use-cases/`

**Responsabilidad:** Orquesta el flujo de la aplicación. Coordina entities, repositories y services.

**Componentes:**
- `check-in/start-check-in.use-case.ts`: Iniciar sesión de check-in
- `check-in/process-message.use-case.ts`: Procesar mensaje del usuario con IA
- `user/register-user.use-case.ts`: Registrar nuevo usuario

**Reglas importantes:**
- ✅ Depende de interfaces, NO de implementaciones concretas
- ✅ Coordina pero NO contiene lógica de negocio
- ✅ Un caso de uso = Una tarea específica
- ✅ Retorna DTOs, NO entities directamente (en V2)

**Ejemplo:**
```typescript
export class StartCheckInUseCase {
  constructor(
    private readonly userRepo: IUserRepository,     // ✅ Interface
    private readonly checkInRepo: ICheckInRepository // ✅ Interface
  ) {}

  async execute(input: StartCheckInInput): Promise<StartCheckInOutput> {
    // 1. Validar entrada
    const phoneNumber = new PhoneNumber(input.phoneNumber)

    // 2. Buscar usuario
    const user = await this.userRepo.findByPhoneNumber(phoneNumber)

    // 3. Lógica de negocio (delegada a entity)
    const checkIn = new CheckInEntity(...)
    checkIn.addMessage('model', welcomeMsg)

    // 4. Persistir
    return await this.checkInRepo.create(checkIn)
  }
}
```

---

### 3. Repository Layer (Repositorios)

**Ubicación:** `src/repositories/`

**Responsabilidad:** Abstrae la persistencia de datos. Convierte entre Domain Entities y modelos de BD.

**Componentes:**
- **Interfaces** (`interfaces/`): Contratos de repositorios
  - `IUserRepository`
  - `ICheckInRepository`

- **Implementaciones** (`prisma/`): Implementaciones con Prisma
  - `UserRepository`
  - `CheckInRepository`

- **Mappers** (`prisma/mappers/`): Transforman Prisma ↔ Domain
  - `UserMapper.toDomain(prismaUser)`
  - `CheckInMapper.toPrisma(checkInEntity)`

**Reglas importantes:**
- ✅ Retorna Domain Entities, NO modelos de Prisma
- ✅ Implementa interfaces del dominio
- ✅ Aísla detalles de implementación de BD

**Ejemplo:**
```typescript
export class PrismaCheckInRepository implements ICheckInRepository {
  async findById(id: string): Promise<CheckInEntity | null> {
    const prismaCheckIn = await prisma.checkIn.findUnique({
      where: { id },
      include: { bodySensations: true }
    })

    if (!prismaCheckIn) return null

    // Mapper: Prisma → Domain
    return CheckInMapper.toDomain(prismaCheckIn)
  }

  async update(checkIn: CheckInEntity): Promise<CheckInEntity> {
    // Mapper: Domain → Prisma
    const prismaData = CheckInMapper.toPrisma(checkIn)

    const updated = await prisma.checkIn.update({
      where: { id: checkIn.getId() },
      data: prismaData
    })

    return CheckInMapper.toDomain(updated)
  }
}
```

---

### 4. Services Layer (Servicios)

**Ubicación:** `src/services/`

**Responsabilidad:** Integraciones con servicios externos y lógica de aplicación reutilizable.

**Componentes:**
- **AI Services** (`ai/`):
  - `GeminiService`: Cliente de Gemini AI
  - `GestaltCoachService`: Lógica de las 3 zonas de Gestalt

- **Messaging Services** (`messaging/`):
  - `WhatsAppService`: Cliente de Ycloud

- **Analytics Services** (`analytics/`):
  - `AnalyticsService`: Análisis de tendencias (V2)

**Reglas importantes:**
- ✅ Stateless (sin estado interno)
- ✅ Reutilizables entre casos de uso
- ✅ Pueden depender de Value Objects del dominio
- ❌ NO deben contener reglas de negocio core

**Ejemplo:**
```typescript
export class GestaltCoachService {
  analyzeMessage(message: string): GestaltAnalysis {
    const isIntellectualizing = this.detectIntellectualization(message)

    if (isIntellectualizing) {
      return {
        suggestedRedirect: 'body',
        nextQuestion: this.getBodyRedirectQuestion()
      }
    }

    // ... más lógica de análisis
  }
}
```

---

### 5. Presentation Layer (Next.js App)

**Ubicación:** `src/app/`

**Responsabilidad:** Maneja HTTP requests/responses. Valida entrada y formatea salida.

**Componentes:**
- **API Routes** (`api/`):
  - `whatsapp/webhook/route.ts`: Webhook de WhatsApp
  - `check-in/route.ts`: API de check-ins

- **Pages** (`dashboard/`):
  - `page.tsx`: Dashboard de usuario
  - `clinical/page.tsx`: Dashboard clínico

**Reglas importantes:**
- ✅ Delgada: solo validación y orquestación
- ✅ Llama a casos de uso, NO a repositories directamente
- ✅ Maneja errores y los convierte a HTTP responses

**Ejemplo:**
```typescript
// src/app/api/whatsapp/webhook/route.ts
export async function POST(request: Request) {
  try {
    // 1. Parsear y validar
    const body = await request.json()

    // 2. Llamar caso de uso
    const useCase = new ProcessMessageUseCase(
      userRepo,
      checkInRepo,
      gestaltCoach,
      geminiService
    )

    const result = await useCase.execute({
      phoneNumber: body.from,
      message: body.text
    })

    // 3. Formatear respuesta
    return Response.json({ success: true, data: result })

  } catch (error) {
    // 4. Manejo de errores
    if (error instanceof DomainError) {
      return Response.json({ error: error.message }, { status: 400 })
    }
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

---

## 🔄 Flujo de Datos Completo

### Ejemplo: Usuario envía mensaje por WhatsApp

```
1. WhatsApp → Ycloud → /api/whatsapp/webhook
                              ↓
2. Webhook valida y extrae datos
                              ↓
3. Crea ProcessMessageUseCase con dependencias inyectadas
                              ↓
4. UseCase:
   - Busca user en UserRepository
   - Busca checkIn activo en CheckInRepository
   - Analiza mensaje con GestaltCoachService
   - Genera respuesta con GeminiService
   - Actualiza CheckInEntity (lógica de dominio)
   - Persiste con CheckInRepository
                              ↓
5. Retorna respuesta al webhook
                              ↓
6. Webhook envía respuesta via WhatsAppService
                              ↓
7. Usuario recibe mensaje en WhatsApp
```

---

## 🧪 Testing Strategy

### Unit Tests (Capa de Dominio)
```typescript
describe('CheckInEntity', () => {
  it('should throw error when completing without zones', () => {
    const checkIn = new CheckInEntity(...)

    expect(() => checkIn.complete()).toThrow(InsufficientCheckInDataError)
  })
})
```

### Integration Tests (Casos de Uso)
```typescript
describe('StartCheckInUseCase', () => {
  it('should create new check-in for new user', async () => {
    const mockUserRepo = createMock<IUserRepository>()
    const mockCheckInRepo = createMock<ICheckInRepository>()

    const useCase = new StartCheckInUseCase(mockUserRepo, mockCheckInRepo)

    const result = await useCase.execute({ phoneNumber: '+5215512345678' })

    expect(result.isNewSession).toBe(true)
  })
})
```

### E2E Tests (API Routes)
```typescript
describe('POST /api/whatsapp/webhook', () => {
  it('should process message and return response', async () => {
    const response = await fetch('/api/whatsapp/webhook', {
      method: 'POST',
      body: JSON.stringify({
        from: '+5215512345678',
        text: 'Me siento ansioso'
      })
    })

    expect(response.status).toBe(200)
  })
})
```

---

## 📈 Roadmap de Evolución

### V1.5 - Post-MVP
- [ ] Agregar DTOs para validación de input/output
- [ ] Separar controllers de API routes
- [ ] Implementar mappers completos Domain ↔ Prisma
- [ ] Agregar capa de validación con Zod

### V2 - Clean Architecture Completa
- [ ] Capa de Infrastructure completa
- [ ] Capa de Presentation con controllers
- [ ] Factories y Builders
- [ ] Strategy Pattern para diferentes análisis
- [ ] Event-Driven Architecture para notificaciones
- [ ] CQRS para separar lecturas y escrituras

---

## 📚 Recursos y Referencias

- [Clean Architecture (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design Distilled](https://www.amazon.com/Domain-Driven-Design-Distilled-Vaughn-Vernon/dp/0134434420)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Next.js Best Practices](https://nextjs.org/docs/app/building-your-application)

---

**¿Preguntas?** Revisa los ejemplos en cada carpeta de `src/` o consulta el [CLAUDE.md](../CLAUDE.md) principal.
