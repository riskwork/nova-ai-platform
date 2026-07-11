'use client'

import * as React from 'react'
import { motion } from 'framer-motion'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { SectionHeader } from './features'

const FAQS: { q: string; a: string }[] = [
  {
    q: 'What AI models are supported?',
    a: 'Nova AI ships with Gemini 2.5 Flash, Gemini 2.5 Pro, GLM-4.6, and GLM-4.5 Air out of the box. You can switch between them mid-conversation. OpenAI, Claude, DeepSeek, Grok, Mistral, and Llama are on the roadmap and will be available as drop-in providers.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. All traffic is encrypted in transit (TLS 1.3) and your conversations are stored encrypted at rest. We never train on your data, and you can delete any conversation — or your entire account — at any time. Pro and Enterprise plans add SSO, audit logs, and on-prem options.',
  },
  {
    q: 'Can I upload files?',
    a: 'Absolutely. Drag and drop PDFs, DOCX, or images directly into the chat. Nova parses the content and grounds its answers in your files, with citations back to the source.',
  },
  {
    q: 'Do you support streaming?',
    a: 'Yes — every model on Nova streams responses token-by-token by default. Median time-to-first-token is under 2 seconds. You can disable streaming per-chat if you prefer a single final reply.',
  },
  {
    q: 'Can I change themes?',
    a: 'Yes. Nova ships with a polished light theme and a deep dark theme. Use the toggle in the navbar (sun/moon icon) to switch. Your preference is saved automatically and respected across sessions.',
  },
  {
    q: 'Is there a free plan?',
    a: 'Yes. The Free plan includes 50 messages per day, access to Flash models, 5 file uploads per day, and 7-day conversation history — no credit card required. Upgrade to Pro anytime for unlimited usage and Pro/Flagship models.',
  },
  {
    q: "What's on the roadmap?",
    a: 'Voice mode, custom agents and prompts, MCP-style tool calling, team workspaces with shared history, and additional model providers (OpenAI, Claude, DeepSeek, Grok, Mistral, Llama). We ship improvements every two weeks.',
  },
]

export function FAQ() {
  return (
    <section id="faq" className="relative mx-auto w-full max-w-3xl px-4 py-20 sm:py-28">
      <SectionHeader
        eyebrow="FAQ"
        title="Frequently asked questions"
        subtitle="Everything you need to know about Nova AI. Can't find an answer? Reach out to our team."
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card mt-12 overflow-hidden rounded-2xl px-5 sm:px-7"
      >
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((faq, i) => (
            <AccordionItem
              key={faq.q}
              value={`item-${i}`}
              className="border-foreground/10"
            >
              <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-pretty text-sm leading-relaxed text-foreground/70">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </section>
  )
}
