/**
 * Prisma Client para Edge Runtime
 *
 * Usa el driver de Neon optimizado para edge functions y serverless.
 * Solo usar cuando específicamente necesites Edge Runtime.
 *
 * Uso:
 * - En API Routes con edge runtime
 * - En Server Actions con edge runtime
 *
 * IMPORTANTE: Este archivo requiere configuración adicional.
 * Para la mayoría de casos, usa el cliente regular de @/lib/db
 */

import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

// Solo crear el cliente si estamos en edge runtime
export function createEdgePrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está definida')
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaNeon(pool)

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

// Uso:
// export const runtime = 'edge'
// const prisma = createEdgePrismaClient()
