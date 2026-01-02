# Guía de Setup - Continuum AI

Esta guía te ayudará a configurar el proyecto desde cero.

## 📋 Requisitos Previos

- Node.js 20+ instalado
- Cuenta en [Neon](https://console.neon.tech)
- Editor de código (VS Code recomendado)

## 🚀 Configuración Inicial

### 1. Clonar el Repositorio e Instalar Dependencias

```bash
git clone <repo-url>
cd continuum
npm install
```

### 2. Configurar Base de Datos en Neon

1. Ve a [console.neon.tech](https://console.neon.tech)
2. Crea un nuevo proyecto llamado "continuum-ai"
3. Copia el connection string que aparece
4. Pega el connection string en el archivo `.env`:

```env
DATABASE_URL="postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require"
```

### 3. Configurar Variables de Entorno

Edita el archivo `.env` y configura las siguientes variables:

```env
# Database (ya configurado en paso anterior)
DATABASE_URL="postgresql://..."

# Better Auth
BETTER_AUTH_SECRET="[ejecuta: openssl rand -base64 32]"
BETTER_AUTH_URL="http://localhost:3000"

# Ycloud (obtener después)
YCLOUD_API_KEY="pendiente"
YCLOUD_WEBHOOK_SECRET="pendiente"

# Gemini AI (obtener de https://makersuite.google.com/app/apikey)
GEMINI_API_KEY="pendiente"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 4. Generar Secret para Better Auth

```bash
openssl rand -base64 32
```

Copia el resultado y pégalo en `BETTER_AUTH_SECRET` en el archivo `.env`.

### 5. Inicializar Base de Datos

```bash
# Generar cliente de Prisma
npm run db:generate

# Aplicar migraciones (crear tablas en Neon)
npm run db:migrate

# (Opcional) Cargar datos de ejemplo
npm run db:seed
```

### 6. Verificar Configuración

Abre Prisma Studio para ver la base de datos:

```bash
npm run db:studio
```

Deberías ver las siguientes tablas:
- User
- Account
- CheckIn
- BodySensation
- Psychologist
- VerificationToken

### 7. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🔧 Comandos Útiles

### Base de Datos

```bash
# Generar cliente de Prisma después de cambios en schema
npm run db:generate

# Crear y aplicar nueva migración
npm run db:migrate

# Push schema sin crear migración (dev rápido)
npm run db:push

# Abrir Prisma Studio
npm run db:studio

# Ejecutar seed
npm run db:seed
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Ejecutar linter
npm run lint

# Formatear código
npm run format

# Build para producción
npm run build

# Iniciar servidor de producción
npm start
```

## 📁 Estructura del Proyecto

```
continuum/
├── prisma/
│   ├── schema.prisma          # Schema de base de datos
│   ├── seed.ts                # Datos de ejemplo
│   ├── migrations/            # Historial de migraciones
│   └── README.md              # Docs de Prisma
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API Routes
│   │   ├── dashboard/        # Páginas del dashboard
│   │   └── layout.tsx        # Layout principal
│   ├── lib/
│   │   ├── db.ts             # Cliente de Prisma
│   │   ├── db-edge.ts        # Cliente para Edge Runtime
│   │   └── utils.ts          # Utilidades
│   ├── services/
│   │   ├── ai.ts             # Servicio de Gemini AI
│   │   ├── whatsapp.ts       # Servicio de Ycloud
│   │   └── analytics.ts      # Análisis de datos
│   ├── prompts/
│   │   └── gestalt-system.ts # System prompt de Gestalt
│   ├── types/
│   │   └── index.ts          # Tipos TypeScript
│   └── components/
│       ├── ui/               # Componentes UI
│       └── dashboard/        # Componentes del dashboard
├── docs/
│   └── SETUP.md              # Esta guía
├── .env                       # Variables de entorno
├── CLAUDE.md                  # Reglas del proyecto
└── package.json
```

## 🔑 Obtener API Keys

### Gemini AI
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Create API Key"
4. Copia la API key y pégala en `.env` como `GEMINI_API_KEY`

### Ycloud (WhatsApp)
1. Ve a [Ycloud](https://www.ycloud.com/)
2. Crea una cuenta o inicia sesión
3. Completa el proceso de verificación
4. Obtén tu API key desde el dashboard
5. Configura el webhook apuntando a tu servidor

**Nota:** La configuración de Ycloud se hará en una fase posterior.

## ✅ Verificar Instalación

Ejecuta los siguientes comandos para verificar que todo está funcionando:

```bash
# 1. Verificar que Prisma puede conectarse
npx prisma db pull

# 2. Verificar que el servidor arranca
npm run dev

# 3. Verificar que puedes abrir Prisma Studio
npm run db:studio
```

## 🐛 Troubleshooting

### Error: "Can't reach database server"
- Verifica que `DATABASE_URL` esté correctamente configurada en `.env`
- Verifica tu conexión a Internet
- Verifica que el proyecto en Neon esté activo

### Error: "Environment variable not found"
- Asegúrate de que el archivo `.env` existe en la raíz del proyecto
- Verifica que todas las variables requeridas estén definidas
- Reinicia el servidor de desarrollo después de cambiar `.env`

### Error: "Module not found"
- Ejecuta `npm install` de nuevo
- Borra `node_modules` y ejecuta `npm install` limpio
- Verifica la versión de Node.js (debe ser 20+)

## 📚 Próximos Pasos

Una vez completado el setup:

1. ✅ **Fase 1 - Configurar Prisma con Neon** (COMPLETADA)
2. 🔄 **Fase 2 - Configurar Better Auth**
3. 🔄 **Fase 3 - Implementar Webhook de WhatsApp**
4. 🔄 **Fase 4 - Crear System Prompt de Gestalt**
5. 🔄 **Fase 5 - Dashboard Básico**

---

**¿Necesitas ayuda?** Abre un issue en el repositorio o consulta la documentación en `docs/`.
