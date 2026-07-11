import ZAI from 'z-ai-web-dev-sdk'

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

export async function getAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface StreamOptions {
  messages: ChatMessage[]
  temperature?: number
  topP?: number
  maxTokens?: number
  signal?: AbortSignal
}

/**
 * Stream a chat completion from the Z.ai LLM SDK.
 * Calls onChunk for each token delta and resolves with the full text.
 */
export async function streamChat(
  opts: StreamOptions,
  onChunk: (delta: string, full: string) => void
): Promise<string> {
  const zai = await getAI()

  const sdkMessages = opts.messages.map((m) => ({
    role: m.role === 'system' ? 'assistant' : m.role,
    content: m.content,
  }))

  let result: any
  try {
    result = await (zai as any).chat.completions.create({
      messages: sdkMessages,
      thinking: { type: 'disabled' },
      stream: true,
    })
  } catch (err) {
    // Retry without streaming as a fallback
    result = await (zai as any).chat.completions.create({
      messages: sdkMessages,
      thinking: { type: 'disabled' },
    })
  }

  // Case 1: SDK returned a Web ReadableStream (SSE) when stream:true worked
  if (result && typeof result.getReader === 'function') {
    return await consumeSSEStream(result, opts.signal, onChunk)
  }

  // Case 2: SDK returned an async iterable
  if (result && typeof result[Symbol.asyncIterator] === 'function') {
    let full = ''
    for await (const part of result) {
      if (opts.signal?.aborted) break
      const delta =
        part?.choices?.[0]?.delta?.content ?? part?.choices?.[0]?.message?.content ?? ''
      if (delta) {
        full += delta
        onChunk(delta, full)
      }
    }
    return full
  }

  // Case 3: Non-streamed JSON response — simulate streaming by chunking words
  const content = result?.choices?.[0]?.message?.content ?? ''
  if (!content) return ''
  let full = ''
  const tokens = content.match(/\S+\s*/g) || [content]
  for (const tk of tokens) {
    if (opts.signal?.aborted) break
    full += tk
    onChunk(tk, full)
    // tiny delay for a natural typing feel
    await new Promise((r) => setTimeout(r, 12))
  }
  return content
}

/**
 * Consume an SSE-formatted ReadableStream from the upstream API.
 * Each line is `data: {json}` and we extract choices[0].delta.content.
 */
async function consumeSSEStream(
  stream: ReadableStream<Uint8Array>,
  signal: AbortSignal | undefined,
  onChunk: (delta: string, full: string) => void
): Promise<string> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let full = ''

  try {
    while (true) {
      if (signal?.aborted) break
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // SSE events are separated by double newlines, but upstream may stream
      // line-by-line. Split on newlines and process complete `data:` lines.
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data:')) continue
        const dataStr = trimmed.slice(5).trim()
        if (dataStr === '[DONE]') {
          return full
        }
        try {
          const parsed = JSON.parse(dataStr)
          const delta =
            parsed?.choices?.[0]?.delta?.content ??
            parsed?.choices?.[0]?.message?.content ??
            ''
          if (delta) {
            full += delta
            onChunk(delta, full)
          }
        } catch {
          // ignore malformed lines
        }
      }
    }
    // flush remaining buffer
    if (buffer.trim().startsWith('data:')) {
      const dataStr = buffer.trim().slice(5).trim()
      if (dataStr && dataStr !== '[DONE]') {
        try {
          const parsed = JSON.parse(dataStr)
          const delta = parsed?.choices?.[0]?.delta?.content ?? ''
          if (delta) {
            full += delta
            onChunk(delta, full)
          }
        } catch {
          /* ignore */
        }
      }
    }
  } finally {
    try {
      reader.releaseLock()
    } catch {
      /* ignore */
    }
  }
  return full
}

/**
 * Generate a short conversation title from the first user message.
 */
export async function generateTitle(firstMessage: string): Promise<string> {
  try {
    const zai = await getAI()
    const completion: any = await (zai as any).chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content:
            'You generate extremely short conversation titles (2-5 words, no quotes, no trailing punctuation). Respond with ONLY the title text, nothing else.',
        },
        { role: 'user', content: firstMessage.slice(0, 500) },
      ],
      thinking: { type: 'disabled' },
    })
    const title = completion?.choices?.[0]?.message?.content?.trim() || ''
    return title.replace(/^["']|["']$/g, '').slice(0, 60) || 'New Conversation'
  } catch {
    return firstMessage.slice(0, 40) + (firstMessage.length > 40 ? '...' : '')
  }
}
