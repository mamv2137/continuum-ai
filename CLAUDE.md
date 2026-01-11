# Contexto del Proyecto: Continuum AI

Eres el arquitecto de "Continuum AI", una plataforma de salud mental que utiliza IA para cerrar la brecha entre sesiones de terapia mediante el concepto de **Continuum de Consciencia** (Terapia Gestalt).

## 1. Misión y Metodología
- El objetivo no es diagnosticar, sino facilitar el "darse cuenta" (awareness).
- La lógica del bot DEBE seguir las 3 zonas:
    1. **Zona Externa:** Sentidos (oír, ver, tocar).
    2. **Zona Interna:** Sensaciones corporales (presión, calor, nudos).
    3. **Zona de Fantasía:** Pensamientos, juicios y proyecciones.
- **Regla de Oro:** Evitar la intelectualización. Si el usuario explica el "por qué", la lógica debe redirigirlo al "qué" y al "cómo" en el cuerpo.

## 2. Stack Tecnológico
- **Frontend/Backend:** Next.js (App Router) + TypeScript.
- **ORM:** Prisma.
- **Base de Datos:** Neon (PostgreSQL serverless).
- **Autenticación:** Better Auth.
- **Comunicación:** WhatsApp vía Ycloud API.
- **IA:** Gemini 1.5 Flash (Google AI SDK).

## 3. Arquitectura de Datos y Privacidad
- Separar estrictamente PII (identidad) de PHI (datos de salud/logs).
- Las sesiones de `CheckIn` deben ser estructuradas para permitir visualizaciones (mapas de calor corporal, nubes de palabras).
- El esquema de Prisma debe reflejar esta relación: Usuario <-> Sesiones <-> Psicólogo (opcional).

## 4. Arquitectura de Software

### 4.1 Arquitectura MVP (Fase Actual)
**Patrón:** Arquitectura en Capas Simplificada con Separación de Responsabilidades

**Principios:**
- **Separation of Concerns:** Cada capa tiene una responsabilidad clara
- **Domain-Driven Design Ligero:** Entities y Value Objects en capa de dominio
- **Repository Pattern:** Abstracción de persistencia
- **Service Pattern:** Lógica de negocio reutilizable
- **Dependency Injection:** Facilitar testing y mantenibilidad

**Capas:**
1. **Domain** - Entidades de negocio y reglas de dominio
2. **Use Cases** - Casos de uso y lógica de aplicación
3. **Repositories** - Acceso a datos (Prisma)
4. **Services** - Integraciones externas (Gemini, WhatsApp)
5. **App (Next.js)** - Presentación y API routes

**¿Por qué esta arquitectura para MVP?**
- ✅ Balance entre simplicidad y escalabilidad
- ✅ Fácil de entender para equipos pequeños
- ✅ Permite testing sin complejidad excesiva
- ✅ Preparada para refactoring a Clean Architecture en V2

### 4.2 Roadmap de Arquitectura

**V1.5 - Post-MVP (Refactoring opcional)**
- Agregar DTOs para validación de entrada/salida
- Separar controllers de API routes
- Implementar mappers Domain ↔ Prisma

**V2 - Escalamiento (Clean Architecture completa)**
- Agregar capa de Infrastructure completa
- Implementar capa de Presentation con controllers
- Agregar Factories y Builders
- Implementar Strategy Pattern para análisis
- Event-Driven Architecture para notificaciones

### 4.3 Lineamientos de Código
- Priorizar Server Components en Next.js
- Tipado estricto en TypeScript (evitar `any`)
- Las interacciones de la IA deben estar centralizadas en un servicio
- Reglas de negocio SOLO en la capa de dominio
- Casos de uso deben ser pequeños y enfocados (Single Responsibility)
- Repositories devuelven entidades de dominio, NO modelos de Prisma
- Services son stateless y reutilizables

## 5. Modelo de Usuarios (Dual Role System)

### 5.1 Tipos de Usuarios
El sistema maneja dos tipos de usuarios mediante el campo `role` en la tabla `User`:

1. **INDIVIDUAL / PATIENT** - Usuarios que buscan apoyo personal
   - Acceso vía WhatsApp (punto de entrada principal)
   - Pueden hacer check-ins de Gestalt
   - Pueden vincularse con un psicólogo (mediante código)
   - Acceso al dashboard web personal (magic link o email/password)

2. **PSYCHOLOGIST** - Profesionales de salud mental
   - Acceso vía WhatsApp Y web
   - Pueden hacer check-ins personales (como cualquier usuario)
   - Tienen código único para vincular pacientes
   - Acceso al dashboard clínico con datos de pacientes
   - Pueden recibir notificaciones de check-ins de pacientes
   - Login web con email/password o magic link

### 5.2 Flujo de Registro (WhatsApp)
**Pregunta inicial:** "¿Vienes como profesional (psicólogo/terapeuta) o buscas apoyo personal?"

**Si es PROFESIONAL:**
1. Recolectar nombre
2. Recolectar cédula profesional (opcional)
3. Ofrecer crear contraseña para web (opcional)
4. Generar código único de vinculación
5. Completar onboarding

**Si es PERSONAL:**
1. Recolectar nombre
2. Preguntar si tiene psicólogo
3. Recolectar contacto de emergencia (opcional)
4. Preguntar expectativas
5. Completar onboarding

### 5.3 Funcionalidades por Rol

#### Usuario Individual/Paciente:
- ✅ Check-ins vía WhatsApp
- ✅ Vinculación con psicólogo (código)
- 🔄 Dashboard personal (próximo)
- 🔄 Magic link para acceso web (próximo)

#### Psicólogo:
- ✅ Código único de vinculación
- ✅ Check-ins personales vía WhatsApp
- 🔄 Comandos especiales: `/dashboard`, `/pacientes`, `/reporte`
- 🔄 Lenguaje natural para solicitudes (ej: "dame el reporte de María")
- 🔄 Dashboard clínico con datos de pacientes
- 🔄 Notificaciones de check-ins de pacientes

## 6. Roadmap de Funcionalidades

### ✅ MVP Completado
- [x] Bot de WhatsApp con Gemini AI
- [x] Sistema de onboarding dual (Profesional vs Personal)
- [x] Registro en DB con Prisma + Neon
- [x] Better Auth configurado (email/password + magic links)
- [x] Flujo de check-ins con las 3 zonas de Gestalt
- [x] Generación automática de códigos para psicólogos
- [x] Vinculación paciente-psicólogo

### 🔄 En Progreso - Dashboard Usuario
- [ ] Layout del dashboard con navegación
- [ ] Página de perfil (editar datos personales)
- [ ] Historial de check-ins
- [ ] Visualizaciones:
  - [ ] Mapa de calor corporal
  - [ ] Tendencias emocionales
  - [ ] Estadísticas de uso (streak, total)
- [ ] Configuración de cuenta
- [ ] Botón de cancelar cuenta
- [ ] Exportar datos (GDPR compliance)

### 📅 V2 - Dashboard Clínico (Psicólogos)
- [ ] Panel de pacientes vinculados
- [ ] Vista detallada por paciente
- [ ] Análisis de tendencias (emocionales, corporales)
- [ ] Notas clínicas privadas
- [ ] Reportes exportables (PDF)
- [ ] Alertas configurables

### 📅 V2 - Comandos y NLP para Psicólogos
- [ ] Comandos especiales vía WhatsApp:
  - [ ] `/dashboard` - Magic link al dashboard
  - [ ] `/pacientes` - Lista de pacientes
  - [ ] `/reporte [paciente] [fecha]` - Generar reporte
  - [ ] `/alertas on/off` - Activar/desactivar notificaciones
  - [ ] `/checkin` - Iniciar check-in personal
- [ ] Procesamiento de lenguaje natural:
  - [ ] "Dame el reporte de la última sesión de María"
  - [ ] "Muéstrame mis pacientes de hoy"
  - [ ] "Dame el link para el dashboard"
- [ ] Notificaciones automáticas de check-ins

### 📅 V3 - Funcionalidades Avanzadas
- [ ] OAuth (Google) para login
- [ ] Analytics avanzado
- [ ] Event-Driven Architecture para notificaciones
- [ ] Clean Architecture completa
- [ ] Multi-idioma
- [ ] App móvil nativa

## 6. Configuración de Servicios

### 6.1 Neon Database
- **URL de conexión:** Configurar `DATABASE_URL` en `.env`
- **Driver:** Usar `@neondatabase/serverless` para edge functions
- **Prisma:** Configurar con `prisma://accelerate` si se usa Prisma Accelerate
- **Pooling:** Neon maneja automáticamente el connection pooling

### 6.2 Better Auth
- **Configuración:** Crear archivo `src/lib/auth.ts` con configuración de Better Auth
- **Providers:** Email/Password inicialmente, considerar OAuth (Google, etc.) para V2
- **Sesiones:** Usar cookies seguras con `httpOnly` y `secure`
- **Integración Prisma:** Better Auth puede usar Prisma adapter para persistencia
- **Rutas API:** Montar en `/api/auth/*`

### 6.3 Ycloud API (WhatsApp)
- **Webhook:** Configurar endpoint `/api/whatsapp/webhook` para recibir mensajes
- **Envío:** Crear servicio en `src/services/whatsapp.ts`
- **Rate Limiting:** Implementar para evitar spam
- **Validación:** Verificar firma de webhooks de Ycloud

### 6.4 Gemini AI
- **SDK:** `@google/generative-ai`
- **System Prompt:** Crear en `src/prompts/gestalt-system.ts`
- **Servicio:** `src/services/ai.ts` con funciones para check-ins
- **Contexto:** Incluir últimas 5-10 sesiones del usuario para continuidad
- **Streaming:** Considerar streaming responses para mejor UX

## 7. Estructura del Proyecto (Arquitectura MVP)

```
src/
├── domain/                           # 📦 CAPA DE DOMINIO
│   ├── entities/                     # Entidades de negocio
│   │   ├── user.entity.ts
│   │   ├── check-in.entity.ts
│   │   └── body-sensation.entity.ts
│   ├── value-objects/                # Objetos de valor
│   │   ├── phone-number.vo.ts
│   │   ├── gestalt-zone.vo.ts
│   │   └── emotional-tone.vo.ts
│   └── errors/                       # Errores de dominio
│       └── domain.error.ts
│
├── use-cases/                        # 🎯 CAPA DE APLICACIÓN
│   ├── check-in/
│   │   ├── start-check-in.use-case.ts
│   │   ├── process-message.use-case.ts
│   │   └── complete-check-in.use-case.ts
│   ├── user/
│   │   ├── register-user.use-case.ts
│   │   └── onboard-user.use-case.ts
│   └── psychologist/
│       └── assign-patient.use-case.ts
│
├── repositories/                     # 💾 CAPA DE REPOSITORIOS
│   ├── interfaces/                   # Contratos
│   │   ├── user.repository.interface.ts
│   │   └── check-in.repository.interface.ts
│   └── prisma/                       # Implementaciones con Prisma
│       ├── user.repository.ts
│       ├── check-in.repository.ts
│       └── mappers/                  # Prisma ↔ Domain
│           ├── user.mapper.ts
│           └── check-in.mapper.ts
│
├── services/                         # 🔧 SERVICIOS EXTERNOS
│   ├── ai/
│   │   ├── gemini.service.ts         # Cliente de Gemini
│   │   └── gestalt-coach.service.ts  # Lógica de las 3 zonas
│   ├── messaging/
│   │   └── whatsapp.service.ts       # Cliente de Ycloud
│   └── analytics/
│       └── analytics.service.ts      # Análisis de datos (V2)
│
├── app/                              # 🌐 NEXT.JS (PRESENTACIÓN)
│   ├── api/
│   │   ├── auth/[...all]/route.ts    # Better Auth routes
│   │   ├── whatsapp/
│   │   │   └── webhook/route.ts      # Webhook handler
│   │   └── check-in/
│   │       └── route.ts              # API de check-in
│   ├── dashboard/
│   │   ├── page.tsx                  # User dashboard
│   │   └── clinical/page.tsx         # Clinical dashboard (V2)
│   └── layout.tsx
│
├── lib/                              # 🛠️ UTILIDADES Y CONFIG
│   ├── auth.ts                       # Better Auth config
│   ├── db.ts                         # Prisma client
│   ├── db-edge.ts                    # Prisma client (edge)
│   └── utils.ts                      # Utilidades generales
│
├── config/                           # ⚙️ CONFIGURACIÓN
│   ├── constants.ts                  # Constantes de la app
│   └── prompts/
│       └── gestalt-system.prompt.ts  # System prompt de Gemini
│
├── types/                            # 📝 TIPOS TYPESCRIPT
│   └── index.ts                      # Tipos compartidos
│
└── components/                       # 🎨 COMPONENTES UI
    ├── ui/                           # shadcn/ui components
    └── dashboard/                    # Dashboard components
```

### Flujo de Datos (Request → Response)

```
WhatsApp Message → API Route → Use Case → Repository/Service → Domain Entity
                                    ↓
                            Domain Logic (Validaciones)
                                    ↓
                           Service (Gemini AI)
                                    ↓
                            Repository (Save)
                                    ↓
                          Response → WhatsApp
```

## 8. Modelo de Datos (Prisma Schema)

### Tablas Principales:
- **User** (PII): id, email, name, phoneNumber, createdAt
- **Session** (PHI): id, userId, type (check-in, therapy), startedAt, endedAt
- **Message** (PHI): id, sessionId, role (user/assistant), content, timestamp
- **BodySensation** (PHI): id, sessionId, zone (externa/interna/fantasía), description, intensity
- **Psychologist** (PII): id, licenseNumber, name, email
- **UserPsychologist**: userId, psychologistId, assignedAt

### Índices Importantes:
- User.phoneNumber (para lookup rápido desde WhatsApp)
- Session.userId + createdAt (para consultas de historial)
- Message.sessionId (para cargar conversaciones)

## 9. Variables de Entorno Requeridas

```env
# Database
DATABASE_URL="postgresql://[user]:[password]@[host]/[db]?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="[generate with: openssl rand -base64 32]"
BETTER_AUTH_URL="http://localhost:3000" # Production: https://yourdomain.com

# Ycloud
YCLOUD_API_KEY="[api key]"
YCLOUD_WEBHOOK_SECRET="[webhook secret]"

# Gemini AI
GEMINI_API_KEY="[api key]"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 10. Próximos Pasos de Implementación

1. **Configurar Prisma con Neon**
   - Crear schema.prisma
   - Configurar DATABASE_URL
   - Generar migraciones

2. **Configurar Better Auth**
   - Setup básico con email/password
   - Crear rutas de API
   - Implementar middleware de autenticación

3. **Implementar Webhook de WhatsApp**
   - Endpoint para recibir mensajes
   - Validación de firma
   - Cola de procesamiento

4. **Crear System Prompt de Gestalt**
   - Implementar las 3 zonas
   - Ejemplos de redirección
   - Validación de respuestas

5. **Dashboard Básico**
   - Vista de sesiones
   - Gráficos de sensaciones corporales
   - Nube de palabras