/**
 * Better Auth Configuration
 *
 * Configuración centralizada de autenticación con Better Auth
 * Incluye: Email/Password, gestión de sesiones, y adaptador de Prisma
 */

import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './db'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Cambiar a true en producción
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60, // 1 hora
    },
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ],
  secret: process.env.BETTER_AUTH_SECRET as string,
})

export type Session = typeof auth.$Infer.Session
