import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { generateTitle } from '@/lib/ai'

function serialize(c: any) {
  return {
    id: c.id,
    userId: c.userId,
    title: c.title,
    pinned: c.pinned,
    archived: c.archived,
    model: c.model,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }
}

// GET /api/chat — list all chats for the current user
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  const chats = await db.chat.findMany({
    where: { userId: user.id, archived: false },
    orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
  })
  return NextResponse.json({ chats: chats.map(serialize) })
}

// POST /api/chat — create a new chat
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const chat = await db.chat.create({
    data: {
      userId: user.id,
      title: body.title || 'New Conversation',
      model: body.model || 'gemini-2.5-flash',
    },
  })
  return NextResponse.json(serialize(chat), { status: 201 })
}

// PATCH /api/chat — update a chat (title, pinned, archived, model)
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const { id, ...patch } = body
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  // Only allow known fields
  const allowed: Record<string, any> = {}
  for (const k of ['title', 'pinned', 'archived', 'model']) {
    if (k in patch) allowed[k] = patch[k]
  }

  const chat = await db.chat.updateMany({
    where: { id, userId: user.id },
    data: allowed,
  })
  if (chat.count === 0) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
  }
  const updated = await db.chat.findUnique({ where: { id } })
  return NextResponse.json(serialize(updated))
}

// DELETE /api/chat?id=... — delete a chat
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }
  await db.chat.deleteMany({ where: { id, userId: user.id } })
  return NextResponse.json({ success: true })
}

// Re-export generateTitle so the stream route can use it via this module if needed
export { generateTitle }
