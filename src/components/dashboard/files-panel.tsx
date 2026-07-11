'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Paperclip, Upload, FileText, X, FileUp } from 'lucide-react'
import { api } from '@/lib/api'
import type { FileData } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function FilesPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<FileData[]>([])
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files || [])
    if (incoming.length === 0) return
    setUploading(true)
    try {
      const uploaded: FileData[] = []
      for (const file of incoming) {
        const data = await api.uploadFile(file)
        uploaded.push(data)
      }
      setFiles((prev) => [...uploaded, ...prev])
      toast.success(`Uploaded ${uploaded.length} file(s)`)
    } catch (err) {
      toast.error((err as Error).message || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <header className="mb-6 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Paperclip className="size-5 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Files</h1>
              <p className="text-sm text-muted-foreground">
                Manage your uploaded files
              </p>
            </div>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
          >
            <Upload className="size-4" />
            {uploading ? 'Uploading…' : 'Upload'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
        </header>

        {files.length === 0 ? (
          <Card className="glass-card border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FileUp className="size-7" />
              </div>
              <div>
                <div className="font-medium">No files yet</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload files to attach them to your conversations
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="size-4" /> Choose files
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {files.map((f) => (
              <Card key={f.id} className="glass-card py-3">
                <CardContent className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {f.fileName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {f.mimeType} · {formatSize(f.fileSize)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() =>
                      setFiles((prev) => prev.filter((x) => x.id !== f.id))
                    }
                    aria-label="Remove file"
                  >
                    <X className="size-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
