'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Pencil,
  Trash2,
  Bot,
  ArrowLeft,
} from 'lucide-react'
import { useApp } from '@/store/use-app'
import { api } from '@/lib/api'
import { consumeFreshChat } from '@/lib/fresh-chats'
import { AI_MODELS } from '@/types'
import { useChatActions } from '@/hooks/use-chat-actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { MessageList } from './message-list'
import { ChatInput } from './chat-input'
import { WelcomeScreen } from './welcome-screen'

interface ChatViewProps {
  /** When true, restricts the displayed chat list to pinned chats (used by Favorites panel). */
  favoritesOnly?: boolean
}

export function ChatView({ favoritesOnly }: ChatViewProps) {
  const {
    currentChatId,
    chats,
    messages,
    setMessages,
    activePanel,
    setActivePanel,
    updateChat,
    removeChat,
    setCurrentChatId,
  } = useApp()
  const { sendMessage, regenerate } = useChatActions()
  const [loading, setLoading] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)

  // If favoritesOnly and the current chat isn't pinned, fall back to welcome
  const currentChat = chats.find((c) => c.id === currentChatId)
  const effectiveChatId =
    favoritesOnly && currentChat && !currentChat.pinned
      ? null
      : currentChatId

  // Load messages whenever the effective chat changes.
  // For freshly-created chats (created locally via "New Chat" or the
  // send-when-no-chat flow), skip the server fetch — they're empty and any
  // in-flight streaming messages must not be wiped by a race with listMessages.
  useEffect(() => {
    if (!effectiveChatId) {
      setMessages([])
      return
    }
    if (consumeFreshChat(effectiveChatId)) {
      // Messages were already cleared by the creator; streaming will populate.
      return
    }
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    api
      .listMessages(effectiveChatId)
      .then((msgs) => {
        if (!cancelled) setMessages(msgs)
      })
      .catch((e) => toast.error((e as Error).message || 'Failed to load messages'))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [effectiveChatId])

  const handlePickPrompt = async (prompt: string) => {
    await sendMessage(prompt)
  }

  const handleRename = async () => {
    if (!effectiveChatId) return
    const title = renameValue.trim()
    if (!title) return
    try {
      const updated = await api.updateChat(effectiveChatId, { title })
      updateChat(effectiveChatId, { title: updated.title })
      setRenameOpen(false)
      toast.success('Chat renamed')
    } catch (e) {
      toast.error((e as Error).message || 'Failed to rename chat')
    }
  }

  const handleDelete = async () => {
    if (!effectiveChatId) return
    try {
      await api.deleteChat(effectiveChatId)
      removeChat(effectiveChatId)
      // Pick first remaining chat (or null)
      const remaining = useApp.getState().chats.filter((c) => c.id !== effectiveChatId)
      setCurrentChatId(remaining[0]?.id ?? null)
      setDeleteOpen(false)
      toast.success('Chat deleted')
    } catch (e) {
      toast.error((e as Error).message || 'Failed to delete chat')
    }
  }

  // Welcome screen when no chat selected
  if (!effectiveChatId) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-hidden">
          <WelcomeScreen onPick={handlePickPrompt} />
        </div>
        <ChatInput />
      </div>
    )
  }

  const modelMeta = AI_MODELS.find((m) => m.id === currentChat?.model)

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="glass-strong flex h-14 shrink-0 items-center justify-between gap-2 border-b px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          {favoritesOnly && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setActivePanel('chat')}
              aria-label="Back to chat"
            >
              <ArrowLeft className="size-4" />
            </Button>
          )}
          <div className="flex min-w-0 flex-col">
            <h2 className="truncate text-sm font-semibold">
              {currentChat?.title || 'New Conversation'}
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Bot className="size-3" />
              <span>{modelMeta?.name || 'Default model'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {modelMeta && (
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {modelMeta.badge}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => {
              setRenameValue(currentChat?.title || '')
              setRenameOpen(true)
            }}
            aria-label="Rename chat"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
            aria-label="Delete chat"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
            <div className="flex gap-3">
              <Skeleton className="size-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <div className="flex flex-row-reverse gap-3">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-16 w-2/3 rounded-2xl" />
            </div>
          </div>
        ) : (
          <MessageList onRegenerate={regenerate} />
        )}
      </div>

      {/* Input */}
      <ChatInput />

      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename conversation</DialogTitle>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="Conversation title"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename()
            }}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{currentChat?.title}&rdquo; and all of its messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
