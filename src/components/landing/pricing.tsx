'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useApp } from '@/store/use-app'
import { SectionHeader } from './features'

type Cycle = 'monthly' | 'yearly'

interface Plan {
  id: string
  name: string
  monthly: number | null // null = custom
  yearly: number | null
  description: string
  features: string[]
  cta: string
  highlight?: boolean
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    monthly: 0,
    yearly: 0,
    description: 'Everything you need to try Nova AI and ship a side project.',
    features: [
      '50 messages / day',
      'Access to Flash models',
      '5 file uploads / day',
      'Conversation history (7 days)',
      'Community support',
    ],
    cta: 'Get Started',
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: 20,
    yearly: 16,
    description: 'For creators and professionals who live in AI every day.',
    features: [
      'Unlimited messages',
      'Access to Pro & Flagship models',
      'Unlimited file uploads',
      'Unlimited history + pinning',
      'Priority streaming',
      'Email support',
    ],
    cta: 'Upgrade to Pro',
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthly: null,
    yearly: null,
    description: 'Custom deployments, SSO, and dedicated infrastructure.',
    features: [
      'Everything in Pro',
      'SSO / SAML & SCIM',
      'Custom model routing',
      'Dedicated support & SLA',
      'On-prem option',
      'Audit logs',
    ],
    cta: 'Contact Sales',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}
const card = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
}

export function Pricing() {
  const enterApp = useApp((s) => s.enterApp)
  const [cycle, setCycle] = React.useState<Cycle>('monthly')

  return (
    <section
      id="pricing"
      className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:py-28"
    >
      <SectionHeader
        eyebrow="Pricing"
        title="Simple, transparent pricing"
        subtitle="Start free, scale as you go. No hidden fees, cancel anytime."
      />

      {/* Billing toggle */}
      <div className="mt-8 flex justify-center">
        <ToggleGroup
          type="single"
          value={cycle}
          onValueChange={(v) => v && setCycle(v as Cycle)}
          variant="outline"
          className="glass rounded-full p-1"
        >
          <ToggleGroupItem
            value="monthly"
            className="rounded-full px-4 data-[state=on]:bg-gradient-to-br data-[state=on]:from-emerald-500 data-[state=on]:to-teal-500 data-[state=on]:text-white"
          >
            Monthly
          </ToggleGroupItem>
          <ToggleGroupItem
            value="yearly"
            className="rounded-full px-4 data-[state=on]:bg-gradient-to-br data-[state=on]:from-emerald-500 data-[state=on]:to-teal-500 data-[state=on]:text-white"
          >
            Yearly
            <span className="ml-1.5 text-xs text-emerald-600 dark:text-emerald-300 data-[state=on]:text-white/90">
              -20%
            </span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:items-stretch"
      >
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            cycle={cycle}
            onCta={() => {
              if (plan.id === 'free') enterApp()
              else if (plan.id === 'pro') enterApp()
              else enterApp()
            }}
          />
        ))}
      </motion.div>

      <p className="mt-8 text-center text-xs text-foreground/50">
        Prices in USD. Yearly billed annually. Taxes may apply based on your region.
      </p>
    </section>
  )
}

function PlanCard({
  plan,
  cycle,
  onCta,
}: {
  plan: Plan
  cycle: Cycle
  onCta: () => void
}) {
  const amount = cycle === 'monthly' ? plan.monthly : plan.yearly
  const isCustom = amount === null

  return (
    <motion.div
      variants={card}
      whileHover={{ y: -6 }}
      className={cn(
        'glass-card relative flex flex-col overflow-hidden rounded-2xl p-6 sm:p-7',
        plan.highlight &&
          'glow-primary ring-1 ring-emerald-400/40 md:scale-[1.03]'
      )}
    >
      {plan.highlight && (
        <>
          <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute right-4 top-4">
            <Badge className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white border-transparent shadow-sm">
              <Sparkles className="size-3" />
              Most Popular
            </Badge>
          </div>
        </>
      )}

      <div className="relative">
        <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
        <p className="mt-1.5 text-sm text-foreground/65">{plan.description}</p>

        <div className="mt-6 flex items-end gap-1.5">
          {isCustom ? (
            <span className="text-4xl font-bold tracking-tight">Custom</span>
          ) : (
            <>
              <span className="text-4xl font-bold tracking-tight">${amount}</span>
              <span className="mb-1 text-sm text-foreground/55">/mo</span>
            </>
          )}
        </div>
        {!isCustom && cycle === 'yearly' && (
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-300">
            Billed annually (${(amount as number) * 12}/yr)
          </p>
        )}
      </div>

      <ul className="relative mt-6 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-emerald-600 dark:text-emerald-300">
              <Check className="size-3" />
            </span>
            <span className="text-foreground/75">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="relative mt-7 pt-2">
        <Button
          onClick={onCta}
          className={cn(
            'w-full',
            plan.highlight
              ? 'glow-primary bg-gradient-to-br from-emerald-500 to-teal-500 text-white hover:from-emerald-500/90 hover:to-teal-500/90'
              : 'glass border-foreground/10 text-foreground hover:text-foreground'
          )}
          variant={plan.highlight ? 'default' : 'outline'}
        >
          {plan.cta}
        </Button>
      </div>
    </motion.div>
  )
}
