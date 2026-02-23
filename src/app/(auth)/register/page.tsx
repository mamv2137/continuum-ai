/**
 * Register Page
 *
 * Registro simplificado con selección de rol y Google OAuth
 * Usa react-hook-form para manejo de formularios
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn, signUp } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { User, Stethoscope, Brain, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Zod schema para validación
const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

type RegisterFormData = z.infer<typeof registerSchema>
type UserRole = 'INDIVIDUAL' | 'PSYCHOLOGIST'

export default function RegisterPage() {
  const router = useRouter()

  const [step, setStep] = useState<'role' | 'form'>('role')
  const [role, setRole] = useState<UserRole | null>(null)
  const [serverError, setServerError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    try {
      await signIn.social({
        provider: 'google',
        callbackURL: '/',
      })
    } catch (err) {
      setServerError('Error al conectar con Google')
      setGoogleLoading(false)
    }
  }

  const onSubmit = async (data: RegisterFormData) => {
    setServerError('')

    try {
      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      })

      if (result.error) {
        setServerError(result.error.message || 'Error al crear la cuenta')
      } else {
        // Guardar el rol seleccionado
        if (role) {
          await fetch('/api/dashboard/user', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role }),
          })
        }
        router.push('/')
      }
    } catch (err) {
      setServerError('Error al crear la cuenta. Por favor intenta de nuevo.')
    }
  }

  const isLoading = isSubmitting || googleLoading

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Continuum AI</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {step === 'role' ? '¿Cómo quieres usar la plataforma?' : 'Crea tu cuenta'}
          </p>
        </div>

        {step === 'role' ? (
          /* Step 1: Role Selection */
          <div className="space-y-4">
            <button
              onClick={() => { setRole('INDIVIDUAL'); setStep('form') }}
              className={cn(
                'w-full rounded-lg border-2 p-4 text-left transition-all hover:border-primary hover:bg-primary/5',
                role === 'INDIVIDUAL' ? 'border-primary bg-primary/5' : 'border-border'
              )}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Busco apoyo personal</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Quiero hacer check-ins de bienestar y conectar con un psicólogo
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => { setRole('PSYCHOLOGIST'); setStep('form') }}
              className={cn(
                'w-full rounded-lg border-2 p-4 text-left transition-all hover:border-primary hover:bg-primary/5',
                role === 'PSYCHOLOGIST' ? 'border-primary bg-primary/5' : 'border-border'
              )}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                  <Stethoscope className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h3 className="font-medium">Soy profesional de salud mental</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Quiero acompañar a mis pacientes entre sesiones
                  </p>
                </div>
              </div>
            </button>

            <div className="pt-4 text-center text-sm">
              <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
              <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                Inicia sesión
              </Link>
            </div>
          </div>
        ) : (
          /* Step 2: Registration Form */
          <div className="space-y-6">
            {/* Back button */}
            <button
              onClick={() => setStep('role')}
              className="text-sm text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              ← Cambiar tipo de cuenta
            </button>

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              {googleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continuar con Google
            </Button>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                o con email
              </span>
            </div>

            {/* Email Form with react-hook-form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {serverError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {serverError}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium">
                  Nombre
                </label>
                <Input
                  id="name"
                  type="text"
                  {...register('name')}
                  className={cn('mt-1', errors.name && 'border-destructive')}
                  placeholder="Tu nombre"
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className={cn('mt-1', errors.email && 'border-destructive')}
                  placeholder="tu@email.com"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Contraseña
                </label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  className={cn('mt-1', errors.password && 'border-destructive')}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                {errors.password ? (
                  <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Mínimo 8 caracteres
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  'Crear cuenta'
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground">
              Al registrarte aceptas nuestros{' '}
              <Link href="/terms" className="underline hover:text-foreground">
                términos de servicio
              </Link>{' '}
              y{' '}
              <Link href="/privacy" className="underline hover:text-foreground">
                política de privacidad
              </Link>
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
