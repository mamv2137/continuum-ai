import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { Sidebar } from '@/components/layout/sidebar/Sidebar'
import { Header } from '@/components/layout/header/Header'
import { DashboardProvider } from '@/components/dashboard/DashboardProvider'
import { prisma } from '@/lib/db'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
  }

  // Fetch user role from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  })

  const userRole = user?.role as 'INDIVIDUAL' | 'PATIENT' | 'PSYCHOLOGIST' | undefined

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-background">
        <Sidebar userRole={userRole} />
        <div className="lg:ml-[var(--sidebar-width)]">
          <Header userRole={userRole} />
          <main className="p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  )
}
