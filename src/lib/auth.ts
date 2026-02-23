/**
 * Better Auth Configuration
 *
 * Configuración centralizada de autenticación con Better Auth
 * Incluye: Email/Password, Magic Link, Google OAuth, gestión de sesiones
 */

import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { magicLink } from 'better-auth/plugins'
import { prisma } from './db'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Cambiar a true en producción
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        // En desarrollo, log el link a la consola del servidor
        console.log(`\n========================================`)
        console.log(`🔗 MAGIC LINK para ${email}`)
        console.log(`========================================`)
        console.log(url)
        console.log(`========================================\n`)

        // TODO: En producción, configurar con Resend/SendGrid
        // await resend.emails.send({
        //   from: 'Continuum AI <noreply@tudominio.com>',
        //   to: email,
        //   subject: 'Tu link de acceso a Continuum AI',
        //   html: `<a href="${url}">Iniciar sesión</a>`,
        // })
      },
      expiresIn: 60 * 15, // 15 minutos
      disableSignUp: false,
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24, // 24 horas por defecto
    updateAge: 60 * 60, // Actualizar cada hora
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // Cache de cookie: 5 minutos
    },
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ],
  secret: process.env.BETTER_AUTH_SECRET as string,
})

export type Session = typeof auth.$Infer.Session
