# Configuración de Prisma con Neon

Este directorio contiene el schema de Prisma para Continuum AI.

## 📋 Prerequisitos

1. **Cuenta de Neon**
   - Crear cuenta en [https://console.neon.tech](https://console.neon.tech)
   - Crear un nuevo proyecto
   - Copiar el connection string

2. **Variables de Entorno**
   - Configurar `DATABASE_URL` en el archivo `.env`
   - Formato: `postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require`

## 🚀 Comandos Principales

### Generar Cliente de Prisma
```bash
npx prisma generate
```

### Crear y Aplicar Migraciones
```bash
# Crear migración inicial
npx prisma migrate dev --name init

# Crear migración con nombre personalizado
npx prisma migrate dev --name add_clinical_notes

# Aplicar migraciones en producción
npx prisma migrate deploy
```

### Abrir Prisma Studio
```bash
npx prisma studio
```

### Resetear Base de Datos (⚠️ DESTRUCTIVO)
```bash
npx prisma migrate reset
```

### Pull Schema desde DB Existente
```bash
npx prisma db pull
```

### Push Schema sin Migración (desarrollo rápido)
```bash
npx prisma db push
```

## 📊 Estructura del Schema

### Tablas PII (Información Personal Identificable)
- `User` - Usuarios de la plataforma
- `Account` - Credenciales de autenticación
- `Psychologist` - Profesionales de salud mental
- `VerificationToken` - Tokens de verificación de email

### Tablas PHI (Información de Salud Protegida)
- `CheckIn` - Sesiones de check-in con Gemini
- `BodySensation` - Sensaciones corporales (Zona Interna de Gestalt)

### Enums
- `UserRole` - INDIVIDUAL | PATIENT
- `SessionStatus` - IN_PROGRESS | COMPLETED | ABANDONED
- `AuthProvider` - EMAIL | GOOGLE | PHONE

## 🔐 Seguridad y Privacidad

### Separación PII/PHI
El schema está diseñado para cumplir con regulaciones de privacidad:

- **PII:** Datos que identifican a la persona (email, teléfono, nombre)
- **PHI:** Datos de salud mental (check-ins, sensaciones, insights)

Esta separación permite:
- Exportar/eliminar datos personales sin perder datos clínicos anonimizados
- Auditorías de seguridad más sencillas
- Cumplimiento con GDPR/HIPAA

### Índices para Performance
El schema incluye índices optimizados para:
- Búsqueda rápida por número de teléfono (WhatsApp)
- Historial de check-ins ordenado por fecha
- Filtrado por estado de sesión
- Queries de psicólogos a sus pacientes

## 🔄 Migrations

Las migraciones se almacenan en `prisma/migrations/` y deben:
- Estar en control de versiones (Git)
- Aplicarse en orden secuencial
- Incluir rollback strategy para cambios críticos

### Ejemplo de Flujo de Desarrollo

```bash
# 1. Modificar schema.prisma
# 2. Crear migración
npx prisma migrate dev --name add_user_timezone

# 3. Verificar cambios
npx prisma studio

# 4. Regenerar cliente
npx prisma generate
```

## 🌐 Edge Runtime

Para usar Prisma en Edge Runtime (API routes con `export const runtime = 'edge'`):

```typescript
import { createEdgePrismaClient } from '@/lib/db-edge'

export const runtime = 'edge'

export async function GET() {
  const prisma = createEdgePrismaClient()
  // ... tu código
}
```

**Nota:** La mayoría de casos deben usar el cliente regular de `@/lib/db`.

## 📚 Recursos

- [Prisma Docs](https://www.prisma.io/docs)
- [Neon Docs](https://neon.tech/docs)
- [Prisma + Neon Guide](https://neon.tech/docs/guides/prisma)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

## 🆘 Troubleshooting

### Error: "Can't reach database server"
- Verificar que `DATABASE_URL` esté correctamente configurada
- Verificar conectividad a Internet
- Revisar que el proyecto de Neon esté activo

### Error: "Migration failed"
- Revisar logs de error detallados
- Verificar que no haya datos que violen constraints
- Considerar usar `prisma migrate resolve` para marcar migración como aplicada

### Performance lento
- Verificar que los índices estén creados
- Usar `EXPLAIN ANALYZE` en queries problemáticas
- Considerar Prisma Accelerate para caching
