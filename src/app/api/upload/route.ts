import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')
const MAX_SIZE = 100 * 1024 * 1024 // 100 MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'text/csv',
  'application/csv',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]

// POST /api/upload — upload a file
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file')
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large (max 100MB)' }, { status: 413 })
  }

  // Accept all types but warn; we don't hard-reject to keep UX smooth
  const ext = path.extname(file.name) || ''
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`

  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }

  const filePath = path.join(UPLOAD_DIR, uniqueName)
  const bytes = await file.arrayBuffer()
  await writeFile(filePath, Buffer.from(bytes))

  const fileRecord = await db.file.create({
    data: {
      userId: user.id,
      fileName: file.name,
      storagePath: uniqueName,
      mimeType: file.type || 'application/octet-stream',
      fileSize: file.size,
    },
  })

  return NextResponse.json({
    id: fileRecord.id,
    fileName: fileRecord.fileName,
    storagePath: `/uploads/${uniqueName}`,
    mimeType: fileRecord.mimeType,
    fileSize: fileRecord.fileSize,
    createdAt: fileRecord.createdAt.toISOString(),
  })
}

// DELETE /api/upload?id=... — delete an uploaded file
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }
  await db.file.deleteMany({ where: { id, userId: user.id } })
  return NextResponse.json({ success: true })
}
