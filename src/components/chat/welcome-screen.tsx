'use client'

import { motion } from 'framer-motion'
import {
  Sparkles,
  Code,
  Lightbulb,
  GraduationCap,
  ArrowRight,
} from 'lucide-react'
import { SUGGESTED_PROMPTS } from '@/types'
import { cn } from '@/lib/utils'

const ICONS: Record<string, typeof Sparkles> = {
  Sparkles,
  Code,
  Lightbulb,
  GraduationCap,
}

interface WelcomeScreenProps {
  onPick: (prompt: string) => void
}

export function WelcomeScreen({ onPick }: WelcomeScreenProps) {
  const pick = (subtitle: string, title: string) => {
    // Combine title + subtitle into a single prompt for the AI
    const prompt = `${title} ${subtitle}`.trim()
    onPick(prompt)
  }

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-y-auto scrollbar-thin px-4 py-10">
      {/* Aurora accents */}
      <div className="aurora bg-primary/30 w-[500px] h-[500px] -top-32 left-1/4" />
      <div className="aurora bg-chart-2/20 w-[400px] h-[400px] bottom-0 right-1/4" />

      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col items-center gap-5 text-center"
      >
        <div className="relative flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-white shadow-2xl glow-primary">
          <Sparkles className="size-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How can I help you{' '}
            <span className="text-gradient">today?</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
            Ask anything, draft documents, write code, brainstorm ideas — Nova AI is ready when you are.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
        }}
        className="relative mt-10 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {SUGGESTED_PROMPTS.map((p, i) => {
          const Icon = ICONS[p.icon] || Sparkles
          return (
            <motion.button
              key={i}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ y: -2 }}
              onClick={() => pick(p.subtitle, p.title)}
              className={cn(
                'group glass-card rounded-2xl p-4 text-left transition-all',
                'hover:glow-primary hover:border-primary/30',
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm">{p.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {p.subtitle}
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}
