'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import {
  Sparkles,
  Plus,
  Search,
  MessageSquare,
  Pin,
  PinOff,
  Trash2,
  Pencil,
  Settings,
  User,
  PanelLeft,
  MoreHorizontal,
  Star,
} from 'lucide-react'
import { useApp } from '@/store/use-app'
import { api } from '@/lib/api'
import { markFreshChat } from '@/lib/fresh-chats'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { cn } from '@/lib/utils'

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const {
    user,
    chats,
    setChats,
    addChat,
    updateChat,
    removeChat,
    currentChatId,
    setCurrentChatId,
    setActivePanel,
    setMessages,
    searchQuery,
    setSearchQuery,
    exitApp,
    activePanel,
  } = useApp()

  const [creating, setCreating] = useState(false)
  const [renameTarget, setRenameTarget] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const filtered = chats.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )
  const pinned = filtered.filter((c) => c.pinned)
  const recent = filtered.filter((c) => !c.pinned)

  const handleNewChat = async () => {
    setCreating(true)
    try {
      const chat = await api.createChat({ title: 'New Conversation' })
      addChat(chat)
      setCurrentChatId(chat.id)
      setMessages([])
      markFreshChat(chat.id)
      setActivePanel('chat')
      onNavigate?.()
    } catch (e) {
      toast.error((e as Error).message || 'Failed to create chat')
    } finally {
      setCreating(false)
    }
  }

  const handleSelect = (id: string) => {
    setCurrentChatId(id)
    setActivePanel('chat')
    onNavigate?.()
  }

  const handlePin = async (id: string, pinned: boolean) => {
    try {
      const updated = await api.updateChat(id, { pinned: !pinned })
      updateChat(id, { pinned: updated.pinned })
    } catch (e) {
      toast.error((e as Error).message || 'Failed to update chat')
    }
  }

  const handleRenameSubmit = async () => {
    if (!renameTarget) return
    const title = renameValue.trim()
    if (!title) return
    try {
      const updated = await api.updateChat(renameTarget, { title })
      updateChat(renameTarget, { title: updated.title })
      setRenameTarget(null)
    } catch (e) {
      toast.error((e as Error).message || 'Failed to rename chat')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.deleteChat(deleteTarget)
      removeChat(deleteTarget)
      if (currentChatId === deleteTarget) {
        const remaining = useApp
          .getState()
          .chats.filter((c) => c.id !== deleteTarget)
        setCurrentChatId(remaining[0]?.id ?? null)
      }
      setDeleteTarget(null)
      toast.success('Chat deleted')
    } catch (e) {
      toast.error((e as Error).message || 'Failed to delete chat')
    }
  }

  const initials =
    (user?.name || 'Guest')
      .split(' ')
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'G'

  return (
    <div className="glass flex h-full w-full flex-col border-r">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3.5">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md">
            <Sparkles className="size-4" />
          </div>
          <span className="text-base font-bold text-gradient">Nova AI</span>
        </div>
        {onNavigate && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8 md:hidden"
            onClick={onNavigate}
            aria-label="Close sidebar"
          >
            <PanelLeft className="size-4" />
          </Button>
        )}
      </div>

      {/* New chat */}
      <div className="px-3">
        <Button
          onClick={handleNewChat}
          disabled={creating}
          className="w-full justify-start gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md hover:opacity-90"
        >
          <Plus className="size-4" />
          New Chat
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pt-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats…"
            className="h-9 rounded-lg bg-background/50 pl-8 text-sm"
            aria-label="Search chats"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-2">
        {filtered.length === 0 ? (
          <div className="px-3 py-10 text-center text-xs text-muted-foreground">
            {searchQuery ? 'No chats match your search' : 'No conversations yet'}
          </div>
        ) : (
          <div className="space-y-3 px-1 pt-1">
            {pinned.length > 0 && (
              <ChatSection label="Pinned">
                {pinned.map((c) => (
                  <ChatItem
                    key={c.id}
                    chat={c}
                    active={c.id === currentChatId && activePanel === 'chat'}
                    onSelect={() => handleSelect(c.id)}
                    onRename={() => {
                      setRenameTarget(c.id)
                      setRenameValue(c.title)
                    }}
                    onPin={() => handlePin(c.id, c.pinned)}
                    onDelete={() => setDeleteTarget(c.id)}
                  />
                ))}
              </ChatSection>
            )}
            {recent.length > 0 && (
              <ChatSection label="Recent">
                {recent.map((c) => (
                  <ChatItem
                    key={c.id}
                    chat={c}
                    active={c.id === currentChatId && activePanel === 'chat'}
                    onSelect={() => handleSelect(c.id)}
                    onRename={() => {
                      setRenameTarget(c.id)
                      setRenameValue(c.title)
                    }}
                    onPin={() => handlePin(c.id, c.pinned)}
                    onDelete={() => setDeleteTarget(c.id)}
                  />
                ))}
              </ChatSection>
            )}
          </div>
        )}
      </div>

      {/* Favorites shortcut */}
      <div className="px-3 pb-2">
        <Button
          variant={activePanel === 'favorites' ? 'secondary' : 'ghost'}
          className="w-full justify-start gap-2 text-sm"
          onClick={() => {
            setActivePanel('favorites')
            onNavigate?.()
          }}
        >
          <Star className="size-4" />
          Favorites
        </Button>
      </div>

      {/* User card */}
      <div className="border-t p-3">
        <div className="glass-card flex items-center gap-2.5 rounded-xl p-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">
              {user?.name || 'Guest'}
            </div>
            <div className="truncate text-[11px] text-muted-foreground">
              {user?.email || 'Not signed in'}
            </div>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-0.5 h-auto py-2 text-[11px]"
            onClick={() => {
              setActivePanel('profile')
              onNavigate?.()
            }}
            aria-label="Profile"
          >
            <User className="size-4" />
            Profile
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-0.5 h-auto py-2 text-[11px]"
            onClick={() => {
              setActivePanel('settings')
              onNavigate?.()
            }}
            aria-label="Settings"
          >
            <Settings className="size-4" />
            Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-0.5 h-auto py-2 text-[11px]"
            onClick={() => {
              exitApp()
              onNavigate?.()
            }}
            aria-label="Back to site"
          >
            <PanelLeft className="size-4" />
            Exit
          </Button>
        </div>
      </div>

      {/* Rename dialog */}
      <Dialog open={!!renameTarget} onOpenChange={(o) => !o && setRenameTarget(null)}>
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
              if (e.key === 'Enter') handleRenameSubmit()
            }}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleRenameSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the conversation and all of its messages. This action cannot be undone.
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

function ChatSection({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

interface ChatItemProps {
  chat: {
    id: string
    title: string
    pinned: boolean
    updatedAt: string
  }
  active: boolean
  onSelect: () => void
  onRename: () => void
  onPin: () => void
  onDelete: () => void
}

function ChatItem({
  chat,
  active,
  onSelect,
  onRename,
  onPin,
  onDelete,
}: ChatItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      className={cn(
        'group relative flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all',
        'hover:bg-foreground/5',
        active && 'bg-primary/10 ring-1 ring-primary/20',
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500" />
      )}
      <MessageSquare
        className={cn(
          'size-4 shrink-0',
          active ? 'text-primary' : 'text-muted-foreground',
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{chat.title}</div>
        <div className="truncate text-[10px] text-muted-foreground">
          {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
        </div>
      </div>
      {chat.pinned && <Pin className="size-3 shrink-0 text-primary" />}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
            aria-label="Chat options"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem onClick={onRename}>
            <Pencil className="size-4" /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onPin}>
            {chat.pinned ? (
              <>
                <PinOff className="size-4" /> Unpin
              </>
            ) : (
              <>
                <Pin className="size-4" /> Pin
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="size-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
