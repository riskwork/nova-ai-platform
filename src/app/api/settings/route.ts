import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/settings — return current user's settings
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  let settings = user.settings
  if (!settings) {
    settings = await db.settings.create({ data: { userId: user.id } })
  }
  return NextResponse.json(serialize(settings))
}

// PUT /api/settings — update settings
export async function PUT(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const allowed: Record<string, any> = {}
  const fields = [
    'theme',
    'language',
    'temperature',
    'topP',
    'maxTokens',
    'systemPrompt',
    'streamingMode',
    'notifications',
    'soundEnabled',
    'sendOnEnter',
  ]
  for (const k of fields) {
    if (k in body) {
      // basic type coercion
      const v = body[k]
      if (k === 'temperature' || k === 'topP') allowed[k] = Number(v)
      else if (k === 'maxTokens') allowed[k] = parseInt(v, 10) || 4096
      else if (k === 'streamingMode' || k === 'notifications' || k === 'soundEnabled' || k === 'sendOnEnter')
        allowed[k] = Boolean(v)
      else allowed[k] = String(v)
    }
  }

  // Upsert settings
  let settings = await db.settings.findUnique({ where: { userId: user.id } })
  if (!settings) {
    settings = await db.settings.create({ data: { userId: user.id, ...allowed } })
  } else {
    settings = await db.settings.update({
      where: { userId: user.id },
      data: allowed,
    })
  }
  return NextResponse.json(serialize(settings))
}

function serialize(s: any) {
  return {
    theme: s.theme,
    language: s.language,
    temperature: s.temperature,
    topP: s.topP,
    maxTokens: s.maxTokens,
    systemPrompt: s.systemPrompt,
    streamingMode: s.streamingMode,
    notifications: s.notifications,
    soundEnabled: s.soundEnabled,
    sendOnEnter: s.sendOnEnter,
  }
}
