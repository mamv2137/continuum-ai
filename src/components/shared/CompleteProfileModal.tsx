'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { isValidPhoneNumber } from 'react-phone-number-input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PhoneInput } from '@/components/shared/PhoneInput'
import { Phone, MessageCircle, Loader2 } from 'lucide-react'

const phoneSchema = z.object({
  phoneNumber: z.string().refine(
    (val) => isValidPhoneNumber(val || ''),
    { message: 'Número de teléfono inválido' }
  ),
})

type PhoneFormData = z.infer<typeof phoneSchema>

interface CompleteProfileModalProps {
  isOpen: boolean
  onComplete: () => void
  userName?: string
}

export function CompleteProfileModal({
  isOpen,
  onComplete,
  userName,
}: CompleteProfileModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: '',
    },
  })

  const onSubmit = async (data: PhoneFormData) => {
    setIsSubmitting(true)
    setServerError('')

    try {
      const response = await fetch('/api/dashboard/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: data.phoneNumber }),
      })

      if (response.ok) {
        console.log('🔐 [Profile] Phone number saved:', data.phoneNumber)
        onComplete()
      } else {
        const result = await response.json()
        setServerError(result.error || 'Error al guardar el teléfono')
      }
    } catch (error) {
      console.error('Error saving phone:', error)
      setServerError('Error al guardar. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Phone className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">
            {userName ? `¡Hola ${userName.split(' ')[0]}!` : '¡Bienvenido!'}
          </DialogTitle>
          <DialogDescription className="text-center">
            Para poder enviarte check-ins por WhatsApp, necesitamos tu número de teléfono.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Número de WhatsApp
            </label>
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.phoneNumber}
                  placeholder="55 1234 5678"
                  disabled={isSubmitting}
                />
              )}
            />
            {errors.phoneNumber && (
              <p className="text-xs text-destructive">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-muted p-3">
            <MessageCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Usaremos este número para enviarte recordatorios y permitirte
              hacer check-ins directamente desde WhatsApp.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar y continuar'
            )}
          </Button>

          <button
            type="button"
            onClick={onComplete}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            Configurar después
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
