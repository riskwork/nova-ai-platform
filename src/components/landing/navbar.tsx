'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { Menu, Sparkles, ArrowRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useApp } from '@/store/use-app'
import { ThemeToggle } from './theme-toggle'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'AI Models', href: '#models' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Testimonials', href: '#testimonials' },
] as const

export function Navbar() {
  const enterApp = useApp((s) => s.enterApp)
  const [scrolled, setScrolled] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 12)
  })

  return (
    <motion.header
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-5 sm:pt-4"
    >
      <nav
        aria-label="Primary"
        className={cn(
          'glass-strong flex w-full max-w-6xl items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-300 sm:px-5',
          scrolled && 'py-2 shadow-lg'
        )}
      >
        {/* Logo */}
        <Link
          href="#top"
          className="group flex items-center gap-2.5"
          aria-label="Nova AI home"
        >
          <span className="relative grid size-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md transition-transform group-hover:scale-105">
            <Sparkles className="size-[1.05rem]" />
            <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            <span className="text-gradient">Nova</span>
            <span className="text-foreground/90"> AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Button
            onClick={enterApp}
            size="sm"
            className="hidden bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md hover:from-emerald-500/90 hover:to-teal-500/90 sm:inline-flex"
          >
            Launch App
            <ArrowRight className="size-4" />
          </Button>

          {/* Mobile sheet */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="glass-strong w-[300px] border-l-0">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
                    <Sparkles className="size-4" />
                  </span>
                  <span className="text-gradient">Nova</span> AI
                </SheetTitle>
              </SheetHeader>
              <ul className="mt-4 flex flex-col gap-1 px-4">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <SheetClose asChild>
                      <Link
                        href={link.href}
                        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  </li>
                ))}
              </ul>
              <div className="mt-auto p-4">
                <SheetClose asChild>
                  <Button
                    onClick={enterApp}
                    className="w-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md hover:from-emerald-500/90 hover:to-teal-500/90"
                  >
                    Launch App
                    <ArrowRight className="size-4" />
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  )
}
