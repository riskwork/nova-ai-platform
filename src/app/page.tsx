'use client'

import { useApp } from '@/store/use-app'
import Dashboard from '@/components/dashboard/dashboard'
import { LandingPage } from '@/components/landing'

export default function Home() {
  const view = useApp((s) => s.view)

  if (view === 'dashboard') {
    return <Dashboard />
  }

  return <LandingPage />
}
