'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Zap,
  Code2,
  Paperclip,
  History,
  Layers,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

const FEATURES: Feature[] = [
  {
    icon: Zap,
    title: 'Streaming Responses',
    description:
      'Watch tokens appear in real-time as the model thinks. Smooth, low-latency streaming keeps every reply feeling instant.',
  },
  {
    icon: Code2,
    title: 'Markdown & Code',
    description:
      'Render rich markdown, syntax-highlighted code blocks, tables, and lists beautifully — out of the box.',
  },
  {
    icon: Paperclip,
    title: 'File Uploads',
    description:
      'Drop PDFs, DOCX, or images directly into the chat. Nova parses attachments and grounds answers in your files.',
  },
  {
    icon: History,
    title: 'Conversation History',
    description:
      'Every chat is saved, searchable, and resumable. Pin favorites, archive the rest, and never lose context.',
  },
  {
    icon: Layers,
    title: 'Multi-Model Support',
    description:
      'Switch between Gemini 2.5, GLM-4.6 and more mid-conversation. Pick the right engine for every task.',
  },
  {
    icon: Sparkles,
    title: 'Premium Glass UI',
    description:
      'A meticulously crafted glassmorphism interface with light/dark themes, aurora backgrounds, and silky animations.',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const card = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
}

export function Features() {
  return (
    <section id="features" className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:py-28">
      <SectionHeader
        eyebrow="Features"
        title="Everything you need to build with AI"
        subtitle="A complete conversational platform — from streaming and files to multi-model switching and a beautiful interface."
      />

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} feature={feature} />
        ))}
      </motion.div>
    </section>
  )
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon
  return (
    <motion.div
      variants={card}
      whileHover={{ y: -6 }}
      className="glass-card group relative overflow-hidden rounded-2xl p-6 transition-shadow hover:shadow-[0_0_0_1px_rgba(16,185,129,0.35),0_20px_50px_-12px_rgba(16,185,129,0.25)]"
    >
      <div className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-emerald-400/10 blur-2xl transition-opacity group-hover:opacity-100 opacity-0" />
      <div className="relative">
        <div className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-emerald-400/15 to-teal-400/15 text-emerald-500 ring-1 ring-inset ring-emerald-400/20 dark:text-emerald-300">
          <Icon className="size-5" />
        </div>
        <h3 className="mt-4 text-lg font-semibold tracking-tight">{feature.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-foreground/65">
          {feature.description}
        </p>
      </div>
    </motion.div>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
}: {
  eyebrow: string
  title: string
  subtitle?: string
  align?: 'center' | 'left'
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className={
        align === 'center'
          ? 'mx-auto max-w-2xl text-center'
          : 'max-w-2xl text-left'
      }
    >
      <span className="inline-block rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-600 ring-1 ring-inset ring-emerald-400/20 dark:text-emerald-300">
        {eyebrow}
      </span>
      <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-pretty text-base text-foreground/65 sm:text-lg">
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
