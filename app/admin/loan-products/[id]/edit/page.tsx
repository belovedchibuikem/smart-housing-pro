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

export default function EditLoanProductPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    min_amount: "",
    max_amount: "",
    interest_rate: "",
    min_tenure_months: "",
    max_tenure_months: "",
    interest_type: "simple",
    processing_fee_percentage: "",
    late_payment_fee: "",
  })

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        setLoading(true)
        const res = await apiFetch<{ success: boolean; data: any }>(`/admin/loan-products/${id}`)
        if (res.success && res.data) {
          const p = res.data
          setIsActive(!!p.is_active)
          setFormData({
            name: p.name ?? "",
            description: p.description ?? "",
            min_amount: String(p.min_amount ?? ""),
            max_amount: String(p.max_amount ?? ""),
            interest_rate: String(p.interest_rate ?? ""),
            min_tenure_months: String(p.min_tenure_months ?? ""),
            max_tenure_months: String(p.max_tenure_months ?? ""),
            interest_type: p.interest_type ?? "simple",
            processing_fee_percentage:
              p.processing_fee_percentage != null ? String(p.processing_fee_percentage) : "",
            late_payment_fee: p.late_payment_fee != null ? String(p.late_payment_fee) : "",
          })
        }
      } catch (e: any) {
        sonnerToast.error(e?.message || "Failed to load product")
        router.push("/admin/loan-products")
      } finally {
        setLoading(false)
      }
    })()
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const res = await apiFetch<{ success: boolean; message?: string }>(`/admin/loan-products/${id}`, {
        method: "PUT",
        body: {
          ...formData,
          min_amount: parseFloat(formData.min_amount),
          max_amount: parseFloat(formData.max_amount),
          interest_rate: parseFloat(formData.interest_rate),
          min_tenure_months: parseInt(formData.min_tenure_months, 10),
          max_tenure_months: parseInt(formData.max_tenure_months, 10),
          processing_fee_percentage: formData.processing_fee_percentage
            ? parseFloat(formData.processing_fee_percentage)
            : null,
          late_payment_fee: formData.late_payment_fee ? parseFloat(formData.late_payment_fee) : null,
          is_active: isActive,
        },
      })
      if (res.success) {
        sonnerToast.success(res.message || "Product updated")
        router.push(`/admin/loan-products/${id}`)
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href={`/admin/loan-products/${id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to product
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit loan product</h1>
        <p className="text-muted-foreground mt-1">Update product terms</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic information</CardTitle>
            <CardDescription>Name and availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product name *</Label>
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
              <div>
                <Label htmlFor="active">Active</Label>
                <p className="text-sm text-muted-foreground">Offer to members</p>
              </div>
              <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loan terms</CardTitle>
            <CardDescription>Amounts and repayment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_amount">Min amount (₦) *</Label>
                <Input
                  id="min_amount"
                  type="number"
                  value={formData.min_amount}
                  onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_amount">Max amount (₦) *</Label>
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
                <Label htmlFor="interest_rate">Interest rate (% p.a.) *</Label>
                <Input
                  id="interest_rate"
                  type="number"
                  step="0.1"
                  value={formData.interest_rate}
                  onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Interest type *</Label>
                <Select
                  value={formData.interest_type}
                  onValueChange={(v) => setFormData({ ...formData, interest_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="compound">Compound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_tenure">Min tenure (months) *</Label>
                <Input
                  id="min_tenure"
                  type="number"
                  value={formData.min_tenure_months}
                  onChange={(e) => setFormData({ ...formData, min_tenure_months: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_tenure">Max tenure (months) *</Label>
                <Input
                  id="max_tenure"
                  type="number"
                  value={formData.max_tenure_months}
                  onChange={(e) => setFormData({ ...formData, max_tenure_months: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proc">Processing fee (%)</Label>
                <Input
                  id="proc"
                  type="number"
                  step="0.1"
                  value={formData.processing_fee_percentage}
                  onChange={(e) => setFormData({ ...formData, processing_fee_percentage: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="late">Late fee (₦)</Label>
                <Input
                  id="late"
                  type="number"
                  value={formData.late_payment_fee}
                  onChange={(e) => setFormData({ ...formData, late_payment_fee: e.target.value })}
                />
              </div>
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
