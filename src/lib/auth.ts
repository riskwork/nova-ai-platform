import { cookies } from 'next/headers'
import { db } from '@/lib/db'

export const SESSION_COOKIE = 'nova-session'

/**
 * Simple local session management.
 * A session id is stored in a cookie. On first visit, a guest User is created
 * and bound to that session. This keeps the MVP fully functional without Clerk.
 */
export async function getCurrentUser() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value
  if (!sessionId) return null

  try {
    const user = await db.user.findUnique({
      where: { id: sessionId },
      include: { settings: true },
    })
    return user
  } catch {
    return null
  }
}

export async function getOrCreateUser() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value

  if (sessionId) {
    try {
      const existing = await db.user.findUnique({
        where: { id: sessionId },
        include: { settings: true },
      })
      if (existing) return existing
    } catch {
      // fall through to create
    }
  }

  // Create a new guest user
  const user = await db.user.create({
    data: {
      id: sessionId || undefined,
      name: 'Nova User',
      settings: {
        create: {},
      },
    },
    include: { settings: true },
  })

  return user
}

export async function setSessionCookie(userId: string) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  })
}
