'use client'

import { TopCards } from '@/components/dashboard/TopCards'
import { EmotionalTrendsChart } from '@/components/dashboard/EmotionalTrendsChart'
import { RecentCheckIns } from '@/components/dashboard/RecentCheckIns'
import { useUser } from '@/hooks/useUser'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const { user, stats, isLoading } = useUser()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-1 h-4 w-64" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[450px]" />
          <Skeleton className="h-[450px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          {user?.name ? `Hola, ${user.name.split(' ')[0]}` : 'Dashboard'}
        </h1>
        <p className="text-muted-foreground">
          Tu resumen de bienestar personal
        </p>
      </div>

      {/* Stats Cards */}
      <TopCards
        totalCheckIns={stats?.totalCheckIns ?? 0}
        weeklyCheckIns={stats?.weeklyCheckIns ?? 0}
        currentStreak={stats?.currentStreak ?? 0}
        lastCheckInAt={stats?.lastCheckInAt ?? null}
      />

      {/* Charts and Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <EmotionalTrendsChart />
        <RecentCheckIns />
      </div>
    </div>
  )
}
