import { NextResponse } from 'next/server'
import { getOrCreateUser, setSessionCookie } from '@/lib/auth'
import { db } from '@/lib/db'

// POST /api/auth/guest — create or return a guest user and set session cookie
export async function POST() {
  const user = await getOrCreateUser()
  await setSessionCookie(user.id)

  // Ensure settings exist
  if (!user.settings) {
    const settings = await db.settings.create({
      data: { userId: user.id },
    })
    user.settings = settings
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
    settings: {
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
    },
  })
}
