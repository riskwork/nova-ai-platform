import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

// GET /api/auth/me — return current user + settings, or 404
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 404 })
  }
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
    settings: user.settings
      ? {
          theme: user.settings.theme,
          language: user.settings.language,
          temperature: user.settings.temperature,
          topP: user.settings.topP,
          maxTokens: user.settings.maxTokens,
          systemPrompt: user.settings.systemPrompt,
          streamingMode: user.settings.streamingMode,
          notifications: user.settings.notifications,
          soundEnabled: user.settings.soundEnabled,
          sendOnEnter: user.settings.sendOnEnter,
        }
      : null,
  })
}
