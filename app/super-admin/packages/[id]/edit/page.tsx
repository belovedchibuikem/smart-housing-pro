"use client"

import type React from "react"
import { useEffect, useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { toast } from "sonner"

interface PackageLimits {
  max_members: number
  max_properties: number
  max_loan_products: number
  max_contribution_plans: number
  max_investment_plans: number
  max_mortgage_plans: number
  storage_gb: number
  max_admins: number
  has_role_management: boolean
}

interface PackageData {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  billing_cycle: string
  trial_days: number
  is_active: boolean
  is_featured: boolean
  limits: PackageLimits | null
  modules?: { id: string }[]
}

export default function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    billing_cycle: "monthly",
    trial_days: "14",
    is_active: true,
    is_featured: false,
    limits: {
      max_members: "",
      max_properties: "",
      max_loan_products: "",
      max_contribution_plans: "",
      max_investment_plans: "",
      max_mortgage_plans: "",
      storage_gb: "",
      max_admins: "",
      has_role_management: false,
    },
  })
  const [moduleIds, setModuleIds] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const res = await apiFetch<{ package: PackageData }>(`/super-admin/packages/${id}`)
        if (cancelled || !res.package) return
        const p = res.package
        const lim = p.limits || {
          max_members: 100,
          max_properties: 50,
          max_loan_products: 10,
          max_contribution_plans: 5,
          max_investment_plans: 3,
          max_mortgage_plans: 2,
          storage_gb: 10,
          max_admins: 3,
          has_role_management: false,
        }
        setFormData({
          name: p.name || "",
          slug: p.slug || "",
          description: p.description || "",
          price: String(p.price ?? ""),
          billing_cycle: p.billing_cycle || "monthly",
          trial_days: String(p.trial_days ?? 14),
          is_active: !!p.is_active,
          is_featured: !!p.is_featured,
          limits: {
            max_members: String(lim.max_members ?? ""),
            max_properties: String(lim.max_properties ?? ""),
            max_loan_products: String(lim.max_loan_products ?? ""),
            max_contribution_plans: String(lim.max_contribution_plans ?? ""),
            max_investment_plans: String(lim.max_investment_plans ?? ""),
            max_mortgage_plans: String(lim.max_mortgage_plans ?? ""),
            storage_gb: String(lim.storage_gb ?? ""),
            max_admins: String(lim.max_admins ?? ""),
            has_role_management: !!lim.has_role_management,
          },
        })
        setModuleIds((p.modules || []).map((m) => m.id))
      } catch (e: any) {
        toast.error(e?.message || "Failed to load package")
        router.push("/super-admin/packages")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, router])

  const handleLimitChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      limits: { ...prev.limits, [key]: value },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const packageData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        price: parseFloat(formData.price),
        billing_cycle: formData.billing_cycle,
        trial_days: parseInt(formData.trial_days, 10),
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        limits: {
          max_members: parseInt(formData.limits.max_members, 10),
          max_properties: parseInt(formData.limits.max_properties, 10),
          max_loan_products: parseInt(formData.limits.max_loan_products, 10),
          max_contribution_plans: parseInt(formData.limits.max_contribution_plans, 10),
          max_investment_plans: parseInt(formData.limits.max_investment_plans, 10),
          max_mortgage_plans: parseInt(formData.limits.max_mortgage_plans, 10),
          storage_gb: parseInt(formData.limits.storage_gb, 10),
          max_admins: parseInt(formData.limits.max_admins, 10),
          has_role_management: formData.limits.has_role_management,
        },
        modules: moduleIds.length ? moduleIds : undefined,
      }
      await apiFetch(`/super-admin/packages/${id}`, { method: "PUT", body: packageData })
      toast.success("Package updated")
      router.push("/super-admin/packages")
    } catch (e: any) {
      toast.error(e?.message || "Failed to update package")
    } finally {
      setIsSubmitting(false)
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
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/super-admin/packages">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit subscription package</h1>
          <p className="text-muted-foreground mt-2">Business subscription plans and limits</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Basic information</h2>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Package name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₦) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing_cycle">Billing cycle *</Label>
                  <select
                    id="billing_cycle"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.billing_cycle}
                    onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trial_days">Trial days *</Label>
                  <Input
                    id="trial_days"
                    type="number"
                    value={formData.trial_days}
                    onChange={(e) => setFormData({ ...formData, trial_days: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <Label htmlFor="is_featured">Featured</Label>
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Package limits</h2>
            <p className="text-sm text-muted-foreground mb-4">Use -1 for unlimited</p>
            <div className="grid gap-4 md:grid-cols-2">
              {(
                [
                  ["max_members", "Maximum members"],
                  ["max_properties", "Maximum properties"],
                  ["max_loan_products", "Maximum loan products"],
                  ["max_contribution_plans", "Maximum contribution plans"],
                  ["max_investment_plans", "Maximum investment plans"],
                  ["max_mortgage_plans", "Maximum mortgage plans"],
                  ["storage_gb", "Storage (GB)"],
                  ["max_admins", "Maximum admins"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    type="number"
                    value={formData.limits[key]}
                    onChange={(e) => handleLimitChange(key, e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-6 border-t mt-6">
              <div>
                <Label>Role management</Label>
                <p className="text-sm text-muted-foreground">Advanced roles for enterprise-style tenants</p>
              </div>
              <Switch
                checked={formData.limits.has_role_management}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    limits: { ...prev.limits, has_role_management: checked },
                  }))
                }
              />
            </div>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/super-admin/packages">Cancel</Link>
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
