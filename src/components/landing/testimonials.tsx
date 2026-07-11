'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

import { SectionHeader } from './features'

interface Testimonial {
  name: string
  role: string
  initials: string
  gradient: string
  quote: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Amara Okafor',
    role: 'Product Designer · Linear',
    initials: 'AO',
    gradient: 'from-emerald-400 to-teal-500',
    quote:
      'Nova AI replaced three tools in my workflow. The streaming is buttery smooth and the glass UI is the prettiest thing on my desktop.',
  },
  {
    name: 'Daniel Chen',
    role: 'Indie Hacker · ShipFast',
    initials: 'DC',
    gradient: 'from-teal-400 to-emerald-500',
    quote:
      'First token under two seconds — every time. I ship features 2x faster because I never wait for the model to wake up.',
  },
  {
    name: 'Sofia Marchetti',
    role: 'Content Lead · Acme',
    initials: 'SM',
    gradient: 'from-amber-400 to-emerald-500',
    quote:
      'I uploaded a 200-page PDF and Nova just… read it. No fluff, no hallucinations. It grounded every answer in the doc.',
  },
  {
    name: 'Rahul Verma',
    role: 'Staff Engineer · Stripe',
    initials: 'RV',
    gradient: 'from-emerald-500 to-cyan-500',
    quote:
      'Multi-model switching is the killer feature. Gemini for reasoning, GLM-4.5 Air for speed. Same chat, one click.',
  },
  {
    name: 'Yuki Tanaka',
    role: 'Founder · Pixelnest',
    initials: 'YT',
    gradient: 'from-teal-500 to-emerald-400',
    quote:
      'My whole team lives in Nova now. Conversation history + pinning means nobody loses context across handoffs.',
  },
  {
    name: 'Marcus Hughes',
    role: 'Researcher · OpenLab',
    initials: 'MH',
    gradient: 'from-emerald-400 to-amber-400',
    quote:
      'The dark theme is gorgeous. Aurora backgrounds, subtle animations — it feels like a native app, not a web page.',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const card = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:py-28"
    >
      <SectionHeader
        eyebrow="Testimonials"
        title="Loved by creators & teams"
        subtitle="50,000+ people use Nova AI every day. Here's what a few of them have to say."
      />

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {TESTIMONIALS.map((t) => (
          <TestimonialCard key={t.name} testimonial={t} />
        ))}
      </motion.div>
    </section>
  )
}

function TestimonialCard({ testimonial: t }: { testimonial: Testimonial }) {
  return (
    <motion.figure
      variants={card}
      whileHover={{ y: -4 }}
      className="glass-card relative flex flex-col overflow-hidden rounded-2xl p-6"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-emerald-400/10 blur-2xl" />
      <div className="relative flex items-center gap-1" aria-label="5 out of 5 stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
        ))}
      </div>

      <blockquote className="relative mt-4 flex-1 text-sm leading-relaxed text-foreground/80">
        “{t.quote}”
      </blockquote>

      <figcaption className="relative mt-5 flex items-center gap-3 border-t border-foreground/10 pt-4">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br ${t.gradient} text-sm font-semibold text-white shadow-sm`}
          aria-hidden
        >
          {t.initials}
        </span>
        <div>
          <div className="text-sm font-semibold">{t.name}</div>
          <div className="text-xs text-foreground/55">{t.role}</div>
        </div>
      </figcaption>
    </motion.figure>
  )
}
