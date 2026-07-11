'use client'

import * as React from 'react'

import { Navbar } from './navbar'
import { Hero } from './hero'
import { Features } from './features'
import { AIModels } from './ai-models'
import { WhyChoose } from './why-choose'
import { Pricing } from './pricing'
import { Testimonials } from './testimonials'
import { FAQ } from './faq'
import { Contact } from './contact'
import { Footer } from './footer'

export function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Page-level ambient background: radial gradient + aurora blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Base radial gradient for depth */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -10%, oklch(0.6 0.15 162 / 0.18), transparent 60%), radial-gradient(ellipse 60% 50% at 90% 30%, oklch(0.65 0.14 185 / 0.12), transparent 60%)',
          }}
        />
        {/* Aurora blobs */}
        <div
          className="aurora aurora-emerald left-[-12%] top-[2%] size-[34rem]"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="aurora aurora-teal right-[-15%] top-[28%] size-[30rem]"
          style={{ animationDelay: '6s' }}
        />
        <div
          className="aurora aurora-mint left-[20%] top-[60%] size-[28rem]"
          style={{ animationDelay: '10s' }}
        />
      </div>

      <Navbar />
      <Hero />
      <Features />
      <AIModels />
      <WhyChoose />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  )
}
