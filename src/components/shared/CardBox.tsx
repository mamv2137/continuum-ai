import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ReactNode } from 'react'

interface CardBoxProps {
  title?: string
  children: ReactNode
  className?: string
  contentClassName?: string
  action?: ReactNode
}

export function CardBox({
  title,
  children,
  className,
  contentClassName,
  action,
}: CardBoxProps) {
  return (
    <Card className={cn('shadow-sm', className)}>
      {title && (
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {action}
        </CardHeader>
      )}
      <CardContent className={cn(title ? 'pt-0' : '', contentClassName)}>
        {children}
      </CardContent>
    </Card>
  )
}
