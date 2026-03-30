"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Loader2 } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { toast as sonnerToast } from "sonner"

export default function EditContributionPlanPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: "",
    minimum_amount: "",
    frequency: "monthly",
    is_mandatory: false,
    is_active: true,
  })

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        setLoading(true)
        const res = await apiFetch<{
          success: boolean
          data: {
            name: string
            description?: string
            amount: number
            minimum_amount: number
            frequency: string
            is_mandatory: boolean
            is_active: boolean
          }
        }>(`/admin/contribution-plans/${id}`)
        if (res.success && res.data) {
          const p = res.data
          setFormData({
            name: p.name,
            description: p.description ?? "",
            amount: String(p.amount),
            minimum_amount: String(p.minimum_amount),
            frequency: p.frequency,
            is_mandatory: p.is_mandatory,
            is_active: p.is_active,
          })
        }
      } catch (e: any) {
        sonnerToast.error(e?.message || "Failed to load plan")
        router.push("/admin/contribution-plans")
      } finally {
        setLoading(false)
      }
    })()
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const min = parseFloat(formData.minimum_amount)
    const amount = parseFloat(formData.amount)
    if (!formData.name.trim() || !Number.isFinite(min) || !Number.isFinite(amount)) {
      sonnerToast.error("Please enter valid amounts and name")
      return
    }
    if (min > amount) {
      sonnerToast.error("Minimum amount cannot exceed the plan amount")
      return
    }
    try {
      setSaving(true)
      const res = await apiFetch<{ success: boolean; message?: string }>(`/admin/contribution-plans/${id}`, {
        method: "PUT",
        body: {
          ...formData,
          amount,
          minimum_amount: min,
        },
      })
      if (res.success) {
        sonnerToast.success(res.message || "Plan updated")
        router.push(`/admin/contribution-plans/${id}`)
      }
    } catch (err: any) {
      sonnerToast.error(err?.message || "Update failed")
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
      <div>
        <Link href={`/admin/contribution-plans/${id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to plan
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit contribution plan</h1>
        <p className="text-muted-foreground mt-1">Update plan settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Plan details</CardTitle>
            <CardDescription>All fields apply to future contributions where relevant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₦) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimum_amount">Minimum (₦) *</Label>
                <Input
                  id="minimum_amount"
                  type="number"
                  step="0.01"
                  value={formData.minimum_amount}
                  onChange={(e) => setFormData({ ...formData, minimum_amount: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Frequency *</Label>
              <Select
                value={formData.frequency}
                onValueChange={(v) => setFormData({ ...formData, frequency: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                  <SelectItem value="one_time">One time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="mandatory">Mandatory for members</Label>
              <Switch
                id="mandatory"
                checked={formData.is_mandatory}
                onCheckedChange={(v) => setFormData({ ...formData, is_mandatory: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="active">Active</Label>
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
              />
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
