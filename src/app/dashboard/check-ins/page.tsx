import { CheckInTable } from '@/components/check-ins/CheckInTable'

export default function CheckInsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Historial de Check-ins</h1>
        <p className="text-muted-foreground">
          Revisa todos tus check-ins anteriores y su detalle
        </p>
      </div>

      <CheckInTable />
    </div>
  )
}
