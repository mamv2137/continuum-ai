'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { isValidPhoneNumber } from 'react-phone-number-input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PhoneInput } from '@/components/shared/PhoneInput'
import { useUser } from '@/hooks/useUser'
import {
  User,
  Phone,
  Mail,
  Shield,
  Copy,
  Check,
  Pencil,
  X,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const profileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || isValidPhoneNumber(val),
      { message: 'Número de teléfono inválido' }
    ),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { user, stats, isLoading, mutate } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [copied, setCopied] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
    },
  })

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
      })
    }
  }, [user, reset])

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const response = await fetch('/api/dashboard/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          phoneNumber: data.phoneNumber || null,
        }),
      })

      if (response.ok) {
        mutate()
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  const handleCancel = () => {
    reset({
      name: user?.name || '',
      phoneNumber: user?.phoneNumber || '',
    })
    setIsEditing(false)
  }

  const copyCode = async () => {
    if (user?.psychologistCode) {
      await navigator.clipboard.writeText(user.psychologistCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const roleLabels: Record<string, string> = {
    INDIVIDUAL: 'Usuario Individual',
    PATIENT: 'Paciente',
    PSYCHOLOGIST: 'Psicólogo/a',
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-1 h-4 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mi Perfil</h1>
          <p className="text-muted-foreground">
            Administra tu información personal
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <Pencil className="mr-2 h-4 w-4" />
            Editar perfil
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Info */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Información Personal
              </CardTitle>
              <CardDescription>
                {isEditing
                  ? 'Edita tu información y guarda los cambios'
                  : 'Tu nombre y datos de contacto'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre</label>
                {isEditing ? (
                  <>
                    <Input
                      {...register('name')}
                      placeholder="Tu nombre"
                      className={cn(errors.name && 'border-destructive')}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm">{user?.name || 'No configurado'}</p>
                )}
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {user?.email || 'No registrado'}
                  </span>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Teléfono (WhatsApp)
                </label>
                {isEditing ? (
                  <>
                    <Controller
                      name="phoneNumber"
                      control={control}
                      render={({ field }) => (
                        <PhoneInput
                          value={field.value || ''}
                          onChange={field.onChange}
                          error={!!errors.phoneNumber}
                          placeholder="55 1234 5678"
                        />
                      )}
                    />
                    {errors.phoneNumber && (
                      <p className="text-xs text-destructive">
                        {errors.phoneNumber.message}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {user?.phoneNumber || 'No configurado'}
                    </span>
                    {!user?.phoneNumber && (
                      <Badge variant="secondary" className="text-xs">
                        Requerido
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {isEditing && (
                <div className="flex gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isDirty}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar cambios'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4" />
                Información de Cuenta
              </CardTitle>
              <CardDescription>
                Detalles de tu cuenta y rol
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rol</label>
                <div>
                  <Badge variant="secondary">
                    {user?.role ? roleLabels[user.role] : 'Usuario'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Miembro desde</label>
                <p className="text-sm text-muted-foreground">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estado de Onboarding</label>
                <div>
                  <Badge variant={user?.onboardingDone ? 'default' : 'secondary'}>
                    {user?.onboardingDone ? 'Completado' : 'Pendiente'}
                  </Badge>
                </div>
              </div>

              {/* Psychologist Code */}
              {user?.role === 'PSYCHOLOGIST' && user?.psychologistCode && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Código de Vinculación
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Comparte este código con tus pacientes para vincularse contigo
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted px-3 py-2 rounded-md text-sm font-mono">
                      {user.psychologistCode}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={copyCode}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="shadow-sm md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Resumen de Actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-3xl font-bold text-primary">
                    {stats?.totalCheckIns ?? 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Check-ins</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-3xl font-bold text-success">
                    {stats?.currentStreak ?? 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Racha actual</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-3xl font-bold text-warning">
                    {stats?.weeklyCheckIns ?? 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Esta semana</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
