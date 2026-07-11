'use client'

import { useEffect, useRef } from 'react'
import { useApp } from '@/store/use-app'
import { MessageItem } from './message-item'
import { TypingIndicator } from './typing-indicator'
import { Sparkles } from 'lucide-react'

interface MessageListProps {
  onRegenerate?: (id: string) => void
}

export function MessageList({ onRegenerate }: MessageListProps) {
  const { messages, isStreaming, streamingMessageId } = useApp()
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll to bottom on new messages / streaming chunks
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isStreaming, streamingMessageId])

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg">
          <Sparkles className="size-6" />
        </div>
        <p className="text-muted-foreground text-sm">
          Start a conversation with Nova AI
        </p>
      </div>
    )
  }

  const streamingMsg = messages.find((m) => m.id === streamingMessageId)
  const showTyping = isStreaming && (!streamingMsg || streamingMsg.content.length === 0)

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        {messages.map((m) => (
          <MessageItem
            key={m.id}
            message={m}
            isStreaming={m.id === streamingMessageId}
            onRegenerate={onRegenerate}
          />
        ))}
        {showTyping && <TypingIndicator />}
        <div ref={bottomRef} className="h-1" />
      </div>
    </div>
  )
}
