import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { streamChat, generateTitle, type ChatMessage } from '@/lib/ai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST /api/chat/stream — send a message and stream the AI response via SSE
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await req.json().catch(() => ({}))
  const { chatId, content, attachments, regenerate } = body as {
    chatId?: string
    content?: string
    attachments?: any[]
    regenerate?: boolean
  }

  if (!chatId || !content || !content.trim()) {
    return new Response(JSON.stringify({ error: 'chatId and content are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Verify chat ownership
  const chat = await db.chat.findFirst({ where: { id: chatId, userId: user.id } })
  if (!chat) {
    return new Response(JSON.stringify({ error: 'Chat not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Load user settings
  const settings = user.settings

  // Build attachment context (text representation)
  let attachmentContext = ''
  if (attachments && attachments.length > 0) {
    attachmentContext =
      '\n\n[Attached files]\n' +
      attachments
        .map((a) => `- ${a.name} (${a.type}, ${formatBytes(a.size || 0)})`)
        .join('\n') +
      '\n'
  }

  // Persist the user message (unless this is a regenerate request, in which
  // case the preceding user message is already in the DB and we reuse it).
  let userMessage: any = null
  let msgCount = await db.message.count({ where: { chatId } })
  if (!regenerate) {
    userMessage = await db.message.create({
      data: {
        chatId,
        role: 'user',
        content: content + (attachmentContext ? '\n' + attachmentContext : ''),
        attachments: attachments ? JSON.stringify(attachments) : null,
      },
    })
    msgCount += 1
  }

  // If this is the first message, auto-generate a title
  let newTitle: string | null = null
  if (!regenerate && msgCount === 1) {
    newTitle = await generateTitle(content)
    await db.chat.update({
      where: { id: chatId },
      data: { title: newTitle, updatedAt: new Date() },
    })
  }

  // Load conversation history (last 20 messages for context)
  const history = await db.message.findMany({
    where: { chatId },
    orderBy: { createdAt: 'asc' },
    take: 20,
  })

  // Build the message array for the AI
  const aiMessages: ChatMessage[] = []
  if (settings?.systemPrompt && settings.systemPrompt.trim()) {
    aiMessages.push({ role: 'system', content: settings.systemPrompt })
  } else {
    aiMessages.push({
      role: 'system',
      content:
        'You are Nova AI, a helpful, friendly, and knowledgeable AI assistant. You provide clear, accurate, and well-structured responses. Use markdown formatting when helpful (headings, lists, code blocks, tables). Be concise but thorough.',
    })
  }
  for (const m of history) {
    aiMessages.push({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })
  }

  // Set up SSE stream
  const encoder = new TextEncoder()
  const abortController = new AbortController()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: any) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        )
      }

      // Emit the persisted user message (skip on regenerate — client already has it)
      if (userMessage) {
        send('user', {
          message: {
            id: userMessage.id,
            chatId,
            role: 'user',
            content: content,
            tokenCount: 0,
            attachments: attachments ? JSON.stringify(attachments) : null,
            createdAt: userMessage.createdAt.toISOString(),
          },
        })
      }

      // If a title was generated, inform the client
      if (newTitle) {
        send('title', { chatId, title: newTitle })
      }

      // Create a placeholder assistant message
      const assistantId = crypto.randomUUID()
      send('assistant_start', { id: assistantId })

      let fullText = ''
      try {
        fullText = await streamChat(
          {
            messages: aiMessages,
            temperature: settings?.temperature ?? 0.7,
            topP: settings?.topP ?? 0.9,
            maxTokens: settings?.maxTokens ?? 4096,
            signal: abortController.signal,
          },
          (delta, full) => {
            send('delta', { delta, full })
          }
        )

        // Fallback: if streaming produced nothing, do a non-streamed request
        if (!fullText) {
          const { getAI } = await import('@/lib/ai')
          const zai = await getAI()
          const completion = await zai.chat.completions.create({
            messages: aiMessages.map((m) => ({
              role: m.role === 'system' ? 'assistant' : m.role,
              content: m.content,
            })) as any,
            thinking: { type: 'disabled' },
          })
          fullText = (completion as any)?.choices?.[0]?.message?.content ?? ''
          if (fullText) send('delta', { delta: fullText, full: fullText })
        }

        // Persist the assistant message
        const saved = await db.message.create({
          data: {
            id: assistantId,
            chatId,
            role: 'assistant',
            content: fullText || '(no response)',
            tokenCount: Math.ceil((fullText || '').length / 4),
          },
        })

        // Update chat updatedAt
        await db.chat.update({
          where: { id: chatId },
          data: { updatedAt: new Date() },
        })

        send('done', {
          message: {
            id: saved.id,
            chatId,
            role: 'assistant',
            content: saved.content,
            tokenCount: saved.tokenCount,
            attachments: null,
            createdAt: saved.createdAt.toISOString(),
          },
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        // Still save whatever we got
        if (fullText) {
          await db.message.create({
            data: {
              id: assistantId,
              chatId,
              role: 'assistant',
              content: fullText,
              tokenCount: Math.ceil(fullText.length / 4),
            },
          })
        }
        send('error', { message: msg })
      } finally {
        controller.close()
      }
    },
    cancel() {
      abortController.abort()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
