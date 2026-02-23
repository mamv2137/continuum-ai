'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useSession } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Brain, LayoutDashboard } from 'lucide-react'

export function LandingHeader() {
  const { data: session, isPending } = useSession()

  // Debug: Log session changes
  useEffect(() => {
    console.log('🔐 [Auth Debug] Session state:', {
      isPending,
      isAuthenticated: !!session,
      session: session ? {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
        },
        expiresAt: session.session.expiresAt,
      } : null,
    })
  }, [session, isPending])

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <span className="text-lg font-bold">Continuum AI</span>
        </Link>

        <div className="flex items-center gap-4">
          {isPending ? (
            // Loading state
            <>
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </>
          ) : session ? (
            // Authenticated state
            <>
              <span className="hidden text-sm text-muted-foreground sm:block">
                Hola, {session.user.name?.split(' ')[0] || session.user.email}
              </span>
              <Link href="/dashboard">
                <Button>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            </>
          ) : (
            // Unauthenticated state
            <>
              <Link href="/login">
                <Button variant="ghost">Iniciar Sesión</Button>
              </Link>
              <Link href="/register">
                <Button>Comenzar</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
