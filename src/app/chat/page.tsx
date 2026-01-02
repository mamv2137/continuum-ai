'use client'

/**
 * Chat Testing Page
 *
 * UI para probar el bot de Gestalt sin usar WhatsApp.
 * Solo disponible en desarrollo.
 */

import { useState, useRef, useEffect } from 'react'
import { Send, RotateCcw, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
