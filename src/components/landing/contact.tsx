'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Mail, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useApp } from '@/store/use-app'

export function Contact() {
  const enterApp = useApp((s) => s.enterApp)

  return (
    <section id="contact" className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:py-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass-strong relative overflow-hidden rounded-3xl px-6 py-16 text-center sm:px-12 sm:py-20"
      >
        {/* Aurora background */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div
            className="aurora left-[-10%] top-[-20%] size-[32rem] bg-emerald-400/40"
            style={{ animationDelay: '0s' }}
          />
          <div
            className="aurora right-[-15%] bottom-[-20%] size-[30rem] bg-teal-400/40"
            style={{ animationDelay: '5s' }}
          />
          <div
            className="aurora left-[30%] top-[10%] size-[24rem] bg-amber-300/30"
            style={{ animationDelay: '9s' }}
          />
          <div className="absolute inset-0 bg-grid opacity-40" />
        </div>

        <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-foreground/80">
          <Sparkles className="size-3.5 text-emerald-500" />
          Get started in seconds
        </span>

        <h2 className="mx-auto mt-6 max-w-3xl text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Ready to transform how you work?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-foreground/70 sm:text-lg">
          Join 50,000+ creators using Nova AI to ship faster, think clearer, and
          build more. No credit card required to start.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            onClick={enterApp}
            size="lg"
            className="glow-primary h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 px-7 text-base text-white hover:from-emerald-500/90 hover:to-teal-500/90"
          >
            Launch Nova AI
            <ArrowRight className="size-4" />
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="glass h-12 rounded-full border-foreground/10 px-6 text-base text-foreground/80 hover:text-foreground"
          >
            <a href="mailto:hello@nova.ai">
              <Mail className="size-4" />
              hello@nova.ai
            </a>
          </Button>
        </div>

        <p className="mt-6 text-xs text-foreground/50">
          Average response time under 2 hours · Mon–Fri
        </p>
      </motion.div>
    </section>
  )
}
