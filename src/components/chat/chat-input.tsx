'use client'

import { useRef, useState, type KeyboardEvent } from 'react'
import { Send, Square, Paperclip, X, Bot } from 'lucide-react'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useApp } from '@/store/use-app'
import { useChatActions } from '@/hooks/use-chat-actions'
import { api } from '@/lib/api'
import { AI_MODELS, type Attachment, type FileData } from '@/types'
import { cn } from '@/lib/utils'

export function ChatInput() {
  const {
    settings,
    isStreaming,
    currentChatId,
    chats,
    updateChat,
  } = useApp()
  const { sendMessage, stopStreaming } = useChatActions()
  const [value, setValue] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const currentChat = chats.find((c) => c.id === currentChatId)
  const selectedModel = currentChat?.model || AI_MODELS[0].id

  const canSend = value.trim().length > 0 && !isStreaming

  const handleSend = async () => {
    if (!canSend) return
    const text = value
    const atts = attachments
    setValue('')
    setAttachments([])
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    await sendMessage(text, atts.length > 0 ? atts : undefined)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      const sendOnEnter = settings?.sendOnEnter ?? true
      if (sendOnEnter && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
      if (!sendOnEnter && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleSend()
      }
    }
  }

  const autoGrow = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploading(true)
    try {
      const uploaded: FileData[] = []
      for (const file of files) {
        const data = await api.uploadFile(file)
        uploaded.push(data)
      }
      const newAtts: Attachment[] = uploaded.map((f) => ({
        name: f.fileName,
        type: f.mimeType,
        size: f.fileSize,
        url: f.storagePath,
      }))
      setAttachments((prev) => [...prev, ...newAtts])
    } catch (err) {
      toast.error((err as Error).message || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleModelChange = async (model: string) => {
    if (!currentChatId) return
    try {
      const updated = await api.updateChat(currentChatId, { model })
      updateChat(currentChatId, { model: updated.model })
    } catch (err) {
      toast.error((err as Error).message || 'Failed to change model')
    }
  }

  return (
    <div className="px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="mx-auto w-full max-w-3xl">
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachments.map((a, i) => (
              <div
                key={i}
                className="glass-card flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs"
              >
                <Paperclip className="size-3" />
                <span className="max-w-[160px] truncate">{a.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                  className="ml-1 rounded-sm hover:bg-foreground/10 p-0.5"
                  aria-label="Remove attachment"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="glass rounded-3xl p-2.5 shadow-lg">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              autoGrow()
            }}
            onKeyDown={handleKeyDown}
            placeholder="Message Nova AI…"
            disabled={isStreaming}
            rows={1}
            className={cn(
              'min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 px-2 py-2 text-[15px]',
              'placeholder:text-muted-foreground/70',
            )}
            aria-label="Message input"
          />

          <div className="flex items-center justify-between gap-2 px-1 pt-1.5">
            <div className="flex items-center gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
                aria-label="Attach files"
              />
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || isStreaming}
                aria-label="Attach files"
              >
                <Paperclip className="size-4" />
              </Button>

              <Select value={selectedModel} onValueChange={handleModelChange}>
                <SelectTrigger
                  size="sm"
                  className="h-8 gap-1.5 rounded-full border-0 bg-transparent px-2 text-xs hover:bg-foreground/5"
                  aria-label="Select AI model"
                >
                  <Bot className="size-3.5 text-primary" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{m.name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {m.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isStreaming ? (
              <Button
                size="icon"
                onClick={stopStreaming}
                className="size-9 rounded-full bg-destructive text-white hover:bg-destructive/90"
                aria-label="Stop generating"
              >
                <Square className="size-4" fill="currentColor" />
              </Button>
            ) : (
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!canSend}
                className="size-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md hover:opacity-90 disabled:opacity-40"
                aria-label="Send message"
              >
                <Send className="size-4" />
              </Button>
            )}
          </div>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
          Nova AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  )
}
