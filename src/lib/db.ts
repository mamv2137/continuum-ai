/**
 * Prisma Client configurado para Neon Database
 *
 * Uso:
 * - En Server Components: import { prisma } from '@/lib/db'
 * - En API Routes: import { prisma } from '@/lib/db'
 *
 * Optimizaciones:
 * - Connection pooling automático de Neon
 * - Single instance en desarrollo (hot reload)
 * - Compatible con Edge Runtime usando @neondatabase/serverless
 */

import { PrismaClient } from '@/generated/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
