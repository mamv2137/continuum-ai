'use client'

import useSWR from 'swr'

interface UserStats {
  totalCheckIns: number
  weeklyCheckIns: number
  currentStreak: number
  lastCheckInAt: string | null
}

interface User {
  id: string
  name: string | null
  email: string | null
  phoneNumber: string | null
  role: 'INDIVIDUAL' | 'PATIENT' | 'PSYCHOLOGIST'
  psychologistCode: string | null
  onboardingDone: boolean
  createdAt: string
}

interface UserData {
  user: User
  stats: UserStats
}

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
})

export function useUser() {
  const { data, error, isLoading, mutate } = useSWR<UserData>(
    '/api/dashboard/user',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  const needsPhoneNumber = !isLoading && data?.user && !data.user.phoneNumber

  return {
    user: data?.user,
    stats: data?.stats,
    isLoading,
    isError: error,
    mutate,
    needsPhoneNumber,
  }
}
