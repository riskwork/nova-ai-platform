'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { Menu, Plus, Bot } from 'lucide-react'
import { useApp } from '@/store/use-app'
import { api } from '@/lib/api'
import { markFreshChat } from '@/lib/fresh-chats'
import { AI_MODELS, type SettingsData, type UserData } from '@/types'
import { Sidebar } from './sidebar'
import { ThemeToggle } from './theme-toggle'
import { ChatView } from '@/components/chat/chat-view'
import { SettingsPanel } from './settings-panel'
import { ProfilePanel } from './profile-panel'
import { FilesPanel } from './files-panel'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const FALLBACK_SETTINGS: SettingsData = {
  theme: 'dark',
  language: 'en',
  temperature: 0.7,
  topP: 1,
  maxTokens: 2048,
  systemPrompt: '',
  streamingMode: true,
  notifications: true,
  soundEnabled: false,
  sendOnEnter: true,
}

const FALLBACK_USER: UserData = {
  id: 'guest',
  email: null,
  name: 'Guest',
  avatar: null,
  bio: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export default function Dashboard() {
  const {
    user,
    settings,
    setUser,
    setSettings,
    setChats,
    activePanel,
    sidebarOpen,
    setSidebarOpen,
    currentChatId,
    chats,
    addChat,
    setCurrentChatId,
    setMessages,
    setActivePanel,
    updateChat,
  } = useApp()
  const { setTheme } = useTheme()
  const [loading, setLoading] = useState(true)

  // Initial data loading
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        let me = await api.getMe()
        if (!me) {
          me = await api.createGuest()
        }
        if (cancelled) return
        setUser(me.user)
        setSettings(me.settings)
        try {
          const chats = await api.listChats()
          if (!cancelled) setChats(chats)
        } catch {
          /* ignore chat list errors */
        }
      } catch (e) {
        // API isn't available yet (e.g. routes not wired). Fall back to a
        // minimal local guest so the UI remains usable.
        if (cancelled) return
        setUser(FALLBACK_USER)
        setSettings(FALLBACK_SETTINGS)
        toast.error(
          (e as Error)?.message ||
            'Could not reach the server — running in offline mode',
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [setUser, setSettings, setChats])

  // Apply theme from settings
  useEffect(() => {
    if (settings?.theme) setTheme(settings.theme)
  }, [settings?.theme, setTheme])

  if (loading || !user || !settings) {
    return <DashboardSkeleton />
  }

  const handleNewChat = async () => {
    try {
      const chat = await api.createChat({ title: 'New Conversation' })
      addChat(chat)
      setCurrentChatId(chat.id)
      setMessages([])
      markFreshChat(chat.id)
      setActivePanel('chat')
      setSidebarOpen(false)
    } catch (e) {
      toast.error((e as Error).message || 'Failed to create chat')
    }
  }

  const handleModelChange = async (model: string) => {
    if (!currentChatId) return
    try {
      const updated = await api.updateChat(currentChatId, { model })
      updateChat(currentChatId, { model: updated.model })
    } catch (e) {
      toast.error((e as Error).message || 'Failed to change model')
    }
  }

  const currentChat = chats.find((c) => c.id === currentChatId)
  const selectedModel = currentChat?.model || AI_MODELS[0].id
  const chatTitle = currentChat?.title || 'New Conversation'

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-background">
      {/* Ambient aurora accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="aurora bg-primary/15 w-[480px] h-[480px] -top-32 -left-20" />
        <div className="aurora bg-chart-2/15 w-[420px] h-[420px] bottom-0 right-0" />
      </div>

      {/* Desktop sidebar */}
      <aside className="relative z-10 hidden h-full w-[280px] shrink-0 md:block">
        <Sidebar />
      </aside>

      {/* Mobile sidebar (Sheet) */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-[280px] p-0 border-r">
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main column */}
      <main className="relative z-10 flex h-full min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="glass-strong sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b px-2 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="size-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold sm:text-base">
                {activePanel === 'settings'
                  ? 'Settings'
                  : activePanel === 'profile'
                    ? 'Profile'
                    : activePanel === 'files'
                      ? 'Files'
                      : activePanel === 'favorites'
                        ? 'Favorites'
                        : chatTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {activePanel === 'chat' && (
              <Select value={selectedModel} onValueChange={handleModelChange}>
                <SelectTrigger
                  size="sm"
                  className="h-8 gap-1.5 rounded-full border-0 bg-foreground/5 px-2.5 text-xs hover:bg-foreground/10"
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
            )}
            <ThemeToggle />
            <Button
              size="sm"
              onClick={handleNewChat}
              className="hidden sm:inline-flex bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md hover:opacity-90"
            >
              <Plus className="size-4" /> New Chat
            </Button>
            <Button
              size="icon"
              onClick={handleNewChat}
              className="size-9 sm:hidden bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md hover:opacity-90"
              aria-label="New chat"
            >
              <Plus className="size-5" />
            </Button>
          </div>
        </header>

        {/* Panel content */}
        <div className="flex-1 overflow-hidden">
          {activePanel === 'chat' && <ChatView />}
          {activePanel === 'favorites' && <ChatView favoritesOnly />}
          {activePanel === 'settings' && <SettingsPanel />}
          {activePanel === 'profile' && <ProfilePanel />}
          {activePanel === 'files' && <FilesPanel />}
        </div>
      </main>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-background">
      <div className="hidden h-full w-[280px] shrink-0 flex-col gap-3 border-r p-3 md:flex">
        <div className="h-8 w-32 rounded-lg bg-accent animate-pulse" />
        <div className="h-9 w-full rounded-lg bg-accent animate-pulse" />
        <div className="h-9 w-full rounded-lg bg-accent animate-pulse" />
        <div className="mt-2 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 w-full rounded-lg bg-accent animate-pulse" />
          ))}
        </div>
      </div>
      <div className="flex h-full flex-1 flex-col">
        <div className="h-14 border-b bg-accent/30 animate-pulse" />
        <div className="flex-1 space-y-4 p-6">
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="h-20 w-2/3 rounded-2xl bg-accent animate-pulse" />
            <div className="ml-auto h-16 w-1/2 rounded-2xl bg-accent animate-pulse" />
            <div className="h-24 w-3/4 rounded-2xl bg-accent animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
