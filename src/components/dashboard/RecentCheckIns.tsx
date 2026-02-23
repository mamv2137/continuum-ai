'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCheckIns } from '@/hooks/useCheckIns'
import { ArrowRight, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  COMPLETED: { label: 'Completado', variant: 'default' },
  IN_PROGRESS: { label: 'En progreso', variant: 'secondary' },
  ABANDONED: { label: 'Abandonado', variant: 'destructive' },
}

const toneColors: Record<string, string> = {
  positive: 'bg-success/20 text-success',
  negative: 'bg-destructive/20 text-destructive',
  neutral: 'bg-muted text-muted-foreground',
  anxious: 'bg-warning/20 text-warning',
  sad: 'bg-primary/20 text-primary',
  calm: 'bg-info/20 text-info',
  happy: 'bg-success/20 text-success',
  frustrated: 'bg-destructive/20 text-destructive',
  hopeful: 'bg-info/20 text-info',
}

export function RecentCheckIns() {
  const { checkIns, isLoading } = useCheckIns({ pageSize: 5 })

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">
            Check-ins Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (checkIns.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">
            Check-ins Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">
              No tienes check-ins todavía.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Empieza una conversación por WhatsApp para crear tu primer check-in.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null
    const minutes = Math.floor(seconds / 60)
    return `${minutes} min`
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">
          Check-ins Recientes
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/check-ins" className="flex items-center gap-1">
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {checkIns.map((checkIn) => {
            const status = statusConfig[checkIn.status]
            const toneClass = checkIn.emotionalTone
              ? toneColors[checkIn.emotionalTone] || toneColors.neutral
              : toneColors.neutral

            return (
              <div
                key={checkIn.id}
                className="flex items-start gap-4 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
              >
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium',
                    toneClass
                  )}
                >
                  {checkIn.emotionalTone?.[0]?.toUpperCase() || 'N'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {formatDate(checkIn.createdAt)}
                    </span>
                    <Badge variant={status.variant} className="text-xs">
                      {status.label}
                    </Badge>
                  </div>
                  {checkIn.aiInsight && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {checkIn.aiInsight}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    {checkIn.emotionalTone && (
                      <span className="capitalize">{checkIn.emotionalTone}</span>
                    )}
                    {checkIn.duration && (
                      <span>{formatDuration(checkIn.duration)}</span>
                    )}
                    <span>{checkIn.messageCount} mensajes</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
