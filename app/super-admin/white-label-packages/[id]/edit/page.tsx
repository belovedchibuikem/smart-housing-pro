"use client"

import type React from "react"
import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { toast } from "sonner"

export default function EditWhiteLabelPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [featuresText, setFeaturesText] = useState("")
  const [price, setPrice] = useState("")
  const [billingCycle, setBillingCycle] = useState("monthly")
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const res = await apiFetch<{ package: any }>(`/super-admin/white-label-packages/${id}`)
        if (cancelled || !res.package) return
        const p = res.package
        setName(p.name ?? "")
        setDescription(p.description ?? "")
        setFeaturesText(Array.isArray(p.features) ? p.features.join("\n") : "")
        setPrice(String(p.price ?? ""))
        setBillingCycle(p.billing_cycle ?? "monthly")
        setIsActive(!!p.is_active)
      } catch (e: any) {
        toast.error(e?.message || "Failed to load package")
        router.push("/super-admin/white-label-packages")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const features = featuresText.split("\n").map((f) => f.trim()).filter(Boolean)
    if (features.length === 0) {
      toast.error("Add at least one feature (one per line)")
      return
    }
    try {
      setSaving(true)
      await apiFetch(`/super-admin/white-label-packages/${id}`, {
        method: "PUT",
        body: {
          name: name.trim(),
          description: description.trim(),
          price: parseFloat(price),
          billing_cycle: billingCycle,
          features,
          is_active: isActive,
        },
      })
      toast.success("Package updated")
      router.push("/super-admin/white-label-packages")
    } catch (err: any) {
      toast.error(err?.message || "Update failed")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/super-admin/white-label-packages">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit white label package</CardTitle>
          <CardDescription>Pricing, features, and visibility</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="features">Features (one per line) *</Label>
              <Textarea id="features" rows={6} value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₦) *</Label>
                <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing_cycle">Billing *</Label>
                <select
                  id="billing_cycle"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value)}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="active">Active</Label>
              <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/super-admin/white-label-packages">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
