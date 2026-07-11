'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { User, Save, Mail, Calendar } from 'lucide-react'
import { useApp } from '@/store/use-app'
import { api } from '@/lib/api'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'

export function ProfilePanel() {
  const { user, setUser } = useApp()
  const [name, setName] = useState(user?.name || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [saving, setSaving] = useState(false)

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-2xl p-6 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  const initials =
    (name || 'Guest')
      .split(' ')
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'G'

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await api.updateProfile({ name: name.trim(), bio })
      setUser(updated)
      toast.success('Profile updated')
    } catch (e) {
      toast.error((e as Error).message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
        <header className="mb-6 flex items-center gap-2">
          <User className="size-5 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Profile</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account details
            </p>
          </div>
        </header>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Your profile</CardTitle>
            <CardDescription>
              This information is visible only to you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-2xl font-bold text-white shadow-lg">
                {initials}
              </div>
              <div>
                <div className="font-semibold">{name || 'Guest'}</div>
                <div className="text-sm text-muted-foreground">
                  {user.email || 'No email on file'}
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell Nova a little about yourself…"
              />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                <Mail className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {user.email || 'Not signed in'}
                </span>
              </div>
            </div>

            {/* Member since */}
            <div className="space-y-2">
              <Label>Member since</Label>
              <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {format(new Date(user.createdAt), 'MMMM d, yyyy')}
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="size-4" />
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
