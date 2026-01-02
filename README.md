# Continuum AI 🌱

> Plataforma de salud mental basada en Terapia Gestalt que utiliza IA para facilitar el "darse cuenta" (awareness) entre sesiones terapéuticas.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black.svg)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748.svg)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 📖 Descripción

Continuum AI es un asistente de check-in basado en las **3 zonas de la Terapia Gestalt**, accesible vía WhatsApp. No diagnostica, sino que facilita la autoexploración mediante:

1. **Zona Externa**: Conectar con los sentidos (ver, oír, tocar)
2. **Zona Interna**: Explorar sensaciones corporales (presión, calor, nudos)
3. **Zona de Fantasía**: Observar pensamientos y juicios

**Regla de Oro**: Evitar la intelectualización. Redirigir del "por qué" al "qué" y "cómo" en el cuerpo.

---

## ✨ Características

- 🤖 **Bot de WhatsApp** con IA (Gemini 1.5 Flash)
- 🧠 **Lógica de Gestalt** que detecta intelectualización y redirige al cuerpo
- 📊 **Dashboard de Autoconocimiento** con visualizaciones de patrones
- 🔐 **Separación estricta PII/PHI** para cumplir con privacidad
- 👨‍⚕️ **Modo B2B2C** para psicólogos que asignan pacientes
- 📈 **Análisis de Tendencias** emocionales y corporales

---

## 🚀 Quick Start

### Prerequisitos

- Node.js 20+
- Cuenta en [Neon](https://console.neon.tech) (PostgreSQL)
- API key de [Google Gemini](https://makersuite.google.com/app/apikey)

### Instalación

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd continuum

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Configurar base de datos
npm run db:migrate
npm run db:seed  # (opcional) datos de ejemplo

# 5. Iniciar desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Stack Tecnológico

| Categoría | Tecnología |
|-----------|-----------|
| **Frontend/Backend** | Next.js 16 (App Router) + TypeScript |
| **Base de Datos** | Neon (PostgreSQL Serverless) |
| **ORM** | Prisma |
| **Autenticación** | Better Auth |
| **IA** | Gemini 1.5 Flash (Google) |
| **Mensajería** | WhatsApp vía Ycloud API |
| **Estilo** | Tailwind CSS 4 |
| **Linting** | Biome |

---

## 📁 Estructura del Proyecto

```
continuum/
├── prisma/
│   ├── schema.prisma       # Modelo de datos
│   └── seed.ts             # Datos de ejemplo
├── src/
│   ├── domain/             # 📦 Entidades y lógica de negocio
│   ├── use-cases/          # 🎯 Casos de uso de aplicación
│   ├── repositories/       # 💾 Abstracción de persistencia
│   ├── services/           # 🔧 Integraciones (Gemini, WhatsApp)
│   ├── app/                # 🌐 Next.js (routes, pages)
│   ├── components/         # 🎨 Componentes UI
│   ├── lib/                # 🛠️ Utilidades
│   ├── config/             # ⚙️ Configuración
│   └── types/              # 📝 Tipos TypeScript
├── docs/
│   ├── SETUP.md            # Guía de configuración
│   └── ARCHITECTURE.md     # Documentación de arquitectura
└── CLAUDE.md               # Reglas del proyecto
```

---

## 🎯 Arquitectura

Continuum AI utiliza **Arquitectura en Capas** con **DDD Ligero**:

```
Presentation (Next.js)
        ↓ ↑
Application (Use Cases)
        ↓ ↑
Domain (Entities + VOs)
   ↓ ↑         ↓ ↑
Repositories  Services
```

**Principios clave:**
- ✅ Separation of Concerns
- ✅ Dependency Inversion
- ✅ Domain-Driven Design Ligero
- ✅ Testability First

📖 Lee la [documentación completa de arquitectura](docs/ARCHITECTURE.md)

---

## 🔧 Comandos Disponibles

### Desarrollo

```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Build para producción
npm run start        # Iniciar servidor de producción
npm run lint         # Ejecutar linter
npm run format       # Formatear código
npm run ngrok        # Exponer webhook con ngrok (requiere npm run dev en otra terminal)
```

### Base de Datos

```bash
npm run db:generate     # Generar cliente de Prisma
npm run db:migrate      # Crear y aplicar migraciones
npm run db:push         # Push schema sin migración
npm run db:studio       # Abrir Prisma Studio
npm run db:seed         # Ejecutar seed
npm run db:clean-users  # Limpiar datos de usuarios (dev only)
npm run db:test         # Probar conexión a BD
```

**Limpiar datos de prueba:**
```bash
# Limpiar TODOS los usuarios de prueba
npm run db:clean-users

# Limpiar solo un usuario específico
npm run db:clean-users -- --phone=+5491121913619
```

### Testing

```bash
npm run test:repos   # Probar repositorios
npm run test:bot     # Probar bot localmente (script)
```

**UI de Testing:**
- Abre [http://localhost:3000/chat](http://localhost:3000/chat) para probar el bot con una interfaz de chat
- No requiere WhatsApp ni mensajes SMS
- Incluye funciones de debug (resetear conversación, cambiar usuario)

---

## 📊 Modelo de Datos

### Tablas Principales

- **User** (PII): Usuarios de la plataforma
- **Account** (PII): Credenciales de autenticación
- **Psychologist** (PII): Profesionales de salud mental
- **CheckIn** (PHI): Sesiones de check-in con las 3 zonas
- **BodySensation** (PHI): Sensaciones corporales detalladas

### Separación PII/PHI

```
PII (Personal Identifiable Information)
└── User, Account, Psychologist

PHI (Protected Health Information)
└── CheckIn, BodySensation
```

Esta separación permite cumplir con regulaciones de privacidad (GDPR/HIPAA).

---

## 🔐 Variables de Entorno

```env
# Database
DATABASE_URL="postgresql://..."

# Better Auth
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"

# Ycloud
YCLOUD_API_KEY="..."
YCLOUD_WEBHOOK_SECRET="..."

# Gemini AI
GEMINI_API_KEY="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

---

## 🧪 Testing

```bash
# Unit tests (dominio)
npm test

# Integration tests (casos de uso)
npm run test:integration

# E2E tests
npm run test:e2e
```

---

## 📈 Roadmap

### ✅ MVP (Actual)
- [x] Configurar Prisma con Neon
- [x] Definir arquitectura de software
- [x] Implementar capa de dominio (Entities, VOs, Errors)
- [x] Implementar repositorios con Prisma
- [x] Crear System Prompt de Gestalt
- [x] Implementar bot de WhatsApp con Gemini AI
- [x] Crear webhook con validación de firma
- [x] Script para exponer webhook con ngrok
- [ ] Configurar Better Auth
- [ ] Dashboard básico de usuario

### 🔄 V1.5 (Post-MVP)
- [ ] DTOs para validación
- [ ] Separar controllers
- [ ] Mappers Domain ↔ Prisma
- [ ] Tests unitarios completos

### 🚀 V2 (Escalamiento)
- [ ] Dashboard clínico para psicólogos
- [ ] Análisis de tendencias con gráficos
- [ ] Clean Architecture completa
- [ ] Event-Driven Architecture
- [ ] OAuth (Google)

---

## 👥 Contribución

Este es un proyecto privado. Si tienes acceso, por favor sigue estas guías:

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## 📚 Documentación

- [Guía de Setup](docs/SETUP.md) - Configuración inicial del proyecto
- [Arquitectura de Software](docs/ARCHITECTURE.md) - Diseño y patrones
- [Configuración de Ycloud](docs/YCLOUD_SETUP.md) - Integración con WhatsApp
- [Reglas del Proyecto](CLAUDE.md) - Metodología de desarrollo
- [Documentación de Prisma](prisma/README.md) - Base de datos
- [Scripts de Testing](scripts/README.md) - Herramientas de prueba

---

## 💬 Soporte

Si tienes preguntas o encuentras algún problema:

1. Revisa la [documentación](docs/)
2. Busca en issues existentes
3. Crea un nuevo issue si es necesario

---

**Construido con ❤️ por el equipo de Continuum AI**
