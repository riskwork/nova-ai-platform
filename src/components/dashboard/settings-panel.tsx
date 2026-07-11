'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import {
  Palette,
  SlidersHorizontal,
  Bell,
  Sun,
  Moon,
  Monitor,
  Save,
} from 'lucide-react'
import { useApp } from '@/store/use-app'
import { api } from '@/lib/api'
import type { SettingsData } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

export function SettingsPanel() {
  const { settings, setSettings } = useApp()
  const { setTheme } = useTheme()
  const [draft, setDraft] = useState<SettingsData | null>(settings)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDraft(settings)
  }, [settings])

  if (!settings || !draft) {
    return (
      <div className="mx-auto w-full max-w-2xl p-6 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  const patch = async (p: Partial<SettingsData>) => {
    setSaving(true)
    try {
      const updated = await api.updateSettings(p)
      setSettings(updated)
      setDraft(updated)
      if (p.theme) setTheme(updated.theme)
      toast.success('Settings saved')
    } catch (e) {
      toast.error((e as Error).message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateDraft = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setDraft((d) => (d ? { ...d, [key]: value } : d))
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
        <header className="mb-6 flex items-center gap-2">
          <SlidersHorizontal className="size-5 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Customize your Nova AI experience
            </p>
          </div>
        </header>

        <Tabs defaultValue="appearance">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appearance">
              <Palette className="size-4" /> Appearance
            </TabsTrigger>
            <TabsTrigger value="ai">
              <SlidersHorizontal className="size-4" /> AI
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="size-4" /> Alerts
            </TabsTrigger>
          </TabsList>

          {/* Appearance */}
          <TabsContent value="appearance" className="mt-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Choose how Nova AI looks to you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { v: 'light', label: 'Light', icon: Sun },
                      { v: 'dark', label: 'Dark', icon: Moon },
                      { v: 'system', label: 'System', icon: Monitor },
                    ].map((opt) => {
                      const Icon = opt.icon
                      const active = draft.theme === opt.v
                      return (
                        <button
                          key={opt.v}
                          onClick={() => {
                            updateDraft('theme', opt.v)
                            patch({ theme: opt.v })
                          }}
                          className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-sm transition-all ${
                            active
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border hover:bg-foreground/5'
                          }`}
                        >
                          <Icon className="size-5" />
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={draft.language}
                    onValueChange={(v) => {
                      updateDraft('language', v)
                      patch({ language: v })
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Preferences */}
          <TabsContent value="ai" className="mt-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>AI Preferences</CardTitle>
                <CardDescription>
                  Tune model behavior for your conversations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Temperature</Label>
                    <span className="text-xs text-muted-foreground">
                      {draft.temperature.toFixed(2)}
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={2}
                    step={0.05}
                    value={[draft.temperature]}
                    onValueChange={([v]) => updateDraft('temperature', v)}
                    onValueCommit={([v]) => patch({ temperature: v })}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Lower = focused & deterministic. Higher = creative & varied.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Top P</Label>
                    <span className="text-xs text-muted-foreground">
                      {draft.topP.toFixed(2)}
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={1}
                    step={0.05}
                    value={[draft.topP]}
                    onValueChange={([v]) => updateDraft('topP', v)}
                    onValueCommit={([v]) => patch({ topP: v })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max tokens</Label>
                  <Input
                    type="number"
                    min={64}
                    max={8192}
                    value={draft.maxTokens}
                    onChange={(e) => updateDraft('maxTokens', Number(e.target.value))}
                    onBlur={() => patch({ maxTokens: draft.maxTokens })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>System prompt</Label>
                  <Textarea
                    rows={4}
                    value={draft.systemPrompt}
                    placeholder="e.g. You are a helpful assistant…"
                    onChange={(e) => updateDraft('systemPrompt', e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => patch({ systemPrompt: draft.systemPrompt })}
                    disabled={saving}
                  >
                    <Save className="size-4" /> Save prompt
                  </Button>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="text-sm font-medium">Streaming responses</div>
                    <p className="text-xs text-muted-foreground">
                      Show tokens as they arrive
                    </p>
                  </div>
                  <Switch
                    checked={draft.streamingMode}
                    onCheckedChange={(v) => {
                      updateDraft('streamingMode', v)
                      patch({ streamingMode: v })
                    }}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="text-sm font-medium">Send on Enter</div>
                    <p className="text-xs text-muted-foreground">
                      Press Enter to send, Shift+Enter for newline
                    </p>
                  </div>
                  <Switch
                    checked={draft.sendOnEnter}
                    onCheckedChange={(v) => {
                      updateDraft('sendOnEnter', v)
                      patch({ sendOnEnter: v })
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="mt-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Control how Nova AI alerts you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="text-sm font-medium">Notifications</div>
                    <p className="text-xs text-muted-foreground">
                      Show desktop notifications
                    </p>
                  </div>
                  <Switch
                    checked={draft.notifications}
                    onCheckedChange={(v) => {
                      updateDraft('notifications', v)
                      patch({ notifications: v })
                    }}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="text-sm font-medium">Sound effects</div>
                    <p className="text-xs text-muted-foreground">
                      Play a sound when responses complete
                    </p>
                  </div>
                  <Switch
                    checked={draft.soundEnabled}
                    onCheckedChange={(v) => {
                      updateDraft('soundEnabled', v)
                      patch({ soundEnabled: v })
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
