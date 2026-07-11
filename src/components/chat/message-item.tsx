'use client'

import { memo, useState } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Paperclip,
} from 'lucide-react'
import type { MessageData, Attachment } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'

interface MessageItemProps {
  message: MessageData
  isStreaming?: boolean
  onRegenerate?: (id: string) => void
}

function parseAttachments(msg: MessageData): Attachment[] {
  if (!msg.attachments) return []
  try {
    const v = JSON.parse(msg.attachments as string)
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

function MessageItemBase({ message, isStreaming, onRegenerate }: MessageItemProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const attachments = parseAttachments(message)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'group flex w-full gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full shadow-md',
          isUser
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
            : 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white',
        )}
      >
        {isUser ? (
          <span className="text-xs font-semibold">You</span>
        ) : (
          <Sparkles className="size-4" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          'flex max-w-[85%] flex-col gap-1.5 sm:max-w-[75%]',
          isUser ? 'items-end' : 'items-start',
        )}
      >
        {!isUser && (
          <div className="flex items-center gap-1.5 px-1">
            <span className="text-xs font-semibold text-gradient">Nova</span>
          </div>
        )}

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1">
            {attachments.map((a, i) => (
              <div
                key={i}
                className="glass-card flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs"
              >
                <Paperclip className="size-3" />
                <span className="max-w-[160px] truncate">{a.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-tr-sm'
              : 'glass-card rounded-tl-sm text-foreground',
            isStreaming && 'stream-cursor',
          )}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
          ) : message.content ? (
            <div className="markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code(props) {
                    const { children, className, node: _node, ...rest } = props as {
                      children?: React.ReactNode
                      className?: string
                      node?: unknown
                    } & Record<string, unknown>
                    void _node
                    const match = /language-(\w+)/.exec(className || '')
                    const isBlock = !!match || String(children).includes('\n')
                    if (!isBlock) {
                      return (
                        <code className={className} {...rest}>
                          {children}
                        </code>
                      )
                    }
                    return (
                      <SyntaxHighlighter
                        language={match ? match[1] : 'text'}
                        style={oneDark as { [key: string]: React.CSSProperties }}
                        customStyle={{
                          margin: 0,
                          background: 'transparent',
                          fontSize: '0.85rem',
                        }}
                        wrapLongLines
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    )
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <span className="text-muted-foreground italic">…</span>
          )}
        </div>

        {/* Actions */}
        <div
          className={cn(
            'flex items-center gap-1 px-1 text-xs text-muted-foreground',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            isUser ? 'flex-row-reverse' : 'flex-row',
          )}
        >
          <span suppressHydrationWarning>
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={handleCopy}
            aria-label="Copy message"
          >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          </Button>
          {!isUser && onRegenerate && !isStreaming && (
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => onRegenerate(message.id)}
              aria-label="Regenerate response"
            >
              <RefreshCw className="size-3" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export const MessageItem = memo(MessageItemBase)
