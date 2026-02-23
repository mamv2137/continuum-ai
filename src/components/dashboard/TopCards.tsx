'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Calendar, Clock, Flame, Hash } from 'lucide-react'

interface TopCardsProps {
  totalCheckIns: number
  weeklyCheckIns: number
  currentStreak: number
  lastCheckInAt: string | null
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color: 'primary' | 'success' | 'warning' | 'muted'
}

function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    muted: 'bg-muted text-muted-foreground',
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-lg',
              colorClasses[color]
            )}
          >
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TopCards({
  totalCheckIns,
  weeklyCheckIns,
  currentStreak,
  lastCheckInAt,
}: TopCardsProps) {
  const formatLastCheckIn = (dateString: string | null) => {
    if (!dateString) return 'Nunca'

    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60))
        return `Hace ${diffMinutes} min`
      }
      return `Hace ${diffHours}h`
    }
    if (diffDays === 1) return 'Ayer'
    if (diffDays < 7) return `Hace ${diffDays} días`

    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    })
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Check-ins"
        value={totalCheckIns}
        icon={<Hash className="h-6 w-6" />}
        color="primary"
      />
      <StatCard
        title="Esta semana"
        value={weeklyCheckIns}
        subtitle="check-ins completados"
        icon={<Calendar className="h-6 w-6" />}
        color="success"
      />
      <StatCard
        title="Racha actual"
        value={currentStreak}
        subtitle={currentStreak === 1 ? 'día consecutivo' : 'días consecutivos'}
        icon={<Flame className="h-6 w-6" />}
        color="warning"
      />
      <StatCard
        title="Último check-in"
        value={formatLastCheckIn(lastCheckInAt)}
        icon={<Clock className="h-6 w-6" />}
        color="muted"
      />
    </div>
  )
}
