export type Role = 'user' | 'assistant' | 'system'

export interface ChatWithSettings {
  id: string
  userId: string
  title: string
  pinned: boolean
  archived: boolean
  model: string
  createdAt: string
  updatedAt: string
}

export interface MessageData {
  id: string
  chatId: string
  role: Role
  content: string
  tokenCount: number
  attachments?: string | null
  createdAt: string
}

export interface UserData {
  id: string
  email: string | null
  name: string | null
  avatar: string | null
  bio: string | null
  createdAt: string
  updatedAt: string
}

export interface SettingsData {
  theme: string
  language: string
  temperature: number
  topP: number
  maxTokens: number
  systemPrompt: string
  streamingMode: boolean
  notifications: boolean
  soundEnabled: boolean
  sendOnEnter: boolean
}

export interface FileData {
  id: string
  fileName: string
  storagePath: string
  mimeType: string
  fileSize: number
  createdAt: string
}

export interface Attachment {
  name: string
  type: string
  size: number
  url?: string
}

export const AI_MODELS = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Fast & efficient for everyday tasks',
    badge: 'Default',
    speed: 'Fast',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'Most capable for complex reasoning',
    badge: 'Pro',
    speed: 'Balanced',
  },
  {
    id: 'glm-4.6',
    name: 'GLM-4.6',
    description: 'General-purpose flagship model',
    badge: 'Flagship',
    speed: 'Balanced',
  },
  {
    id: 'glm-4.5-air',
    name: 'GLM-4.5 Air',
    description: 'Lightweight & lightning quick',
    badge: 'Air',
    speed: 'Ultra Fast',
  },
] as const

export const SUGGESTED_PROMPTS = [
  {
    icon: 'Sparkles',
    title: 'Write a product launch email',
    subtitle: 'for a new AI note-taking app',
  },
  {
    icon: 'Code',
    title: 'Debug this React component',
    subtitle: "that won't re-render on state change",
  },
  {
    icon: 'Lightbulb',
    title: 'Brainstorm marketing ideas',
    subtitle: 'for a sustainable fashion brand',
  },
  {
    icon: 'GraduationCap',
    title: 'Explain quantum computing',
    subtitle: "like I'm five years old",
  },
] as const
