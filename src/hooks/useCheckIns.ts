'use client'

import useSWR from 'swr'

export interface CheckIn {
  id: string
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'
  externalZone: string | null
  fantasyZone: string | null
  aiInsight: string | null
  emotionalTone: string | null
  duration: number | null
  messageCount: number
  createdAt: string
  completedAt: string | null
  bodySensations: {
    id: string
    bodyPart: string
    sensationType: string | null
    intensity: number | null
    description: string | null
  }[]
}

interface CheckInsResponse {
  checkIns: CheckIn[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
})

interface UseCheckInsOptions {
  page?: number
  pageSize?: number
  status?: string
}

export function useCheckIns(options: UseCheckInsOptions = {}) {
  const { page = 1, pageSize = 10, status } = options

  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })

  if (status) {
    params.append('status', status)
  }

  const { data, error, isLoading, mutate } = useSWR<CheckInsResponse>(
    `/api/dashboard/check-ins?${params.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    checkIns: data?.checkIns ?? [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate,
  }
}
