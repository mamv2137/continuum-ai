'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/hooks/useUser'
import { CompleteProfileModal } from '@/components/shared/CompleteProfileModal'

interface DashboardProviderProps {
  children: React.ReactNode
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const { user, needsPhoneNumber, mutate } = useUser()
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [hasSeenModal, setHasSeenModal] = useState(false)

  useEffect(() => {
    // Check if user needs phone number and hasn't dismissed the modal
    if (needsPhoneNumber && !hasSeenModal) {
      // Small delay to avoid showing immediately on page load
      const timer = setTimeout(() => {
        setShowPhoneModal(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [needsPhoneNumber, hasSeenModal])

  const handleModalComplete = () => {
    setShowPhoneModal(false)
    setHasSeenModal(true)
    mutate() // Refresh user data
  }

  return (
    <>
      {children}
      <CompleteProfileModal
        isOpen={showPhoneModal}
        onComplete={handleModalComplete}
        userName={user?.name || undefined}
      />
    </>
  )
}
