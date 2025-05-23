"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Send, Paperclip, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useChat } from "@/hooks/use-chat"
import { EmojiPicker } from "@/components/chat/emoji-picker"
import { FileUpload } from "@/components/chat/file-upload"

interface MessageInputProps {
  roomId: string
  onSendMessage: (content: string, file?: File) => Promise<{ success: boolean; message: any } | undefined>
}

export function MessageInput({ roomId, onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { startTyping, stopTyping } = useChat(roomId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() && !selectedFile) return

    try {
      const result = await onSendMessage(message, selectedFile || undefined)
      if (result?.success) {
        setMessage("")
        setSelectedFile(null)
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji)
    setIsEmojiPickerOpen(false)
    inputRef.current?.focus()
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setIsFileUploadOpen(false)
  }

  return (
    <div className="border-t border-[var(--color-border)] p-4">
      {selectedFile && (
        <div className="mb-2 flex items-center gap-2 rounded-md bg-muted p-2">
          <span className="text-sm">{selectedFile.name}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setSelectedFile(null)}
          >
            ×
          </Button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => startTyping()}
            onBlur={() => stopTyping()}
            placeholder="Type a message..."
            className="pr-20"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
            >
              <Smile className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsFileUploadOpen(!isFileUploadOpen)}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button type="submit" size="icon" disabled={!message.trim() && !selectedFile}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
      {isEmojiPickerOpen && (
        <div className="absolute bottom-20 right-4">
          <EmojiPicker onSelect={handleEmojiSelect} />
        </div>
      )}
      {isFileUploadOpen && (
        <div className="absolute bottom-20 right-4">
          <FileUpload onSelect={handleFileSelect} />
        </div>
      )}
    </div>
  )
}
