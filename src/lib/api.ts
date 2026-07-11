// Client-side API helpers for Nova AI Platform.
// All endpoints are relative paths (Next.js API routes).

import type {
  ChatWithSettings,
  MessageData,
  UserData,
  SettingsData,
  FileData,
  Attachment,
} from '@/types'

async function jfetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

/* ---------- Auth ---------- */
export const api = {
  async getMe(): Promise<{ user: UserData; settings: SettingsData } | null> {
    try {
      const data = await jfetch<{ user: UserData; settings: SettingsData }>(
        '/api/auth/me'
      )
      return data
    } catch {
      return null
    }
  },

  async createGuest(): Promise<{ user: UserData; settings: SettingsData }> {
    return jfetch('/api/auth/guest', { method: 'POST' })
  },

  /* ---------- Profile ---------- */
  async updateProfile(patch: Partial<UserData>): Promise<UserData> {
    return jfetch('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(patch),
    })
  },

  /* ---------- Settings ---------- */
  async getSettings(): Promise<SettingsData> {
    return jfetch('/api/settings')
  },

  async updateSettings(patch: Partial<SettingsData>): Promise<SettingsData> {
    return jfetch('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(patch),
    })
  },

  /* ---------- Chats ---------- */
  async listChats(): Promise<ChatWithSettings[]> {
    const data = await jfetch<{ chats: ChatWithSettings[] }>('/api/chat')
    return data.chats
  },

  async createChat(input?: { title?: string; model?: string }): Promise<ChatWithSettings> {
    return jfetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify(input || {}),
    })
  },

  async updateChat(id: string, patch: Partial<ChatWithSettings>): Promise<ChatWithSettings> {
    return jfetch('/api/chat', {
      method: 'PATCH',
      body: JSON.stringify({ id, ...patch }),
    })
  },

  async deleteChat(id: string): Promise<void> {
    await jfetch(`/api/chat?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
  },

  /* ---------- Messages ---------- */
  async listMessages(chatId: string): Promise<MessageData[]> {
    const data = await jfetch<{ messages: MessageData[] }>(
      `/api/messages?chatId=${encodeURIComponent(chatId)}`
    )
    return data.messages
  },

  async deleteMessage(id: string): Promise<void> {
    await jfetch(`/api/messages?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
  },

  /* ---------- Streaming chat ---------- */
  /**
   * Send a message and stream the AI response.
   * Calls onChunk for each streamed token. Returns the final assistant text.
   */
  async streamMessage(
    input: { chatId: string; content: string; attachments?: Attachment[]; regenerate?: boolean },
    handlers: {
      onChunk: (delta: string, full: string) => void
      onUserMessage?: (msg: MessageData) => void
      onAssistantStart?: (msgId: string) => void
      onDone?: (assistantMsg: MessageData) => void
      onError?: (err: Error) => void
    },
    signal?: AbortSignal
  ): Promise<void> {
    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal,
      })
      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `Stream failed: ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        // Parse SSE events separated by \n\n
        const events = buffer.split('\n\n')
        buffer = events.pop() || ''

        for (const evt of events) {
          const lines = evt.split('\n')
          let eventType = 'message'
          let dataStr = ''
          for (const line of lines) {
            if (line.startsWith('event:')) eventType = line.slice(6).trim()
            else if (line.startsWith('data:')) dataStr += line.slice(5).trim()
          }
          if (!dataStr) continue
          try {
            const data = JSON.parse(dataStr)
            if (eventType === 'user' && handlers.onUserMessage) {
              handlers.onUserMessage(data.message)
            } else if (eventType === 'assistant_start' && handlers.onAssistantStart) {
              handlers.onAssistantStart(data.id)
            } else if (eventType === 'delta') {
              handlers.onChunk(data.delta || '', data.full || '')
            } else if (eventType === 'done' && handlers.onDone) {
              handlers.onDone(data.message)
            } else if (eventType === 'error' && handlers.onError) {
              handlers.onError(new Error(data.message || 'Stream error'))
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      handlers.onError?.(err as Error)
    }
  },

  /* ---------- Upload ---------- */
  async uploadFile(file: File): Promise<FileData> {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(text || 'Upload failed')
    }
    return res.json()
  },
}
