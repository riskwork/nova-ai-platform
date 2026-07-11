'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Shield, Sparkles, Puzzle } from 'lucide-react'

const BENEFITS = [
  {
    icon: Zap,
    title: 'Blazing fast first token',
    description: 'Median time-to-first-token under 2 seconds, even on long prompts.',
  },
  {
    icon: Shield,
    title: 'Bank-grade security',
    description: 'End-to-end encryption in transit, encrypted storage, and zero training on your data.',
  },
  {
    icon: Sparkles,
    title: 'Beautiful glassmorphism UI',
    description: 'A meticulously crafted interface with aurora backgrounds, light/dark themes, and silky animations.',
  },
  {
    icon: Puzzle,
    title: 'Open & extensible',
    description: 'Built on Next.js, Tailwind, and shadcn/ui. Add your own models, plugins, and themes.',
  },
] as const

const STATS = [
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '<2s', label: 'First token' },
  { value: '50k+', label: 'Active users' },
  { value: '4.9/5', label: 'Average rating' },
] as const

export function WhyChoose() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:py-28">
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Left: copy + benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-block rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-600 ring-1 ring-inset ring-emerald-400/20 dark:text-emerald-300">
            Why Nova
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Why choose <span className="text-gradient">Nova AI</span>
          </h2>
          <p className="mt-4 text-pretty text-base text-foreground/65 sm:text-lg">
            We obsess over the details that make AI feel effortless — speed,
            security, and an interface that gets out of your way.
          </p>

          <ul className="mt-8 space-y-4">
            {BENEFITS.map((benefit, i) => {
              const Icon = benefit.icon
              return (
                <motion.li
                  key={benefit.title}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className="flex items-start gap-3.5"
                >
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-400/10 text-emerald-600 ring-1 ring-inset ring-emerald-400/25 dark:text-emerald-300">
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{benefit.title}</h3>
                      <Check className="size-4 text-emerald-500" aria-hidden />
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-foreground/65">
                      {benefit.description}
                    </p>
                  </div>
                </motion.li>
              )
            })}
          </ul>
        </motion.div>

        {/* Right: stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-2 gap-4 sm:gap-5"
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className={
                'glass-card relative overflow-hidden rounded-2xl p-6 ' +
                (i % 3 === 0 ? 'sm:translate-y-4' : '')
              }
            >
              <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-emerald-400/10 blur-2xl" />
              <div className="relative">
                <div className="text-3xl font-bold tracking-tight sm:text-4xl">
                  <span className="text-gradient">{stat.value}</span>
                </div>
                <div className="mt-1.5 text-sm font-medium text-foreground/60">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
