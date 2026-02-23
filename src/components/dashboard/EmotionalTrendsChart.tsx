'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import useSWR from 'swr'

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => <Skeleton className="h-[350px] w-full" />,
})

interface EmotionalTrend {
  date: string
  [key: string]: string | number
}

interface StatsResponse {
  emotionalTrends: EmotionalTrend[]
  emotionalToneDistribution: { tone: string; count: number }[]
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Map emotional tones to colors and Spanish labels
const toneConfig: Record<string, { color: string; label: string }> = {
  positive: { color: '#13deb9', label: 'Positivo' },
  negative: { color: '#ef4444', label: 'Negativo' },
  neutral: { color: '#7c8fac', label: 'Neutral' },
  anxious: { color: '#f6b51e', label: 'Ansioso' },
  sad: { color: '#5d87ff', label: 'Triste' },
  calm: { color: '#49beff', label: 'Calma' },
  happy: { color: '#13deb9', label: 'Feliz' },
  frustrated: { color: '#ef4444', label: 'Frustrado' },
  hopeful: { color: '#49beff', label: 'Esperanzado' },
}

export function EmotionalTrendsChart() {
  const [mounted, setMounted] = useState(false)
  const { data, isLoading } = useSWR<StatsResponse>('/api/dashboard/stats', fetcher)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Tendencias Emocionales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.emotionalTrends.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Tendencias Emocionales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[350px] items-center justify-center text-muted-foreground">
            <p>No hay datos suficientes para mostrar tendencias.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Extract unique tones from the data
  const allTones = new Set<string>()
  data.emotionalTrends.forEach((trend) => {
    Object.keys(trend).forEach((key) => {
      if (key !== 'date') allTones.add(key)
    })
  })

  // Prepare series data
  const series = Array.from(allTones).map((tone) => ({
    name: toneConfig[tone]?.label || tone,
    data: data.emotionalTrends.map((trend) => (trend[tone] as number) || 0),
  }))

  const categories = data.emotionalTrends.map((trend) => {
    const date = new Date(trend.date)
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  })

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'area',
      stacked: true,
      toolbar: {
        show: false,
      },
      fontFamily: 'inherit',
    },
    colors: Array.from(allTones).map(
      (tone) => toneConfig[tone]?.color || '#7c8fac'
    ),
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.5,
        opacityTo: 0.1,
      },
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: '#7c8fac',
          fontSize: '12px',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#7c8fac',
          fontSize: '12px',
        },
      },
    },
    grid: {
      borderColor: 'var(--border)',
      strokeDashArray: 4,
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: 'var(--foreground)',
      },
    },
    tooltip: {
      theme: 'dark',
    },
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-medium">
          Tendencias Emocionales
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Chart
          options={options}
          series={series}
          type="area"
          height={350}
        />
      </CardContent>
    </Card>
  )
}
