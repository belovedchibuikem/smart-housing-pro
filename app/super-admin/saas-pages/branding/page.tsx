"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ImageIcon, Loader2, Save, Upload } from "lucide-react"
import { toast } from "sonner"

import { apiFetch, getApiBaseUrl, getAuthToken } from "@/lib/api/client"
import { resolveStorageUrl } from "@/lib/api/config"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

type BrandingData = {
  site_name: string
  logo_url: string | null
  icon_url: string | null
  footer_tagline: string | null
  cta_button_text: string
  is_published: boolean
  is_active: boolean
}

export default function SaasBrandingPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingIcon, setUploadingIcon] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const iconInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<BrandingData>({
    site_name: "Smart Housing",
    logo_url: null,
    icon_url: null,
    footer_tagline: "",
    cta_button_text: "Start Free Trial",
    is_published: true,
    is_active: true,
  })

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await apiFetch<{
        success: boolean
        branding: BrandingData & { navigation_links?: unknown[] }
      }>("/super-admin/saas-branding")
      if (res.branding) {
        setForm({
          site_name: res.branding.site_name ?? "Smart Housing",
          logo_url: res.branding.logo_url ?? null,
          icon_url: res.branding.icon_url ?? null,
          footer_tagline: res.branding.footer_tagline ?? "",
          cta_button_text: res.branding.cta_button_text ?? "Start Free Trial",
          is_published: res.branding.is_published ?? true,
          is_active: res.branding.is_active ?? true,
        })
      }
    } catch (e: unknown) {
      toast.error("Failed to load branding", {
        description: e instanceof Error ? e.message : "Error",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const uploadFile = async (file: File, type: "logo" | "icon") => {
    const formData = new FormData()
    formData.append(type === "logo" ? "logo" : "icon", file)
    const endpoint = type === "logo" ? "/super-admin/saas-branding/upload-logo" : "/super-admin/saas-branding/upload-icon"
    const token = getAuthToken()
    const url = `${getApiBaseUrl()}${endpoint}`

    const response = await fetch(url, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || "Upload failed")
    }
    return data as { branding?: BrandingData; logo_url?: string; icon_url?: string }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      const data = await uploadFile(file, "logo")
      const url = data.logo_url ?? data.branding?.logo_url ?? null
      setForm((prev) => ({ ...prev, logo_url: url }))
      toast.success("Logo uploaded")
    } catch (err: unknown) {
      toast.error("Logo upload failed", {
        description: err instanceof Error ? err.message : "Error",
      })
    } finally {
      setUploadingLogo(false)
      if (logoInputRef.current) logoInputRef.current.value = ""
    }
  }

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingIcon(true)
    try {
      const data = await uploadFile(file, "icon")
      const url = data.icon_url ?? data.branding?.icon_url ?? null
      setForm((prev) => ({ ...prev, icon_url: url }))
      toast.success("Icon uploaded")
    } catch (err: unknown) {
      toast.error("Icon upload failed", {
        description: err instanceof Error ? err.message : "Error",
      })
    } finally {
      setUploadingIcon(false)
      if (iconInputRef.current) iconInputRef.current.value = ""
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiFetch("/super-admin/saas-branding", {
        method: "PUT",
        body: {
          site_name: form.site_name.trim(),
          footer_tagline: form.footer_tagline?.trim() || null,
          cta_button_text: form.cta_button_text.trim(),
          is_published: form.is_published,
          is_active: form.is_active,
        },
      })
      toast.success("Branding saved")
    } catch (e: unknown) {
      toast.error("Save failed", { description: e instanceof Error ? e.message : "Error" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const logoPreview = form.logo_url ? resolveStorageUrl(form.logo_url) : null
  const iconPreview = form.icon_url ? resolveStorageUrl(form.icon_url) : null

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/super-admin/saas-pages">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">SaaS branding</h1>
          <p className="text-muted-foreground mt-2">
            Logo and icon appear on the SaaS landing navbar and footer. Icon is also used as the browser favicon.
          </p>
        </div>
      </div>

      <Card className="p-6 space-y-6">
        <h2 className="text-xl font-semibold">Logo (navbar &amp; footer)</h2>
        <p className="text-sm text-muted-foreground">
          Recommended: horizontal PNG or SVG, transparent background, at least 320×80px.
        </p>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex h-20 min-w-[200px] items-center justify-center rounded-lg border bg-muted/30 px-4">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo preview" className="max-h-14 max-w-[220px] object-contain" />
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <ImageIcon className="h-5 w-5" />
                No logo
              </div>
            )}
          </div>
          <div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleLogoUpload}
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploadingLogo}
              onClick={() => logoInputRef.current?.click()}
            >
              {uploadingLogo ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Upload logo
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-6">
        <h2 className="text-xl font-semibold">Icon / favicon</h2>
        <p className="text-sm text-muted-foreground">
          Square mark used when no logo is set, and as the browser tab icon. Recommended: 512×512 PNG.
        </p>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-lg border bg-muted/30">
            {iconPreview ? (
              <img src={iconPreview} alt="Icon preview" className="h-14 w-14 rounded-md object-cover" />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <input
              ref={iconInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/x-icon,.ico"
              className="hidden"
              onChange={handleIconUpload}
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploadingIcon}
              onClick={() => iconInputRef.current?.click()}
            >
              {uploadingIcon ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Upload icon
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Text &amp; visibility</h2>
        <div className="space-y-2">
          <Label htmlFor="site_name">Site name</Label>
          <Input
            id="site_name"
            value={form.site_name}
            onChange={(e) => setForm((p) => ({ ...p, site_name: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="footer_tagline">Footer tagline</Label>
          <Textarea
            id="footer_tagline"
            rows={2}
            value={form.footer_tagline ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, footer_tagline: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cta">Navbar CTA button text</Label>
          <Input
            id="cta"
            value={form.cta_button_text}
            onChange={(e) => setForm((p) => ({ ...p, cta_button_text: e.target.value }))}
          />
        </div>
        <div className="flex items-center justify-between pt-2">
          <Label htmlFor="published">Published (visible on /saas)</Label>
          <Switch
            id="published"
            checked={form.is_published}
            onCheckedChange={(v) => setForm((p) => ({ ...p, is_published: v }))}
          />
        </div>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving…" : "Save settings"}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/saas" target="_blank">
            Preview landing page
          </Link>
        </Button>
      </div>
    </div>
  )
}
