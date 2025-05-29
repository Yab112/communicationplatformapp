"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Bot, User, Loader2, Sparkles, Info, Settings, MessageSquare } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { ChatService } from "@/lib/actions/chat-service"
import { marked } from "marked"
import DOMPurify from "dompurify"

interface Message {
    id: string
    content: string
    role: "user" | "assistant"
    timestamp: Date
}

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const chatService = useRef(new ChatService())

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            content: input.trim(),
            role: "user",
            timestamp: new Date(),
        }

        setMessages(prev => [...prev, userMessage])
        setInput("")
        setIsLoading(true)
        setIsTyping(true)

        try {
            const response = await chatService.current.processMessage(userMessage.content)

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: response,
                role: "assistant",
                timestamp: new Date(),
            }

            setMessages(prev => [...prev, assistantMessage])
        } catch (error) {
            console.error("Error sending message:", error)
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: "I apologize, but I'm having trouble processing your request right now. Please try again later.",
                role: "assistant",
                timestamp: new Date(),
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
            setIsTyping(false)
        }
    }

    const renderMarkdown = (content: string) => {
        const htmlContent = marked(content)
        const sanitizedHtml = DOMPurify.sanitize(htmlContent)
        return sanitizedHtml
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-[var(--color-accent)]">
            {/* Enhanced Header */}
            <div className="flex items-center justify-between p-4 border-b bg-[var(--color-card)]">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="h-12 w-12 ring-2 ring-[var(--color-primary)]">
                            <AvatarImage src="/bot-avatar.png" alt="AI Assistant" />
                            <AvatarFallback>
                                <Bot className="h-6 w-6" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-[var(--color-card)]" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-lg">AI Assistant</h2>
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">Online</p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Active</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                        <Info className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea ref={scrollRef} className="flex-1 p-4">
                <div className="space-y-4 max-w-3xl mx-auto">
                    <AnimatePresence>
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className={cn(
                                    "flex gap-3",
                                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                                )}
                            >
                                <Avatar className="h-8 w-8">
                                    {message.role === "user" ? (
                                        <AvatarFallback className="bg-[var(--color-primary)]">
                                            <User className="h-4 w-4 text-white" />
                                        </AvatarFallback>
                                    ) : (
                                        <AvatarFallback className="bg-[var(--color-primary)]">
                                            <Bot className="h-4 w-4 text-white" />
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <div
                                    className={cn(
                                        "rounded-2xl px-4 py-2 max-w-[80%] shadow-sm",
                                        message.role === "user"
                                            ? "bg-[var(--color-primary)] text-white"
                                            : "bg-[var(--color-card)]"
                                    )}
                                >
                                    {message.role === "assistant" ? (
                                        <div
                                            className="text-sm prose prose-sm dark:prose-invert max-w-none [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>li]:mt-1 [&>p]:mt-2 [&>h1]:text-xl [&>h2]:text-lg [&>h3]:text-base [&>h4]:text-sm [&>h5]:text-xs [&>h6]:text-xs [&>blockquote]:border-l-4 [&>blockquote]:pl-4 [&>blockquote]:italic [&>code]:bg-gray-100 [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded [&>pre]:bg-gray-100 [&>pre]:p-2 [&>pre]:rounded [&>pre]:overflow-x-auto"
                                            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
                                        />
                                    ) : (
                                        <p className="text-sm">{message.content}</p>
                                    )}
                                    <span className="text-xs opacity-70 mt-1 block">
                                        {message.timestamp.toLocaleTimeString()}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-3"
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-[var(--color-primary)]">
                                    <Bot className="h-4 w-4 text-white" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="rounded-2xl px-4 py-2 bg-[var(--color-card)] shadow-sm">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <div className="h-2 w-2 rounded-full bg-[var(--color-primary)] animate-bounce" />
                                        <div className="h-2 w-2 rounded-full bg-[var(--color-primary)] animate-bounce [animation-delay:0.2s]" />
                                        <div className="h-2 w-2 rounded-full bg-[var(--color-primary)] animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                    <span className="text-xs text-muted-foreground">AI is typing...</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </ScrollArea>

            {/* Enhanced Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t bg-[var(--color-card)]">
                <div className="max-w-3xl mx-auto">
                    <div className="relative flex items-center gap-2">
                        <Input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 pr-12"
                            disabled={isLoading}
                        />
                        <div className="absolute right-2 flex items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                            >
                                <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button
                                type="submit"
                                size="icon"
                                className="h-8 w-8"
                                disabled={isLoading || !input.trim()}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                        Press Enter to send, Shift + Enter for new line
                    </p>
                </div>
            </form>
        </div>
    )
} 