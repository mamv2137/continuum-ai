/**
 * Privacy Policy Page
 *
 * Página pública de política de privacidad
 */

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Brain, Shield } from 'lucide-react'

export const metadata = {
  title: 'Política de Privacidad | Continuum AI',
  description: 'Política de privacidad y protección de datos de Continuum AI',
}

export default function PrivacyPage() {
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
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Política de Privacidad</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Última actualización: Enero 2025
          </p>
        </div>

        <Card className="p-8">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <h2>1. Información que Recopilamos</h2>
            <p>
              En Continuum AI, recopilamos información para proporcionar y mejorar nuestro servicio.
              Separamos estrictamente tu información personal (PII) de tus datos de salud (PHI).
            </p>

            <h3>Información Personal (PII)</h3>
            <ul>
              <li>Nombre y correo electrónico</li>
              <li>Número de teléfono (para WhatsApp)</li>
              <li>Información de tu cuenta de Google (si usas OAuth)</li>
            </ul>

            <h3>Datos de Salud (PHI)</h3>
            <ul>
              <li>Contenido de tus check-ins y conversaciones</li>
              <li>Sensaciones corporales reportadas</li>
              <li>Tonos emocionales detectados</li>
              <li>Historial de sesiones</li>
            </ul>

            <h2>2. Cómo Usamos tu Información</h2>
            <p>Utilizamos tu información para:</p>
            <ul>
              <li>Proporcionar y mantener el servicio</li>
              <li>Personalizar tu experiencia de check-in</li>
              <li>Generar estadísticas y visualizaciones de tu progreso</li>
              <li>Mejorar nuestros algoritmos de IA</li>
              <li>Comunicarnos contigo sobre el servicio</li>
              <li>Detectar y prevenir fraudes o abusos</li>
            </ul>

            <h2>3. Compartición de Datos</h2>
            <p>
              <strong>No vendemos tus datos personales.</strong> Solo compartimos información en
              los siguientes casos:
            </p>
            <ul>
              <li>
                <strong>Con tu psicólogo:</strong> Si te vinculas con un profesional, este podrá
                ver tus check-ins y estadísticas. Tú controlas esta conexión.
              </li>
              <li>
                <strong>Proveedores de servicio:</strong> Usamos servicios de terceros (hosting,
                análisis) que procesan datos bajo acuerdos de confidencialidad.
              </li>
              <li>
                <strong>Requerimientos legales:</strong> Podemos divulgar información si la ley
                lo requiere.
              </li>
            </ul>

            <h2>4. Almacenamiento y Seguridad</h2>
            <p>Implementamos medidas de seguridad robustas:</p>
            <ul>
              <li>Encriptación en tránsito (TLS) y en reposo</li>
              <li>Separación arquitectónica entre PII y PHI</li>
              <li>Acceso restringido basado en roles</li>
              <li>Monitoreo de seguridad continuo</li>
              <li>Copias de seguridad encriptadas</li>
            </ul>
            <p>
              Tus datos se almacenan en servidores seguros. Aunque tomamos precauciones razonables,
              ningún sistema es 100% seguro.
            </p>

            <h2>5. Retención de Datos</h2>
            <p>
              Conservamos tus datos mientras mantengas una cuenta activa. Si cancelas tu cuenta:
            </p>
            <ul>
              <li>Tu información personal se elimina en 30 días</li>
              <li>Tus datos de salud se anonimizan o eliminan según tu preferencia</li>
              <li>Ciertos datos pueden retenerse para cumplimiento legal</li>
            </ul>

            <h2>6. Tus Derechos</h2>
            <p>Tienes derecho a:</p>
            <ul>
              <li>
                <strong>Acceso:</strong> Solicitar una copia de tus datos
              </li>
              <li>
                <strong>Rectificación:</strong> Corregir información inexacta
              </li>
              <li>
                <strong>Eliminación:</strong> Solicitar que eliminemos tus datos
              </li>
              <li>
                <strong>Portabilidad:</strong> Exportar tus datos en formato estándar
              </li>
              <li>
                <strong>Oposición:</strong> Objetar ciertos procesamientos
              </li>
            </ul>
            <p>
              Puedes ejercer estos derechos desde la configuración de tu cuenta o contactándonos
              directamente.
            </p>

            <h2>7. Cookies y Tecnologías Similares</h2>
            <p>Usamos cookies para:</p>
            <ul>
              <li>Mantener tu sesión iniciada</li>
              <li>Recordar tus preferencias</li>
              <li>Análisis de uso (anonimizado)</li>
            </ul>
            <p>
              Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar
              la funcionalidad del servicio.
            </p>

            <h2>8. Inteligencia Artificial</h2>
            <p>Sobre el uso de IA en nuestro servicio:</p>
            <ul>
              <li>
                Usamos modelos de lenguaje para generar respuestas en los check-ins
              </li>
              <li>
                Los datos de conversación pueden usarse para mejorar el servicio (siempre anonimizados)
              </li>
              <li>
                No usamos tus datos para entrenar modelos de terceros sin tu consentimiento explícito
              </li>
            </ul>

            <h2>9. Menores de Edad</h2>
            <p>
              Continuum AI no está diseñado para menores de 18 años. No recopilamos
              intencionalmente información de menores. Si descubrimos que hemos recopilado
              datos de un menor, los eliminaremos.
            </p>

            <h2>10. Transferencias Internacionales</h2>
            <p>
              Tus datos pueden procesarse en servidores ubicados fuera de tu país.
              Implementamos salvaguardas apropiadas para proteger tu información en
              estas transferencias.
            </p>

            <h2>11. Cambios a esta Política</h2>
            <p>
              Podemos actualizar esta política periódicamente. Te notificaremos sobre
              cambios significativos por email o mediante un aviso en el servicio.
            </p>

            <h2>12. Contacto</h2>
            <p>
              Para preguntas sobre privacidad o ejercer tus derechos, contáctanos:
            </p>
            <ul>
              <li>
                Email:{' '}
                <a href="mailto:privacy@continuum.ai" className="text-primary hover:underline">
                  privacy@continuum.ai
                </a>
              </li>
            </ul>
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            <Link href="/terms" className="hover:text-foreground underline">
              Términos y Condiciones
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
