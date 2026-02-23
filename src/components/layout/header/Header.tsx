'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './ThemeToggle'
import { ProfileDropdown } from './ProfileDropdown'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { MobileSidebar } from './MobileSidebar'

interface HeaderProps {
  userRole?: 'INDIVIDUAL' | 'PATIENT' | 'PSYCHOLOGIST'
}

export function Header({ userRole }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      {/* Mobile menu button */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[270px] p-0">
          <MobileSidebar userRole={userRole} />
        </SheetContent>
      </Sheet>

      {/* Spacer for desktop */}
      <div className="hidden lg:block" />

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <ProfileDropdown />
      </div>
    </header>
  )
}
