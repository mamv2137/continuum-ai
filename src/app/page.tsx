import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LandingHeader } from '@/components/landing/LandingHeader'
import {
  Brain,
  MessageCircle,
  BarChart3,
  Shield,
  Sparkles,
  ArrowRight,
  Heart,
  Users,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <LandingHeader />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            Powered by AI + Terapia Gestalt
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Tu bienestar mental,{' '}
            <span className="text-primary">entre sesiones</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
            Continuum AI te ayuda a mantener el contacto con tu bienestar emocional
            a través de check-ins guiados basados en Terapia Gestalt.
            Conecta tu cuerpo, emociones y pensamientos.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Comenzar gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/chat">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Probar demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            ¿Cómo funciona?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Check-ins por WhatsApp</h3>
              <p className="text-muted-foreground">
                Realiza check-ins guiados desde WhatsApp. Sin apps adicionales,
                sin complicaciones. Solo tú y tu proceso.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <Brain className="h-6 w-6 text-success" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Las 3 Zonas de Gestalt</h3>
              <p className="text-muted-foreground">
                Explora tu zona externa (sentidos), interna (cuerpo) y de
                fantasía (pensamientos). Encuentra tu "darse cuenta".
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                <BarChart3 className="h-6 w-6 text-warning" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Dashboard Personal</h3>
              <p className="text-muted-foreground">
                Visualiza tus patrones emocionales, tendencias corporales
                y progreso a lo largo del tiempo.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* For Who Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            ¿Para quién es?
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="p-8">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold">Para ti</h3>
              <p className="mb-4 text-muted-foreground">
                Si buscas mantener un registro de tu bienestar emocional,
                entender mejor tus patrones y tener un espacio seguro para
                la auto-reflexión.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Check-ins guiados por IA
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Historial de tus reflexiones
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Visualizaciones de tu progreso
                </li>
              </ul>
            </Card>

            <Card className="p-8">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                <Users className="h-7 w-7 text-success" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold">Para profesionales</h3>
              <p className="mb-4 text-muted-foreground">
                Si eres psicólogo o terapeuta y quieres mantener el contacto
                con tus pacientes entre sesiones.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-success" />
                  Vinculación con pacientes
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-success" />
                  Dashboard clínico
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-success" />
                  Reportes y tendencias
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <h2 className="mb-4 text-3xl font-bold">Tu privacidad es prioridad</h2>
            <p className="mb-6 text-muted-foreground">
              Separamos estrictamente tu información personal de tus datos de
              salud. Nunca vendemos tus datos. Puedes exportar o eliminar
              tu información en cualquier momento.
            </p>
            <Link href="/privacy">
              <Button variant="outline">Ver política de privacidad</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-4 text-3xl font-bold">
              Comienza tu camino hacia el bienestar
            </h2>
            <p className="mb-8 text-muted-foreground">
              Únete a Continuum AI y mantén el contacto con tu bienestar
              emocional, un check-in a la vez.
            </p>
            <Link href="/register">
              <Button size="lg">
                Crear cuenta gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                <Brain className="h-3 w-3 text-primary" />
              </div>
              <span className="text-sm font-medium">Continuum AI</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground">
                Términos
              </Link>
              <Link href="/privacy" className="hover:text-foreground">
                Privacidad
              </Link>
              <Link href="/login" className="hover:text-foreground">
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
