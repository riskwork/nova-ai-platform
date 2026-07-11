import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/profile — return current user's profile
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    bio: user.bio,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  })
}

// PUT /api/profile — update profile (name, bio, avatar)
export async function PUT(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const allowed: Record<string, any> = {}
  for (const k of ['name', 'bio', 'avatar', 'email']) {
    if (k in body && typeof body[k] === 'string') allowed[k] = body[k] || null
  }
  const updated = await db.user.update({
    where: { id: user.id },
    data: allowed,
  })
  return NextResponse.json({
    id: updated.id,
    email: updated.email,
    name: updated.name,
    avatar: updated.avatar,
    bio: updated.bio,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  })
}
