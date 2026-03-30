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
import { getInvestmentPlan, updateInvestmentPlan } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"

export default function EditInvestmentPlanPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const id = params?.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    min_amount: "",
    max_amount: "",
    expected_return_rate: "",
    min_duration_months: "",
    max_duration_months: "",
    return_type: "quarterly",
    risk_level: "medium",
  })

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        setLoading(true)
        const res = await getInvestmentPlan(id)
        if (res.success && res.data) {
          const p = res.data as any
          setIsActive(!!p.is_active)
          setFormData({
            name: p.name ?? "",
            description: p.description ?? "",
            min_amount: String(p.min_amount ?? ""),
            max_amount: String(p.max_amount ?? ""),
            expected_return_rate: String(p.expected_return_rate ?? ""),
            min_duration_months: String(p.min_duration_months ?? ""),
            max_duration_months: String(p.max_duration_months ?? ""),
            return_type: p.return_type ?? "quarterly",
            risk_level: p.risk_level ?? "medium",
          })
        }
      } catch (e: any) {
        toast({ title: "Error", description: e?.message || "Failed to load plan", variant: "destructive" })
        router.push("/admin/investment-plans")
      } finally {
        setLoading(false)
      }
    })()
  }, [id, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const res = await updateInvestmentPlan(id, {
        name: formData.name,
        description: formData.description || null,
        min_amount: parseFloat(formData.min_amount),
        max_amount: parseFloat(formData.max_amount),
        expected_return_rate: parseFloat(formData.expected_return_rate),
        min_duration_months: parseInt(formData.min_duration_months, 10),
        max_duration_months: parseInt(formData.max_duration_months, 10),
        return_type: formData.return_type,
        risk_level: formData.risk_level,
        is_active: isActive,
      })
      if (res.success) {
        toast({ title: "Saved", description: res.message || "Plan updated" })
        router.push(`/admin/investment-plans/${id}`)
      }
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Update failed", variant: "destructive" })
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
        <Link href={`/admin/investment-plans/${id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit investment plan</h1>
        <p className="text-muted-foreground mt-1">Adjust terms and visibility</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Plan</CardTitle>
            <CardDescription>Core settings</CardDescription>
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
            <div className="flex items-center justify-between">
              <Label htmlFor="active">Active</Label>
              <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_amount">Min (₦) *</Label>
                <Input
                  id="min_amount"
                  type="number"
                  value={formData.min_amount}
                  onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_amount">Max (₦) *</Label>
                <Input
                  id="max_amount"
                  type="number"
                  value={formData.max_amount}
                  onChange={(e) => setFormData({ ...formData, max_amount: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate">Expected return (% p.a.) *</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.1"
                  value={formData.expected_return_rate}
                  onChange={(e) => setFormData({ ...formData, expected_return_rate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Risk *</Label>
                <Select
                  value={formData.risk_level}
                  onValueChange={(v) => setFormData({ ...formData, risk_level: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_d">Min duration (months) *</Label>
                <Input
                  id="min_d"
                  type="number"
                  value={formData.min_duration_months}
                  onChange={(e) => setFormData({ ...formData, min_duration_months: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_d">Max duration (months) *</Label>
                <Input
                  id="max_d"
                  type="number"
                  value={formData.max_duration_months}
                  onChange={(e) => setFormData({ ...formData, max_duration_months: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Return type *</Label>
              <Select
                value={formData.return_type}
                onValueChange={(v) => setFormData({ ...formData, return_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="lump_sum">Lump sum</SelectItem>
                </SelectContent>
              </Select>
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
              "Save"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
