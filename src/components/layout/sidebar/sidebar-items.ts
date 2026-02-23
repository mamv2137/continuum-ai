import {
  LayoutDashboard,
  History,
  User,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface SidebarItem {
  title: string
  href: string
  icon: LucideIcon
  roles?: ('INDIVIDUAL' | 'PATIENT' | 'PSYCHOLOGIST')[]
  badge?: string
}

export interface SidebarSection {
  title?: string
  items: SidebarItem[]
}

export const sidebarItems: SidebarSection[] = [
  {
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Historial',
        href: '/dashboard/check-ins',
        icon: History,
      },
      {
        title: 'Perfil',
        href: '/dashboard/profile',
        icon: User,
      },
      {
        title: 'Configuración',
        href: '/dashboard/settings',
        icon: Settings,
      },
    ],
  },
  {
    title: 'Clínico',
    items: [
      {
        title: 'Pacientes',
        href: '/dashboard/clinical/patients',
        icon: Users,
        roles: ['PSYCHOLOGIST'],
        badge: 'V2',
      },
    ],
  },
]
