'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { AI_MODELS } from '@/types'
import { SectionHeader } from './features'

const UPCOMING_PROVIDERS = [
  'OpenAI',
  'Claude',
  'DeepSeek',
  'Grok',
  'Mistral',
  'Llama',
] as const

const SPEED_LEVEL: Record<string, number> = {
  'Ultra Fast': 3,
  Fast: 3,
  Balanced: 2,
  Slow: 1,
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const card = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
}

export function AIModels() {
  return (
    <section
      id="models"
      className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:py-28"
    >
      <SectionHeader
        eyebrow="AI Models"
        title="Choose your AI engine"
        subtitle="Each model is tuned for a different balance of speed, reasoning, and cost. Pick the perfect match for any task."
      />

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2"
      >
        {AI_MODELS.map((model) => (
          <ModelCard key={model.id} model={model} />
        ))}
      </motion.div>

      {/* Upcoming providers */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.5 }}
        className="mt-12 flex flex-col items-center gap-4 text-center"
      >
        <p className="text-sm font-medium text-foreground/60">
          More providers coming soon
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {UPCOMING_PROVIDERS.map((provider) => (
            <span
              key={provider}
              className="glass rounded-full px-3.5 py-1.5 text-xs font-medium text-foreground/55"
            >
              {provider}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

function ModelCard({
  model,
}: {
  model: (typeof AI_MODELS)[number]
}) {
  const speedLevel = SPEED_LEVEL[model.speed] ?? 2

  return (
    <motion.div
      variants={card}
      whileHover={{ y: -4 }}
      className="glass-card group relative overflow-hidden rounded-2xl p-6 transition-shadow hover:shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_20px_50px_-12px_rgba(16,185,129,0.2)]"
    >
      <div className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-emerald-400/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-emerald-400/15 to-teal-400/15 text-emerald-500 ring-1 ring-inset ring-emerald-400/20 dark:text-emerald-300">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight">{model.name}</h3>
            <p className="text-xs text-foreground/50">{model.id}</p>
          </div>
        </div>
        <Badge className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white border-transparent">
          {model.badge}
        </Badge>
      </div>

      <p className="relative mt-4 text-sm leading-relaxed text-foreground/70">
        {model.description}
      </p>

      <div className="relative mt-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground/50">Speed</span>
          <div className="flex items-center gap-1" aria-label={`Speed: ${model.speed}`}>
            {[1, 2, 3].map((level) => (
              <span
                key={level}
                className={
                  level <= speedLevel
                    ? 'size-2 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500'
                    : 'size-2 rounded-full bg-foreground/15'
                }
              />
            ))}
            <span className="ml-2 text-xs font-medium text-foreground/70">
              {model.speed}
            </span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">
          <Check className="size-3.5" />
          Available now
        </span>
      </div>
    </motion.div>
  )
}
