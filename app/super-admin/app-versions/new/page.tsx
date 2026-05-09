"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"

import { apiFetch } from "@/lib/api/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

type Platform = "android" | "ios" | "both"

interface AppVersionLite {
  id: number
  platform: Platform
  version_code: number
  is_active: boolean
}

interface AppVersionsResponse {
  success: boolean
  versions: AppVersionLite[]
  pagination?: {
    current_page: number
    last_page: number
  }
}

function platformsOverlap(a: Platform, b: Platform): boolean {
  return a === "both" || b === "both" || a === b
}

async function fetchAllVersions(): Promise<AppVersionLite[]> {
  let current = 1
  let last = 1
  const all: AppVersionLite[] = []
  do {
    const res = await apiFetch<AppVersionsResponse>(`/super-admin/app-versions?page=${current}&per_page=100`)
    all.push(...(res.versions ?? []))
    current += 1
    last = res.pagination?.last_page ?? 1
  } while (current <= last)
  return all
}

export default function NewAppVersionPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    platform: "android",
    version_name: "",
    version_code: "",
    min_required_version: "",
    min_required_version_code: "",
    is_active: true,
    is_force_update: false,
    store_url_android: "",
    store_url_ios: "",
    release_title: "",
    release_notes: "",
    force_update_message: "",
    optional_update_message: "",
    release_date: "",
  })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const numericVersionCode = Number(formData.version_code)
      if (formData.is_active) {
        const existing = await fetchAllVersions()
        const overlappingActive = existing.filter(
          (v) => v.is_active && platformsOverlap(v.platform, formData.platform as Platform),
        )
        if (overlappingActive.length > 0) {
          const highest = Math.max(...overlappingActive.map((v) => v.version_code))
          if (numericVersionCode < highest) {
            throw new Error(
              `Active version guard: version_code ${numericVersionCode} is below current active highest (${highest}) for overlapping platform(s).`,
            )
          }
          throw new Error(
            "Active version guard: another active version already exists for this platform scope. Deactivate old active versions first (or use bulk deactivate).",
          )
        }
      }

      const body = {
        ...formData,
        version_code: numericVersionCode,
        min_required_version_code: Number(formData.min_required_version_code),
        store_url_android: formData.store_url_android.trim() || null,
        store_url_ios: formData.store_url_ios.trim() || null,
        release_title: formData.release_title.trim() || null,
        release_notes: formData.release_notes.trim() || null,
        force_update_message: formData.force_update_message.trim() || null,
        optional_update_message: formData.optional_update_message.trim() || null,
        release_date: formData.release_date.trim() || null,
      }
      await apiFetch("/super-admin/app-versions", { method: "POST", body })
      router.push("/super-admin/app-versions")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create app version.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/super-admin/app-versions">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create App Version</h1>
          <p className="text-muted-foreground mt-2">Add a new app version for update checks.</p>
        </div>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <form onSubmit={onSubmit}>
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Version Details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <select
                  id="platform"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.platform}
                  onChange={(e) => setFormData((p) => ({ ...p, platform: e.target.value }))}
                >
                  <option value="android">Android</option>
                  <option value="ios">iOS</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="version_name">Version Name</Label>
                <Input
                  id="version_name"
                  placeholder="e.g. 1.0.1"
                  value={formData.version_name}
                  onChange={(e) => setFormData((p) => ({ ...p, version_name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="version_code">Version Code</Label>
                <Input
                  id="version_code"
                  type="number"
                  min={1}
                  value={formData.version_code}
                  onChange={(e) => setFormData((p) => ({ ...p, version_code: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_required_version">Min Required Version</Label>
                <Input
                  id="min_required_version"
                  placeholder="e.g. 1.0.0"
                  value={formData.min_required_version}
                  onChange={(e) => setFormData((p) => ({ ...p, min_required_version: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_required_version_code">Min Required Version Code</Label>
                <Input
                  id="min_required_version_code"
                  type="number"
                  min={1}
                  value={formData.min_required_version_code}
                  onChange={(e) => setFormData((p) => ({ ...p, min_required_version_code: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="release_date">Release Date</Label>
                <Input
                  id="release_date"
                  type="datetime-local"
                  value={formData.release_date}
                  onChange={(e) => setFormData((p) => ({ ...p, release_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <div className="space-y-2">
                <Label htmlFor="store_url_android">Play Store URL</Label>
                <Input
                  id="store_url_android"
                  value={formData.store_url_android}
                  onChange={(e) => setFormData((p) => ({ ...p, store_url_android: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store_url_ios">App Store URL</Label>
                <Input
                  id="store_url_ios"
                  value={formData.store_url_ios}
                  onChange={(e) => setFormData((p) => ({ ...p, store_url_ios: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="release_title">Release Title</Label>
              <Input
                id="release_title"
                value={formData.release_title}
                onChange={(e) => setFormData((p) => ({ ...p, release_title: e.target.value }))}
              />
            </div>
            <div className="space-y-2 mt-4">
              <Label htmlFor="release_notes">Release Notes</Label>
              <Textarea
                id="release_notes"
                rows={4}
                value={formData.release_notes}
                onChange={(e) => setFormData((p) => ({ ...p, release_notes: e.target.value }))}
              />
            </div>
            <div className="space-y-2 mt-4">
              <Label htmlFor="force_update_message">Force Update Message</Label>
              <Textarea
                id="force_update_message"
                rows={2}
                value={formData.force_update_message}
                onChange={(e) => setFormData((p) => ({ ...p, force_update_message: e.target.value }))}
              />
            </div>
            <div className="space-y-2 mt-4">
              <Label htmlFor="optional_update_message">Optional Update Message</Label>
              <Textarea
                id="optional_update_message"
                rows={2}
                value={formData.optional_update_message}
                onChange={(e) => setFormData((p) => ({ ...p, optional_update_message: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between pt-6 border-t mt-6">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Active</Label>
                <p className="text-sm text-muted-foreground">Include this version in update checks.</p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData((p) => ({ ...p, is_active: checked }))}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <div className="space-y-0.5">
                <Label htmlFor="is_force_update">Force Update</Label>
                <p className="text-sm text-muted-foreground">Marks this version as force-update candidate.</p>
              </div>
              <Switch
                id="is_force_update"
                checked={formData.is_force_update}
                onCheckedChange={(checked) => setFormData((p) => ({ ...p, is_force_update: checked }))}
              />
            </div>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Creating..." : "Create Version"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/super-admin/app-versions">Cancel</Link>
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
