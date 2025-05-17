"use client"

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { WelcomeMessage } from './WelcomeMessage'
import type { ChatMessage } from '@/types/chat'

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasShownWelcome, setHasShownWelcome] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setMessage('')
    setIsLoading(true)
    setHasShownWelcome(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          context: {
            previousMessages: messages,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-28 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mb-2"
          >
            <Card className="w-[260px] sm:w-[300px] shadow-xl border-[var(--color-border)]">
              <div className="p-2 border-b flex items-center justify-between bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/80 text-white">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <h2 className="text-sm font-semibold">Assistant</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-white/20 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              <ScrollArea className="h-[280px] bg-[var(--color-card)]/50">
                <div className="flex flex-col space-y-2.5 p-3">
                  {!hasShownWelcome && <WelcomeMessage />}
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`rounded-xl px-3 py-1.5 max-w-[85%] shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/90 text-white ml-4'
                            : 'bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-fg)] mr-4'
                        }`}
                      >
                        <p className="text-xs whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="rounded-xl px-3 py-1.5 bg-[var(--color-muted)]/60 backdrop-blur-sm mr-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <form onSubmit={handleSubmit} className="p-2 border-t bg-[var(--color-card)]">
                <div className="flex gap-1.5">
                  <Input
                    placeholder="Message..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="flex-1 text-sm h-8 bg-[var(--color-card)]/80 focus-visible:ring-[var(--color-primary)]/50"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!message.trim() || isLoading}
                    className="h-8 w-8 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        className="h-10 w-10 rounded-full shadow-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/90 hover:from-[var(--color-primary)]/90 hover:to-[var(--color-primary)] transition-all hover:scale-105"
        onClick={() => setIsOpen(prev => !prev)}
      >
        <MessageSquare className="h-4.5 w-4.5" />
      </Button>
    </div>
  )
} 