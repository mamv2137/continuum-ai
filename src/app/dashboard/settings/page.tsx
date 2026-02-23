'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { signOut } from '@/lib/auth-client'
import { Download, Trash2, LogOut, Bell, Moon, Globe } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/dashboard/export', {
        method: 'GET',
      })

      if (response.ok) {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json',
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `continuum-data-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting data:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch('/api/dashboard/user', {
        method: 'DELETE',
      })

      if (response.ok) {
        await signOut()
        router.push('/login')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Administra las preferencias de tu cuenta
        </p>
      </div>

      <div className="space-y-6">
        {/* Preferences */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4" />
              Preferencias
            </CardTitle>
            <CardDescription>
              Configura tu experiencia en la aplicación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Tema</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Cambia el tema de la aplicación desde el botón en el header
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Notificaciones</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Próximamente: configura recordatorios de check-ins
                </p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Próximamente
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Download className="h-4 w-4" />
              Tus Datos
            </CardTitle>
            <CardDescription>
              Exporta o elimina tus datos personales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">Exportar datos</span>
                <p className="text-xs text-muted-foreground">
                  Descarga todos tus check-ins y datos en formato JSON
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                disabled={isExporting}
              >
                {isExporting ? 'Exportando...' : 'Exportar'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Session */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LogOut className="h-4 w-4" />
              Sesión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">Cerrar sesión</span>
                <p className="text-xs text-muted-foreground">
                  Cierra tu sesión en este dispositivo
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Cerrar sesión
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-destructive">
              <Trash2 className="h-4 w-4" />
              Zona de Peligro
            </CardTitle>
            <CardDescription>
              Acciones irreversibles para tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">Eliminar cuenta</span>
                <p className="text-xs text-muted-foreground">
                  Elimina permanentemente tu cuenta y todos tus datos
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Eliminar cuenta
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminarán permanentemente
                      tu cuenta y todos tus datos, incluyendo todos tus check-ins
                      y registros de sensaciones corporales.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Eliminando...' : 'Sí, eliminar mi cuenta'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
