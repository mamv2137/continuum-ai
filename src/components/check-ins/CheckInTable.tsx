'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useCheckIns, type CheckIn } from '@/hooks/useCheckIns'
import { CheckInDetailModal } from './CheckInDetailModal'
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  COMPLETED: { label: 'Completado', variant: 'default' },
  IN_PROGRESS: { label: 'En progreso', variant: 'secondary' },
  ABANDONED: { label: 'Abandonado', variant: 'destructive' },
}

export function CheckInTable() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null)

  const { checkIns, pagination, isLoading } = useCheckIns({
    page,
    pageSize: 10,
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-'
    const minutes = Math.floor(seconds / 60)
    return `${minutes} min`
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Tono</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Mensajes</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1) }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="COMPLETED">Completados</SelectItem>
            <SelectItem value="IN_PROGRESS">En progreso</SelectItem>
            <SelectItem value="ABANDONED">Abandonados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Tono Emocional</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Mensajes</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {checkIns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No se encontraron check-ins.
                </TableCell>
              </TableRow>
            ) : (
              checkIns.map((checkIn) => {
                const status = statusConfig[checkIn.status]
                return (
                  <TableRow key={checkIn.id}>
                    <TableCell className="font-medium">
                      {formatDate(checkIn.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="capitalize">
                      {checkIn.emotionalTone || '-'}
                    </TableCell>
                    <TableCell>{formatDuration(checkIn.duration)}</TableCell>
                    <TableCell>{checkIn.messageCount}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedCheckIn(checkIn)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(page - 1) * 10 + 1} -{' '}
            {Math.min(page * 10, pagination.total)} de {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Página {page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <CheckInDetailModal
        checkIn={selectedCheckIn}
        open={!!selectedCheckIn}
        onOpenChange={(open) => !open && setSelectedCheckIn(null)}
      />
    </div>
  )
}
