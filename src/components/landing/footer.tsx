'use client'

import * as React from 'react'
import Link from 'next/link'
import { Github, Twitter, Linkedin, Sparkles } from 'lucide-react'

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'AI Models', href: '#models' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Testimonials', href: '#testimonials' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Security', href: '#' },
      { label: 'DPA', href: '#' },
    ],
  },
]

const SOCIALS = [
  { label: 'GitHub', href: '#', Icon: Github },
  { label: 'Twitter', href: '#', Icon: Twitter },
  { label: 'LinkedIn', href: '#', Icon: Linkedin },
]

export function Footer() {
  return (
    <footer className="relative mt-10 border-t border-foreground/10">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="#top" className="group flex items-center gap-2.5" aria-label="Nova AI home">
              <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md">
                <Sparkles className="size-[1.05rem]" />
              </span>
              <span className="text-lg font-semibold tracking-tight">
                <span className="text-gradient">Nova</span>
                <span className="text-foreground/90"> AI</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-foreground/60">
              Your intelligent conversational companion. Premium AI assistant
              with streaming, files, and multi-model support.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="glass grid size-9 place-items-center rounded-lg text-foreground/70 transition-all hover:text-emerald-500 hover:shadow-sm"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-sm font-semibold text-foreground/80">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/60 transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-foreground/10 pt-6 sm:flex-row">
          <p className="text-xs text-foreground/55">
            © 2025 Nova AI. Built with Next.js.
          </p>
          <div className="flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1.5 ring-1 ring-inset ring-emerald-400/20">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-300">
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
