'use client'

import { Sparkles } from 'lucide-react'

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md">
        <Sparkles className="size-4" />
      </div>
      <div className="glass-card rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="typing-dot size-2 rounded-full bg-primary/70 inline-block" />
        <span className="typing-dot size-2 rounded-full bg-primary/70 inline-block" />
        <span className="typing-dot size-2 rounded-full bg-primary/70 inline-block" />
      </div>
    </div>
  )
}
