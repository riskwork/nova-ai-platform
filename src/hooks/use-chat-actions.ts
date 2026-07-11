'use client'

import { useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { useApp } from '@/store/use-app'
import { markFreshChat } from '@/lib/fresh-chats'
import type { Attachment, MessageData } from '@/types'

/**
 * useChatActions centralizes send/regenerate/stop streaming logic so that
 * ChatInput, WelcomeScreen and message action buttons can all share it.
 */
export function useChatActions() {
  const abortRef = useRef<AbortController | null>(null)

  /** Make sure a current chat exists; create one if not. */
  const ensureChat = useCallback(async (): Promise<string> => {
    const state = useApp.getState()
    if (state.currentChatId) return state.currentChatId
    const chat = await api.createChat({ title: 'New Conversation' })
    state.addChat(chat)
    state.setCurrentChatId(chat.id)
    state.setMessages([])
    markFreshChat(chat.id)
    return chat.id
  }, [])

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    useApp.getState().setStreaming(false, null)
  }, [])

  /**
   * Send a user message + stream the AI response.
   * @param addUserMessage if false, skip adding the echoed user message
   *   (used by regenerate where the user message already exists).
   */
  const stream = useCallback(
    async (
      chatId: string,
      content: string,
      attachments?: Attachment[],
      addUserMessage = true,
    ) => {
      const controller = new AbortController()
      abortRef.current = controller
      const state = useApp.getState()
      const wasEmpty = state.messages.length < 2

      await api.streamMessage(
        { chatId, content, attachments },
        {
          onUserMessage: (msg: MessageData) => {
            if (addUserMessage) {
              useApp.getState().addMessage(msg)
            }
          },
          onAssistantStart: (id: string) => {
            useApp.getState().addMessage({
              id,
              chatId,
              role: 'assistant',
              content: '',
              tokenCount: 0,
              attachments: null,
              createdAt: new Date().toISOString(),
            })
            useApp.getState().setStreaming(true, id)
          },
          onChunk: (_delta: string, full: string) => {
            const sid = useApp.getState().streamingMessageId
            if (sid) useApp.getState().updateMessage(sid, { content: full })
          },
          onDone: (msg: MessageData) => {
            useApp.getState().updateMessage(msg.id, msg)
            useApp.getState().setStreaming(false, null)
            // The backend may auto-generate a chat title on first message;
            // refresh the chat list so the sidebar shows the new title.
            if (wasEmpty) {
              api
                .listChats()
                .then((chats) => useApp.getState().setChats(chats))
                .catch(() => {})
            }
          },
          onError: (err: Error) => {
            toast.error(err.message || 'Stream failed')
            useApp.getState().setStreaming(false, null)
          },
        },
        controller.signal,
      )
    },
    [],
  )

  const sendMessage = useCallback(
    async (content: string, attachments?: Attachment[]) => {
      const text = content.trim()
      if (!text) return
      try {
        const chatId = await ensureChat()
        await stream(chatId, text, attachments, true)
      } catch (e) {
        const msg = (e as Error)?.message || 'Failed to send message'
        toast.error(msg)
        useApp.getState().setStreaming(false, null)
      }
    },
    [ensureChat, stream],
  )

  /**
   * Regenerate an assistant message: delete it and re-stream using the
   * content of the last user message that preceded it. The new user message
   * echoed back by the SSE endpoint is skipped (addUserMessage=false) so we
   * don't duplicate it.
   */
  const regenerate = useCallback(
    async (assistantMessageId: string) => {
      const state = useApp.getState()
      const messages = state.messages
      const idx = messages.findIndex((m) => m.id === assistantMessageId)
      if (idx === -1) return
      // Find preceding user message
      let userContent = ''
      for (let i = idx - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          userContent = messages[i].content
          break
        }
      }
      if (!userContent) {
        toast.error('No preceding user message to regenerate from')
        return
      }
      const chatId = messages[idx].chatId
      try {
        // Delete the old assistant message locally + remotely
        state.removeMessage(assistantMessageId)
        await api.deleteMessage(assistantMessageId).catch(() => {})
        // Re-stream using the existing user message; regenerate=true tells the
        // server to reuse the existing user message instead of persisting a new one.
        const controller = new AbortController()
        abortRef.current = controller
        await api.streamMessage(
          { chatId, content: userContent, regenerate: true },
          {
            onUserMessage: () => {
              /* skipped: user message already in store */
            },
            onAssistantStart: (id: string) => {
              useApp.getState().addMessage({
                id,
                chatId,
                role: 'assistant',
                content: '',
                tokenCount: 0,
                attachments: null,
                createdAt: new Date().toISOString(),
              })
              useApp.getState().setStreaming(true, id)
            },
            onChunk: (_delta: string, full: string) => {
              const sid = useApp.getState().streamingMessageId
              if (sid) useApp.getState().updateMessage(sid, { content: full })
            },
            onDone: (msg: MessageData) => {
              useApp.getState().updateMessage(msg.id, msg)
              useApp.getState().setStreaming(false, null)
            },
            onError: (err: Error) => {
              toast.error(err.message || 'Regenerate failed')
              useApp.getState().setStreaming(false, null)
            },
          },
          controller.signal,
        )
      } catch (e) {
        const msg = (e as Error)?.message || 'Failed to regenerate'
        toast.error(msg)
      }
    },
    [],
  )

  return { sendMessage, stopStreaming, regenerate }
}
