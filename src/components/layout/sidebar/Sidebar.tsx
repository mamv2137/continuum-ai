'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { sidebarItems, type SidebarItem } from './sidebar-items'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Brain } from 'lucide-react'

interface SidebarProps {
  userRole?: 'INDIVIDUAL' | 'PATIENT' | 'PSYCHOLOGIST'
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()

  const isItemVisible = (item: SidebarItem) => {
    if (!item.roles) return true
    if (!userRole) return false
    return item.roles.includes(userRole)
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[var(--sidebar-width)] border-r border-sidebar-border bg-sidebar lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">
            Continuum
          </span>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-4 py-4">
          <nav className="space-y-6">
            {sidebarItems.map((section, sectionIndex) => {
              const visibleItems = section.items.filter(isItemVisible)
              if (visibleItems.length === 0) return null

              return (
                <div key={sectionIndex}>
                  {section.title && (
                    <>
                      <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {section.title}
                      </h3>
                    </>
                  )}
                  <ul className="space-y-1">
                    {visibleItems.map((item) => {
                      const active = isActive(item.href)
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                              active
                                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                            )}
                          >
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="ml-auto text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                  {sectionIndex < sidebarItems.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              )
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-muted-foreground text-center">
            Continuum AI v1.0
          </p>
        </div>
      </div>
    </aside>
  )
}
