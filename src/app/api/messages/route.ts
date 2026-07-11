import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

function serialize(m: any) {
  return {
    id: m.id,
    chatId: m.chatId,
    role: m.role,
    content: m.content,
    tokenCount: m.tokenCount,
    attachments: m.attachments,
    createdAt: m.createdAt.toISOString(),
  }
}

// GET /api/messages?chatId=... — list messages in a chat
export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  const chatId = req.nextUrl.searchParams.get('chatId')
  if (!chatId) {
    return NextResponse.json({ error: 'chatId is required' }, { status: 400 })
  }
  // Verify ownership
  const chat = await db.chat.findFirst({ where: { id: chatId, userId: user.id } })
  if (!chat) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
  }
  const messages = await db.message.findMany({
    where: { chatId },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ messages: messages.map(serialize) })
}

// DELETE /api/messages?id=... — delete a single message
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }
  // Verify ownership through the message's chat
  const msg = await db.message.findUnique({
    where: { id },
    include: { chat: true },
  })
  if (!msg || msg.chat.userId !== user.id) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 })
  }
  await db.message.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
