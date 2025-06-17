"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatMessage } from "@/types/chat";
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import Image from "next/image";

// --- Using your local bot.png image path ---
const BOT_AVATAR_URL = "/bot.png"; // Use the root path for Next.js public folder

// Helper component to render Markdown from the AI
function MarkdownRenderer({ content }: { content: string }) {
  const isBrowser = typeof window !== "undefined";
  const sanitizedHtml = isBrowser
    ? DOMPurify.sanitize(marked.parse(content) as string)
    : marked.parse(content);
  return (
    <div
      className="prose prose-sm dark:prose-invert prose-p:my-0 prose-ul:my-1 prose-li:my-0"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml as string }}
    />
  );
}

// --- The Main ChatBot Component ---
export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi there! How can I help you today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(false);

  // --- Using the scrolling logic that works for you ---
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Show welcome bubble after 2 seconds
    const timer = setTimeout(() => {
        if (!isOpen) setShowWelcomeBubble(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Hide the bubble when the chat is opened
  useEffect(() => {
    if (isOpen) setShowWelcomeBubble(false);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          context: { previousMessages: newMessages },
        }),
      });

      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Sorry, I seem to be having some trouble. Please try again later.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-[340px] h-[500px] flex flex-col bg-[var(--color-card)] shadow-2xl rounded-2xl border border-[var(--color-border)] overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="p-4 border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/90 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Image src={BOT_AVATAR_URL} alt="Support" width={40} height={40} className="rounded-full border-2 border-white/50" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--color-primary)]" />
                </div>
                <div>
                  <h2 className="text-md font-bold">Support Assistant</h2>
                  <p className="text-xs text-white/80">Online</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
                <ChevronDown className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex gap-3 items-start ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <Image src={BOT_AVATAR_URL} alt="Bot" width={24} height={24} className="rounded-full flex-shrink-0" />
                    )}
                    <div className={`rounded-2xl px-4 py-2.5 max-w-[85%] text-sm leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "bg-[var(--color-primary)] text-white rounded-br-none"
                        : "bg-[var(--color-card-deep)] text-[var(--color-fg)] border border-[var(--color-border)] rounded-bl-none"
                    }`}>
                      {msg.role === "assistant" ? <MarkdownRenderer content={msg.content} /> : <p>{msg.content}</p>}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 items-start justify-start">
                    <Image src={BOT_AVATAR_URL} alt="Bot" width={24} height={24} className="rounded-full flex-shrink-0" />
                    <div className="rounded-2xl px-4 py-2.5 bg-[var(--color-card-deep)] border border-[var(--color-border)]">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="h-1.5 w-1.5 bg-[var(--color-fg)] rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 bg-[var(--color-fg)] rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 bg-[var(--color-fg)] rounded-full animate-bounce" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-[var(--color-border)] bg-[var(--color-card)] flex-shrink-0">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) handleSubmit(e as any); }}
                  className="flex-1 h-10 bg-[var(--color-card-deep)] border-[var(--color-border)] focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-[var(--color-primary)]"
                />
                <Button type="submit" size="icon" disabled={!message.trim() || isLoading} className="h-10 w-10 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 flex-shrink-0">
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher Area */}
      <div className="flex flex-col items-end mt-4">
        <AnimatePresence>
          {!isOpen && showWelcomeBubble && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="mb-3 mr-2 bg-[var(--color-card)] py-2 px-4 rounded-xl shadow-lg border border-[var(--color-border)]"
            >
              <p className="text-sm text-[var(--color-fg)]">Hi! Have a question? I can help.</p>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/80 flex items-center justify-center shadow-2xl"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isOpen ? "x" : "chat"}
              initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              {isOpen ? (
                <X className="h-8 w-8 text-white" />
              ) : (
                <div className="relative flex items-center justify-center w-full h-full">
                   <Image src={BOT_AVATAR_URL} alt="Open Chat" width={64} height={64} className="w-full h-full rounded-full object-cover" />
                  <span className="absolute inset-0.5 rounded-full border-2 border-white/50 opacity-75 animate-ping" />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}