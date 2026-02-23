'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { type CheckIn } from '@/hooks/useCheckIns'
import { Brain, Heart, Cloud, Clock, MessageSquare } from 'lucide-react'

interface CheckInDetailModalProps {
  checkIn: CheckIn | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  COMPLETED: { label: 'Completado', variant: 'default' },
  IN_PROGRESS: { label: 'En progreso', variant: 'secondary' },
  ABANDONED: { label: 'Abandonado', variant: 'destructive' },
}

export function CheckInDetailModal({
  checkIn,
  open,
  onOpenChange,
}: CheckInDetailModalProps) {
  if (!checkIn) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const status = statusConfig[checkIn.status]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalle del Check-in</span>
            <Badge variant={status.variant}>{status.label}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Meta info */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDate(checkIn.createdAt)}</span>
            </div>
            {checkIn.duration && (
              <div className="flex items-center gap-1">
                <span>Duración: {formatDuration(checkIn.duration)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{checkIn.messageCount} mensajes</span>
            </div>
          </div>

          {/* Emotional tone */}
          {checkIn.emotionalTone && (
            <div>
              <h3 className="flex items-center gap-2 font-medium mb-2">
                <Heart className="h-4 w-4 text-destructive" />
                Tono Emocional
              </h3>
              <p className="text-sm capitalize bg-muted/50 rounded-lg p-3">
                {checkIn.emotionalTone}
              </p>
            </div>
          )}

          <Separator />

          {/* 3 Zones */}
          <div className="space-y-4">
            {/* External Zone */}
            {checkIn.externalZone && (
              <div>
                <h3 className="flex items-center gap-2 font-medium mb-2">
                  <span className="text-lg">👁️</span>
                  Zona Externa
                </h3>
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  {checkIn.externalZone}
                </p>
              </div>
            )}

            {/* Internal Zone (Body Sensations) */}
            {checkIn.bodySensations && checkIn.bodySensations.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 font-medium mb-2">
                  <span className="text-lg">🫀</span>
                  Zona Interna (Sensaciones Corporales)
                </h3>
                <div className="space-y-2">
                  {checkIn.bodySensations.map((sensation) => (
                    <div
                      key={sensation.id}
                      className="bg-muted/50 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">
                          {sensation.bodyPart}
                        </span>
                        {sensation.intensity && (
                          <Badge variant="outline">
                            Intensidad: {sensation.intensity}/10
                          </Badge>
                        )}
                      </div>
                      {sensation.sensationType && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Tipo: {sensation.sensationType}
                        </p>
                      )}
                      {sensation.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {sensation.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fantasy Zone */}
            {checkIn.fantasyZone && (
              <div>
                <h3 className="flex items-center gap-2 font-medium mb-2">
                  <Cloud className="h-4 w-4 text-primary" />
                  Zona de Fantasía
                </h3>
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  {checkIn.fantasyZone}
                </p>
              </div>
            )}
          </div>

          {/* AI Insight */}
          {checkIn.aiInsight && (
            <>
              <Separator />
              <div>
                <h3 className="flex items-center gap-2 font-medium mb-2">
                  <Brain className="h-4 w-4 text-primary" />
                  Insight de la IA
                </h3>
                <p className="text-sm text-muted-foreground bg-primary/5 rounded-lg p-3 border border-primary/10">
                  {checkIn.aiInsight}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
