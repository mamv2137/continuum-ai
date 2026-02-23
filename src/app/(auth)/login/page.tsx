/**
 * Login Page
 *
 * Página de inicio de sesión con magic link o email/password
 * Usa react-hook-form para manejo de formularios
 */

'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Mail, Lock, Sparkles, Brain, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Zod schemas para validación
const magicLinkSchema = z.object({
  email: z.string().email('Email inválido'),
})

const passwordSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
  rememberMe: z.boolean(),
})

type MagicLinkFormData = z.infer<typeof magicLinkSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [magicLinkEmail, setMagicLinkEmail] = useState('')
  const [serverError, setServerError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  // Magic Link form
  const magicForm = useForm<MagicLinkFormData>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: '' },
  })

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setServerError('')
    try {
      console.log('🔐 [Auth Debug] Initiating Google sign in...')
      await signIn.social({
        provider: 'google',
        callbackURL: redirect,
      })
    } catch (err) {
      console.error('🔐 [Auth Debug] Google sign in error:', err)
      setServerError('Error al conectar con Google')
      setGoogleLoading(false)
    }
  }

  const onMagicLinkSubmit = async (data: MagicLinkFormData) => {
    setServerError('')

    try {
      console.log('🔐 [Auth Debug] Requesting magic link for:', data.email)

      const result = await signIn.magicLink({
        email: data.email,
        callbackURL: redirect,
      })

      if (result.error) {
        console.error('🔐 [Auth Debug] Magic link error:', result.error)
        if (result.error.code === 'USER_NOT_FOUND') {
          setServerError('No existe una cuenta con este email. Por favor regístrate primero.')
        } else {
          setServerError(result.error.message || 'Error al enviar el link')
        }
      } else {
        console.log('🔐 [Auth Debug] Magic link sent successfully to:', data.email)
        setMagicLinkEmail(data.email)
        setMagicLinkSent(true)
      }
    } catch (err) {
      console.error('🔐 [Auth Debug] Magic link exception:', err)
      setServerError('Error al enviar el link. Por favor intenta de nuevo.')
    }
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setServerError('')

    try {
      console.log('🔐 [Auth Debug] Attempting login with email:', data.email)

      const result = await signIn.email({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      })

      if (result.error) {
        console.error('🔐 [Auth Debug] Login failed:', result.error)
        setServerError(result.error.message || 'Error al iniciar sesión')
      } else {
        console.log('🔐 [Auth Debug] Login successful!', {
          user: result.data?.user,
          rememberMe: data.rememberMe,
        })
        router.push(redirect)
      }
    } catch (err) {
      console.error('🔐 [Auth Debug] Login exception:', err)
      setServerError('Error al iniciar sesión. Por favor intenta de nuevo.')
    }
  }

  const isLoading = magicForm.formState.isSubmitting || passwordForm.formState.isSubmitting || googleLoading

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Continuum AI</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inicia sesión para continuar
          </p>
        </div>

        {/* Google Sign In */}
        <Button
          type="button"
          variant="outline"
          className="w-full mb-4"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          {googleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          Continuar con Google
        </Button>

        <div className="relative mb-4">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            o con email
          </span>
        </div>

        {serverError && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {serverError}
          </div>
        )}

        <Tabs defaultValue="magic-link" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="magic-link" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Magic Link
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Contraseña
            </TabsTrigger>
          </TabsList>

          {/* Magic Link Tab */}
          <TabsContent value="magic-link" className="mt-6">
            {magicLinkSent ? (
              <div className="text-center py-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium">Revisa tu correo</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Hemos enviado un link de acceso a <strong>{magicLinkEmail}</strong>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  El link expira en 15 minutos
                </p>
                <Button
                  variant="ghost"
                  className="mt-4"
                  onClick={() => {
                    setMagicLinkSent(false)
                    setMagicLinkEmail('')
                    magicForm.reset()
                  }}
                >
                  Usar otro email
                </Button>
              </div>
            ) : (
              <form onSubmit={magicForm.handleSubmit(onMagicLinkSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="magic-email" className="block text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="magic-email"
                    type="email"
                    {...magicForm.register('email')}
                    className={cn('mt-1', magicForm.formState.errors.email && 'border-destructive')}
                    placeholder="tu@email.com"
                    disabled={isLoading}
                  />
                  {magicForm.formState.errors.email && (
                    <p className="mt-1 text-xs text-destructive">
                      {magicForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {magicForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar link de acceso'
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Te enviaremos un link para iniciar sesión sin contraseña
                </p>
              </form>
            )}
          </TabsContent>

          {/* Email/Password Tab */}
          <TabsContent value="password" className="mt-6">
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  {...passwordForm.register('email')}
                  className={cn('mt-1', passwordForm.formState.errors.email && 'border-destructive')}
                  placeholder="tu@email.com"
                  disabled={isLoading}
                />
                {passwordForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-destructive">
                    {passwordForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Contraseña
                </label>
                <Input
                  id="password"
                  type="password"
                  {...passwordForm.register('password')}
                  className={cn('mt-1', passwordForm.formState.errors.password && 'border-destructive')}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                {passwordForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-destructive">
                    {passwordForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={passwordForm.watch('rememberMe')}
                  onCheckedChange={(checked) => {
                    passwordForm.setValue('rememberMe', checked === true)
                  }}
                  disabled={isLoading}
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Recuérdame
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {passwordForm.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">¿No tienes cuenta? </span>
          <Link
            href="/register"
            className="font-medium text-primary hover:text-primary/80"
          >
            Regístrate
          </Link>
        </div>

        {/* Terms Link */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Al iniciar sesión aceptas nuestros{' '}
          <Link href="/terms" className="underline hover:text-foreground">
            términos y condiciones
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  )
}
