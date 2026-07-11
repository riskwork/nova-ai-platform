'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Sparkles, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useApp } from '@/store/use-app'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
}
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

export function Hero() {
  const enterApp = useApp((s) => s.enterApp)

  return (
    <section
      id="top"
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 pt-28 pb-16 sm:pt-32"
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div
          className="aurora left-[-10%] top-[-5%] size-[40rem] bg-emerald-400/50"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="aurora right-[-15%] top-[15%] size-[38rem] bg-teal-400/50"
          style={{ animationDelay: '4s' }}
        />
        <div
          className="aurora bottom-[-10%] left-[20%] size-[34rem] bg-amber-300/40"
          style={{ animationDelay: '8s' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mx-auto flex w-full max-w-5xl flex-col items-center text-center"
      >
        {/* Pill */}
        <motion.div variants={itemVariants}>
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-foreground/80 sm:text-sm">
            <Sparkles className="size-3.5 text-emerald-500" />
            Powered by next-gen AI models
            <span className="ml-1 hidden h-1 w-1 rounded-full bg-emerald-400/70 sm:inline-block" />
            <span className="hidden text-foreground/50 sm:inline">Gemini · GLM</span>
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Meet <span className="text-gradient">Nova AI</span> — your intelligent
          conversational companion
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          className="mt-5 max-w-2xl text-pretty text-base text-foreground/70 sm:text-lg md:text-xl"
        >
          A premium AI assistant with streaming responses, file uploads, and a
          beautiful glass interface. Switch between cutting-edge models and ship
          faster — all in one place.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={itemVariants}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Button
            onClick={enterApp}
            size="lg"
            className="glow-primary h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 px-7 text-base text-white hover:from-emerald-500/90 hover:to-teal-500/90"
          >
            Start Chatting Free
            <ArrowRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="glass h-12 rounded-full border-foreground/10 px-6 text-base text-foreground/80 hover:text-foreground"
          >
            <Play className="size-4" />
            Watch Demo
          </Button>
        </motion.div>

        {/* Trust line */}
        <motion.div
          variants={itemVariants}
          className="mt-6 flex flex-col items-center gap-2 text-sm text-foreground/60 sm:flex-row"
        >
          <div className="flex items-center gap-0.5" aria-label="5 out of 5 stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="hidden h-3 w-px bg-foreground/20 sm:inline-block" />
          <span>Trusted by 50,000+ creators</span>
        </motion.div>

        {/* Chat preview */}
        <motion.div
          variants={itemVariants}
          className="mt-12 w-full max-w-2xl"
        >
          <ChatPreview />
        </motion.div>
      </motion.div>
    </section>
  )
}

function ChatPreview() {
  return (
    <motion.div
      initial={{ rotate: -1.2, y: 30, opacity: 0 }}
      animate={{ rotate: -1.2, y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ rotate: 0, scale: 1.01 }}
      className="glass-strong relative mx-auto rounded-2xl p-3 shadow-2xl sm:p-4"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-1 pb-3">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-rose-400/80" />
          <span className="size-2.5 rounded-full bg-amber-400/80" />
          <span className="size-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <span className="text-xs text-foreground/50">nova.ai/chat</span>
      </div>

      <div className="space-y-3 text-left">
        {/* User message */}
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl rounded-br-md bg-gradient-to-br from-emerald-500 to-teal-500 px-4 py-2.5 text-sm text-white shadow-sm">
            Write a haiku about glassmorphism in UI design.
          </div>
        </div>

        {/* AI message */}
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm">
            <Sparkles className="size-3.5" />
          </span>
          <div className="max-w-[85%] rounded-2xl rounded-tl-md glass-card px-4 py-2.5 text-sm">
            <p className="text-foreground/90">
              Frosted panes of light,
              <br />
              depth blurred behind every glow —
              <br />
              interface that breathes.
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="typing-dot size-1.5 rounded-full bg-emerald-500/70" />
              <span className="typing-dot size-1.5 rounded-full bg-emerald-500/70" />
              <span className="typing-dot size-1.5 rounded-full bg-emerald-500/70" />
              <span className="ml-1 text-[10px] text-foreground/50">Nova is typing…</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
