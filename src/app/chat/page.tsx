'use client'

/**
 * Chat Testing Page
 *
 * UI para probar el bot de Gestalt sin usar WhatsApp.
 * Solo disponible en desarrollo.
 */

import { useState, useRef, useEffect } from 'react'
import { Send, RotateCcw, Bot, User, UserCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

type UserInfo = {
  user: {
    id: string
    phoneNumber: string
    email: string | null
    name: string | null
    role: string
    licenseNumber: string | null
    psychologistCode: string | null
    notificationsEnabled: boolean
    onboardingDone: boolean
    onboardingStep: string | null
    termsAccepted: boolean
    termsAcceptedAt: string | null
    hasPsychologist: boolean
    psychologistName: string | null
    psychologistContact: string | null
    emergencyContactName: string | null
    emergencyContactPhone: string | null
    previousTherapyExperience: boolean
    timezone: string
    preferredLanguage: string
    createdAt: string
    updatedAt: string
  }
  psychologist: {
    id: string
    name: string | null
    phoneNumber: string
    psychologistCode: string | null
  } | null
  patients: Array<{
    id: string
    name: string | null
    phoneNumber: string
    lastCheckInAt: string | null
    totalCheckIns: number
  }>
  checkIns: Array<{
    id: string
    status: string
    emotionalTone: string | null
    aiInsight: string | null
    messageCount: number
    duration: number | null
    completionRate: number | null
    externalZone: string | null
    fantasyZone: string | null
    bodySensations: Array<{
      bodyPart: string
      sensationType: string
      intensity: number | null
      description: string | null
    }>
    createdAt: string
    completedAt: string | null
  }>
  stats: {
    totalCheckIns: number
    completedCheckIns: number
    inProgressCheckIns: number
    abandonedCheckIns: number
    lastCheckInAt: string | null
    emotionalTones: Record<string, number>
    bodyParts: Record<string, number>
  }
}

type Message = {
  id: string
  role: 'user' | 'bot'
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('+5491121913619')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [userInfoOpen, setUserInfoOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [userInfoLoading, setUserInfoLoading] = useState(false)
  const [userInfoError, setUserInfoError] = useState<string | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchUserInfo = async () => {
    setUserInfoLoading(true)
    setUserInfoError(null)

    try {
      const response = await fetch(`/api/chat/user-info?phoneNumber=${encodeURIComponent(phoneNumber)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener información')
      }

      setUserInfo(data.data)
    } catch (err) {
      setUserInfoError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setUserInfoLoading(false)
    }
  }

  const handleOpenUserInfo = (open: boolean) => {
    setUserInfoOpen(open)
    if (open) {
      fetchUserInfo()
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          message: input,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar mensaje')
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: data.data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  const resetConversation = async () => {
    if (!confirm('¿Seguro que quieres resetear la conversación?')) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al resetear conversación')
      }

      setMessages([])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="max-w-5xl mx-auto h-[calc(100vh-2rem)]">
        <Card className="h-full flex flex-col shadow-2xl">
          {/* Header */}
          <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Chat de Prueba</CardTitle>
                  <CardDescription className="text-blue-100">
                    Bot de Gestalt - Modo Testing
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Teléfono:
                  </label>
                  <Input
                    id="phone"
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-48 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    placeholder="+5491121913619"
                  />
                </div>

                <Dialog open={userInfoOpen} onOpenChange={handleOpenUserInfo}>
                  <DialogTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-2 bg-white/20 hover:bg-white/30 text-white border-0"
                    >
                      <UserCircle className="w-4 h-4" />
                      Ver Usuario
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                      <DialogTitle>Información del Usuario</DialogTitle>
                      <DialogDescription>
                        Datos detallados del usuario {phoneNumber}
                      </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="flex-1 pr-4">
                      {userInfoLoading && (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                      )}

                      {userInfoError && (
                        <div className="py-8 text-center">
                          <p className="text-red-500">{userInfoError}</p>
                        </div>
                      )}

                      {userInfo && !userInfoLoading && (
                        <div className="space-y-6">
                          {/* Info básica */}
                          <section>
                            <h3 className="font-semibold text-lg mb-3 border-b pb-2">Datos Básicos</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div><span className="text-muted-foreground">ID:</span> <code className="text-xs bg-slate-100 px-1 rounded">{userInfo.user.id}</code></div>
                              <div><span className="text-muted-foreground">Teléfono:</span> {userInfo.user.phoneNumber}</div>
                              <div><span className="text-muted-foreground">Nombre:</span> {userInfo.user.name || '-'}</div>
                              <div><span className="text-muted-foreground">Email:</span> {userInfo.user.email || '-'}</div>
                              <div><span className="text-muted-foreground">Rol:</span> <span className={cn(
                                'px-2 py-0.5 rounded text-xs font-medium',
                                userInfo.user.role === 'PSYCHOLOGIST' && 'bg-purple-100 text-purple-700',
                                userInfo.user.role === 'INDIVIDUAL' && 'bg-blue-100 text-blue-700',
                                userInfo.user.role === 'PATIENT' && 'bg-green-100 text-green-700'
                              )}>{userInfo.user.role}</span></div>
                              <div><span className="text-muted-foreground">Idioma:</span> {userInfo.user.preferredLanguage}</div>
                              <div><span className="text-muted-foreground">Timezone:</span> {userInfo.user.timezone}</div>
                              <div><span className="text-muted-foreground">Creado:</span> {new Date(userInfo.user.createdAt).toLocaleString('es-AR')}</div>
                            </div>
                          </section>

                          {/* Onboarding */}
                          <section>
                            <h3 className="font-semibold text-lg mb-3 border-b pb-2">Onboarding</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div><span className="text-muted-foreground">Completado:</span> {userInfo.user.onboardingDone ? '✅ Sí' : '❌ No'}</div>
                              <div><span className="text-muted-foreground">Step actual:</span> <code className="text-xs bg-slate-100 px-1 rounded">{userInfo.user.onboardingStep || 'N/A'}</code></div>
                              <div><span className="text-muted-foreground">Términos aceptados:</span> {userInfo.user.termsAccepted ? '✅ Sí' : '❌ No'}</div>
                              <div><span className="text-muted-foreground">Fecha términos:</span> {userInfo.user.termsAcceptedAt ? new Date(userInfo.user.termsAcceptedAt).toLocaleString('es-AR') : '-'}</div>
                            </div>
                          </section>

                          {/* Info de psicólogo (si aplica) */}
                          {userInfo.user.role === 'PSYCHOLOGIST' && (
                            <section>
                              <h3 className="font-semibold text-lg mb-3 border-b pb-2">Datos de Psicólogo</h3>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div><span className="text-muted-foreground">Cédula:</span> {userInfo.user.licenseNumber || '-'}</div>
                                <div><span className="text-muted-foreground">Código:</span> <code className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-mono">{userInfo.user.psychologistCode || '-'}</code></div>
                                <div><span className="text-muted-foreground">Notificaciones:</span> {userInfo.user.notificationsEnabled ? '✅ Activadas' : '❌ Desactivadas'}</div>
                                <div><span className="text-muted-foreground">Pacientes:</span> {userInfo.patients.length}</div>
                              </div>
                              {userInfo.patients.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-sm text-muted-foreground mb-2">Pacientes vinculados:</p>
                                  <div className="space-y-1">
                                    {userInfo.patients.map((p) => (
                                      <div key={p.id} className="text-sm bg-slate-50 p-2 rounded flex justify-between">
                                        <span>{p.name || 'Sin nombre'} ({p.phoneNumber})</span>
                                        <span className="text-muted-foreground">{p.totalCheckIns} check-ins</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </section>
                          )}

                          {/* Psicólogo vinculado (si aplica) */}
                          {userInfo.user.hasPsychologist && (
                            <section>
                              <h3 className="font-semibold text-lg mb-3 border-b pb-2">Psicólogo</h3>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                {userInfo.psychologist ? (
                                  <>
                                    <div><span className="text-muted-foreground">Nombre:</span> {userInfo.psychologist.name}</div>
                                    <div><span className="text-muted-foreground">Teléfono:</span> {userInfo.psychologist.phoneNumber}</div>
                                    <div className="col-span-2"><span className="text-muted-foreground">Estado:</span> <span className="text-green-600">✅ Vinculado en Continuum</span></div>
                                  </>
                                ) : (
                                  <>
                                    <div><span className="text-muted-foreground">Nombre:</span> {userInfo.user.psychologistName || '-'}</div>
                                    <div><span className="text-muted-foreground">Contacto:</span> {userInfo.user.psychologistContact || '-'}</div>
                                    <div className="col-span-2"><span className="text-muted-foreground">Estado:</span> <span className="text-yellow-600">⚠️ Externo (no en Continuum)</span></div>
                                  </>
                                )}
                              </div>
                            </section>
                          )}

                          {/* Contacto de emergencia */}
                          {(userInfo.user.emergencyContactName || userInfo.user.emergencyContactPhone) && (
                            <section>
                              <h3 className="font-semibold text-lg mb-3 border-b pb-2">Contacto de Emergencia</h3>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div><span className="text-muted-foreground">Nombre:</span> {userInfo.user.emergencyContactName || '-'}</div>
                                <div><span className="text-muted-foreground">Teléfono:</span> {userInfo.user.emergencyContactPhone || '-'}</div>
                              </div>
                            </section>
                          )}

                          {/* Estadísticas */}
                          <section>
                            <h3 className="font-semibold text-lg mb-3 border-b pb-2">Estadísticas</h3>
                            <div className="grid grid-cols-4 gap-3">
                              <div className="bg-blue-50 p-3 rounded-lg text-center">
                                <p className="text-2xl font-bold text-blue-600">{userInfo.stats.totalCheckIns}</p>
                                <p className="text-xs text-muted-foreground">Total Check-ins</p>
                              </div>
                              <div className="bg-green-50 p-3 rounded-lg text-center">
                                <p className="text-2xl font-bold text-green-600">{userInfo.stats.completedCheckIns}</p>
                                <p className="text-xs text-muted-foreground">Completados</p>
                              </div>
                              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                                <p className="text-2xl font-bold text-yellow-600">{userInfo.stats.inProgressCheckIns}</p>
                                <p className="text-xs text-muted-foreground">En Progreso</p>
                              </div>
                              <div className="bg-red-50 p-3 rounded-lg text-center">
                                <p className="text-2xl font-bold text-red-600">{userInfo.stats.abandonedCheckIns}</p>
                                <p className="text-xs text-muted-foreground">Abandonados</p>
                              </div>
                            </div>

                            {Object.keys(userInfo.stats.emotionalTones).length > 0 && (
                              <div className="mt-4">
                                <p className="text-sm text-muted-foreground mb-2">Tonos emocionales:</p>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(userInfo.stats.emotionalTones)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([tone, count]) => (
                                      <span key={tone} className="px-2 py-1 bg-slate-100 rounded text-sm">
                                        {tone} <span className="text-muted-foreground">({count})</span>
                                      </span>
                                    ))}
                                </div>
                              </div>
                            )}

                            {Object.keys(userInfo.stats.bodyParts).length > 0 && (
                              <div className="mt-4">
                                <p className="text-sm text-muted-foreground mb-2">Partes del cuerpo mencionadas:</p>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(userInfo.stats.bodyParts)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([part, count]) => (
                                      <span key={part} className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-sm">
                                        {part} <span className="opacity-70">({count})</span>
                                      </span>
                                    ))}
                                </div>
                              </div>
                            )}
                          </section>

                          {/* Check-ins recientes con insights */}
                          {userInfo.checkIns.length > 0 && (
                            <section>
                              <h3 className="font-semibold text-lg mb-3 border-b pb-2">Check-ins Recientes (últimos 10)</h3>
                              <div className="space-y-3">
                                {userInfo.checkIns.map((checkIn) => (
                                  <div key={checkIn.id} className="border rounded-lg p-3 text-sm">
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className={cn(
                                          'px-2 py-0.5 rounded text-xs font-medium',
                                          checkIn.status === 'COMPLETED' && 'bg-green-100 text-green-700',
                                          checkIn.status === 'IN_PROGRESS' && 'bg-yellow-100 text-yellow-700',
                                          checkIn.status === 'ABANDONED' && 'bg-red-100 text-red-700'
                                        )}>{checkIn.status}</span>
                                        {checkIn.emotionalTone && (
                                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                                            {checkIn.emotionalTone}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-muted-foreground text-xs">
                                        {new Date(checkIn.createdAt).toLocaleString('es-AR')}
                                      </span>
                                    </div>

                                    {checkIn.aiInsight && (
                                      <div className="bg-purple-50 border border-purple-100 rounded p-2 mb-2">
                                        <p className="text-xs text-purple-600 font-medium mb-1">AI Insight:</p>
                                        <p className="text-sm text-purple-800">{checkIn.aiInsight}</p>
                                      </div>
                                    )}

                                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                                      <div>Mensajes: {checkIn.messageCount}</div>
                                      <div>Duración: {checkIn.duration ? `${Math.round(checkIn.duration / 60)}min` : '-'}</div>
                                      <div>Completitud: {checkIn.completionRate ? `${checkIn.completionRate}%` : '-'}</div>
                                    </div>

                                    {checkIn.bodySensations.length > 0 && (
                                      <div className="mt-2 flex flex-wrap gap-1">
                                        {checkIn.bodySensations.map((s, i) => (
                                          <span key={i} className="px-1.5 py-0.5 bg-orange-50 text-orange-700 rounded text-xs">
                                            {s.bodyPart}: {s.sensationType} {s.intensity && `(${s.intensity}/10)`}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </section>
                          )}
                        </div>
                      )}
                    </ScrollArea>
                  </DialogContent>
                </Dialog>

                <Button
                  onClick={resetConversation}
                  disabled={isLoading}
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Resetear
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full p-6">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                  <Bot className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-lg font-medium">Envía un mensaje para empezar</p>
                  <p className="text-sm mt-2">
                    Prueba el bot de Gestalt sin usar WhatsApp
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-3 items-start',
                      message.role === 'user' && 'flex-row-reverse'
                    )}
                  >
                    <div
                      className={cn(
                        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                      )}
                    >
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>

                    <div
                      className={cn(
                        'flex-1 max-w-2xl',
                        message.role === 'user' && 'flex justify-end'
                      )}
                    >
                      <div
                        className={cn(
                          'rounded-2xl px-4 py-3 shadow-sm',
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                        )}
                      >
                        <p className="text-sm font-medium mb-1 opacity-75">
                          {message.role === 'user' ? 'Tú' : 'Bot'}
                        </p>
                        <p className="whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </p>
                        <p className="text-xs mt-2 opacity-60">
                          {message.timestamp.toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                    </div>
                    <div className="flex-1 max-w-2xl">
                      <div className="rounded-2xl px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex gap-2 items-center">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>

          {/* Error */}
          {error && (
            <div className="px-6 py-3 bg-red-50 dark:bg-red-950/50 border-t border-red-200 dark:border-red-900">
              <p className="text-sm text-red-600 dark:text-red-400">❌ {error}</p>
            </div>
          )}

          {/* Input */}
          <div className="border-t bg-slate-50 dark:bg-slate-900 p-4 rounded-b-xl">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Escribe un mensaje... (Enter para enviar, Shift+Enter para nueva línea)"
                className="flex-1 min-h-[60px] max-h-32 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800"
                rows={2}
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                size="lg"
                className="self-end gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
                Enviar
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
