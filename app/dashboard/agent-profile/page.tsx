"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { apiFetch } from "@/lib/api/client"
import { VerificationBadge } from "@/components/marketplace/verification-badge"
import type { MarketplaceAgent } from "@/lib/api/marketplace"
import { toast } from "sonner"

export default function AgentProfilePage() {
  const [profile, setProfile] = useState<MarketplaceAgent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    display_name: "",
    phone: "",
    bio: "",
    rea_license_number: "",
    license_document_url: "",
    service_areas: "",
  })

  useEffect(() => {
    apiFetch<{ success: boolean; data: MarketplaceAgent | null }>("/admin/agent-profile")
      .then((res) => {
        setProfile(res.data)
        if (res.data) {
          setForm({
            display_name: res.data.display_name || "",
            phone: res.data.phone || "",
            bio: res.data.bio || "",
            rea_license_number: res.data.rea_license_number || "",
            license_document_url: "",
            service_areas: (res.data.service_areas || []).join(", "),
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await apiFetch<{ success: boolean; message: string; data: MarketplaceAgent }>(
        "/admin/agent-profile/apply",
        {
          method: "POST",
          body: {
            display_name: form.display_name,
            phone: form.phone || null,
            bio: form.bio || null,
            rea_license_number: form.rea_license_number,
            license_document_url: form.license_document_url || null,
            service_areas: form.service_areas
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          },
        }
      )
      setProfile(res.data)
      toast.success(res.message || "Application submitted")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Submission failed")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-muted-foreground">Loading…</div>
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Real-estate agent profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Apply to be listed on the Smart Housing marketplace agent directory. License verification is required.
        </p>
      </div>

      {profile && (
        <div className="flex items-center gap-2">
          <VerificationBadge status={profile.is_verified ? "verified" : "pending"} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{profile ? "Update application" : "Apply as agent"}</CardTitle>
          <CardDescription>REA license number is mandatory for verification.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label>Display name</Label>
              <Input required value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>REA license number</Label>
              <Input required value={form.rea_license_number} onChange={(e) => setForm({ ...form, rea_license_number: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>License document URL</Label>
              <Input value={form.license_document_url} onChange={(e) => setForm({ ...form, license_document_url: e.target.value })} placeholder="https://…" />
            </div>
            <div className="space-y-2">
              <Label>Service areas (comma-separated states/cities)</Label>
              <Input value={form.service_areas} onChange={(e) => setForm({ ...form, service_areas: e.target.value })} placeholder="Lagos, Abuja" />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </div>
            <Button type="submit" disabled={saving}>{saving ? "Submitting…" : "Submit for verification"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
