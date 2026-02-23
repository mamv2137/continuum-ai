/**
 * Terms and Conditions Page
 *
 * Página pública de términos y condiciones
 */

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Brain } from 'lucide-react'

export const metadata = {
  title: 'Términos y Condiciones | Continuum AI',
  description: 'Términos y condiciones de uso de Continuum AI',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Términos y Condiciones</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Última actualización: Enero 2025
          </p>
        </div>

        <Card className="p-8">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <h2>1. Aceptación de los Términos</h2>
            <p>
              Al acceder y utilizar Continuum AI ("el Servicio"), aceptas estar sujeto a estos
              Términos y Condiciones. Si no estás de acuerdo con alguna parte de estos términos,
              no podrás acceder al Servicio.
            </p>

            <h2>2. Descripción del Servicio</h2>
            <p>
              Continuum AI es una plataforma de bienestar mental que utiliza inteligencia artificial
              para facilitar check-ins de autoconocimiento basados en principios de Terapia Gestalt.
              El servicio incluye:
            </p>
            <ul>
              <li>Check-ins guiados por IA a través de WhatsApp y web</li>
              <li>Seguimiento de patrones emocionales y corporales</li>
              <li>Conexión opcional con profesionales de salud mental</li>
              <li>Dashboard personal con historial y estadísticas</li>
            </ul>

            <h2>3. Limitaciones Importantes</h2>
            <p>
              <strong>Continuum AI NO es un servicio de terapia ni sustituye la atención profesional
              de salud mental.</strong> El servicio está diseñado como una herramienta complementaria
              para el autoconocimiento y no debe utilizarse para:
            </p>
            <ul>
              <li>Diagnóstico de condiciones de salud mental</li>
              <li>Tratamiento de trastornos psicológicos</li>
              <li>Atención en situaciones de crisis o emergencia</li>
            </ul>
            <p>
              Si experimentas una crisis de salud mental, por favor contacta a servicios de
              emergencia locales o líneas de ayuda especializadas.
            </p>

            <h2>4. Privacidad y Datos Personales</h2>
            <p>
              Tu privacidad es nuestra prioridad. Consulta nuestra{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Política de Privacidad
              </Link>{' '}
              para información detallada sobre cómo recopilamos, usamos y protegemos tus datos.
            </p>
            <p>Puntos clave:</p>
            <ul>
              <li>Tus datos de salud (PHI) se almacenan de forma separada de tu información personal (PII)</li>
              <li>Utilizamos encriptación para proteger tu información</li>
              <li>Nunca vendemos tus datos a terceros</li>
              <li>Puedes exportar o eliminar tus datos en cualquier momento</li>
            </ul>

            <h2>5. Uso Aceptable</h2>
            <p>Al usar el Servicio, aceptas:</p>
            <ul>
              <li>Proporcionar información veraz y precisa</li>
              <li>No compartir tu cuenta con terceros</li>
              <li>No intentar acceder a datos de otros usuarios</li>
              <li>No usar el servicio para actividades ilegales</li>
              <li>Reportar cualquier vulnerabilidad de seguridad que descubras</li>
            </ul>

            <h2>6. Cuentas de Usuario</h2>
            <p>
              Eres responsable de mantener la confidencialidad de tu cuenta y contraseña.
              Debes notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta.
            </p>

            <h2>7. Profesionales de Salud Mental</h2>
            <p>
              Si te registras como profesional de salud mental, declaras que:
            </p>
            <ul>
              <li>Posees las credenciales y licencias necesarias para ejercer en tu jurisdicción</li>
              <li>Mantendrás la confidencialidad de la información de tus pacientes</li>
              <li>Usarás el servicio de acuerdo con los estándares éticos de tu profesión</li>
            </ul>

            <h2>8. Propiedad Intelectual</h2>
            <p>
              El Servicio y su contenido original, características y funcionalidad son propiedad
              de Continuum AI y están protegidos por leyes de propiedad intelectual.
            </p>

            <h2>9. Limitación de Responsabilidad</h2>
            <p>
              Continuum AI se proporciona "tal cual" y "según disponibilidad". No garantizamos
              que el servicio será ininterrumpido, seguro o libre de errores. En ningún caso
              seremos responsables por daños indirectos, incidentales o consecuentes.
            </p>

            <h2>10. Cambios en los Términos</h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento.
              Te notificaremos sobre cambios significativos por email o mediante un aviso
              prominente en el Servicio.
            </p>

            <h2>11. Cancelación</h2>
            <p>
              Puedes cancelar tu cuenta en cualquier momento desde la configuración de tu perfil.
              Al cancelar, tus datos serán eliminados de acuerdo con nuestra política de retención.
            </p>

            <h2>12. Ley Aplicable</h2>
            <p>
              Estos términos se regirán e interpretarán de acuerdo con las leyes de México,
              sin tener en cuenta sus disposiciones sobre conflictos de leyes.
            </p>

            <h2>13. Contacto</h2>
            <p>
              Si tienes preguntas sobre estos Términos y Condiciones, contáctanos en:{' '}
              <a href="mailto:legal@continuum.ai" className="text-primary hover:underline">
                legal@continuum.ai
              </a>
            </p>
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            <Link href="/privacy" className="hover:text-foreground underline">
              Política de Privacidad
            </Link>
            {' · '}
            <Link href="/login" className="hover:text-foreground underline">
              Iniciar Sesión
            </Link>
            {' · '}
            <Link href="/register" className="hover:text-foreground underline">
              Registrarse
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
