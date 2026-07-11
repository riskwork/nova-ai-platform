import { create } from 'zustand'
import type { ChatWithSettings, MessageData, UserData, SettingsData } from '@/types'

export type AppView = 'landing' | 'dashboard'
export type PanelType = 'chat' | 'settings' | 'profile' | 'files' | 'favorites'

interface AppState {
  // View state
  view: AppView
  enterApp: () => void
  exitApp: () => void

  // User
  user: UserData | null
  setUser: (u: UserData | null) => void

  // Settings
  settings: SettingsData | null
  setSettings: (s: SettingsData | null) => void

  // Chats
  chats: ChatWithSettings[]
  setChats: (c: ChatWithSettings[]) => void
  addChat: (c: ChatWithSettings) => void
  updateChat: (id: string, patch: Partial<ChatWithSettings>) => void
  removeChat: (id: string) => void

  // Current chat
  currentChatId: string | null
  setCurrentChatId: (id: string | null) => void

  // Messages (for current chat)
  messages: MessageData[]
  setMessages: (m: MessageData[]) => void
  addMessage: (m: MessageData) => void
  updateMessage: (id: string, patch: Partial<MessageData>) => void
  removeMessage: (id: string) => void

  // Streaming state
  isStreaming: boolean
  streamingMessageId: string | null
  setStreaming: (v: boolean, id?: string | null) => void

  // Active panel
  activePanel: PanelType
  setActivePanel: (p: PanelType) => void

  // Sidebar (mobile)
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void

  // Search
  searchQuery: string
  setSearchQuery: (q: string) => void
}

export const useApp = create<AppState>((set) => ({
  view: 'landing',
  enterApp: () => set({ view: 'dashboard' }),
  exitApp: () => set({ view: 'landing' }),

  user: null,
  setUser: (u) => set({ user: u }),

  settings: null,
  setSettings: (s) => set({ settings: s }),

  chats: [],
  setChats: (c) => set({ chats: c }),
  addChat: (c) => set((s) => ({ chats: [c, ...s.chats] })),
  updateChat: (id, patch) =>
    set((s) => ({
      chats: s.chats.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    })),
  removeChat: (id) =>
    set((s) => ({
      chats: s.chats.filter((c) => c.id !== id),
      currentChatId: s.currentChatId === id ? null : s.currentChatId,
      messages: s.currentChatId === id ? [] : s.messages,
    })),

  currentChatId: null,
  setCurrentChatId: (id) => set({ currentChatId: id }),

  messages: [],
  setMessages: (m) => set({ messages: m }),
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  updateMessage: (id, patch) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),
  removeMessage: (id) =>
    set((s) => ({ messages: s.messages.filter((m) => m.id !== id) })),

  isStreaming: false,
  streamingMessageId: null,
  setStreaming: (v, id = null) =>
    set({ isStreaming: v, streamingMessageId: id }),

  activePanel: 'chat',
  setActivePanel: (p) => set({ activePanel: p }),

  sidebarOpen: false,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),

  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
}))
