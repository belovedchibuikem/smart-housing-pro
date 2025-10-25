"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"

interface PackageFormData {
  name: string
  slug: string
  description: string
  price: number
  billing_cycle: string
  trial_days: number
  is_active: boolean
  is_featured: boolean
  limits: {
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
}

export default function EditMemberSubscriptionPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isLoading, data, error, loadData } = usePageLoading<{ package: PackageFormData }>()
  const [formData, setFormData] = useState<PackageFormData>({
    name: "",
    slug: "",
    description: "",
    price: 0,
    billing_cycle: "monthly",
    trial_days: 7,
    is_active: true,
    is_featured: false,
    limits: {
      max_members: 100,
      max_properties: 50,
      max_loan_products: 10,
      max_contribution_plans: 5,
      max_investment_plans: 3,
      max_mortgage_plans: 2,
      storage_gb: 10,
      max_admins: 3,
      has_role_management: false,
    },
  })

  useEffect(() => {
    loadData(async () => {
      const response = await apiFetch<{ package: PackageFormData }>(`/super-admin/member-subscriptions/${resolvedParams.id}`)
      return response
    })
  }, [loadData, resolvedParams.id])

  useEffect(() => {
    if (data?.package) {
      setFormData({
        name: data.package.name || "",
        slug: data.package.slug || "",
        description: data.package.description || "",
        price: data.package.price || 0,
        billing_cycle: data.package.billing_cycle || "monthly",
        trial_days: data.package.trial_days || 7,
        is_active: data.package.is_active ?? true,
        is_featured: data.package.is_featured ?? false,
        limits: {
          max_members: data.package.limits?.max_members || 100,
          max_properties: data.package.limits?.max_properties || 50,
          max_loan_products: data.package.limits?.max_loan_products || 10,
          max_contribution_plans: data.package.limits?.max_contribution_plans || 5,
          max_investment_plans: data.package.limits?.max_investment_plans || 3,
          max_mortgage_plans: data.package.limits?.max_mortgage_plans || 2,
          storage_gb: data.package.limits?.storage_gb || 10,
          max_admins: data.package.limits?.max_admins || 3,
          has_role_management: data.package.limits?.has_role_management ?? false,
        },
      })
    }
  }, [data])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await apiFetch(`/super-admin/member-subscriptions/${resolvedParams.id}`, {
        method: 'PUT',
        body: formData
      })
      router.push(`/super-admin/member-subscriptions/${resolvedParams.id}`)
    } catch (error) {
      console.error('Failed to update package:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (isLoading || !data) return null // Let the skeleton loader handle the display

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/super-admin/member-subscriptions/${resolvedParams.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Package</h1>
          <p className="text-muted-foreground">Update subscription package details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Package name, description, and pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Package Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Monthly Standard"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="monthly-standard"
                  value={formData.slug || ""}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (₦)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="1500"
                  value={formData.price || 0}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing_cycle">Billing Cycle</Label>
                <Select
                  value={formData.billing_cycle}
                  onValueChange={(value) => setFormData({ ...formData, billing_cycle: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trial_days">Trial Days</Label>
                <Input
                  id="trial_days"
                  type="number"
                  placeholder="7"
                  value={formData.trial_days || 0}
                  onChange={(e) => setFormData({ ...formData, trial_days: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this package offers..."
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Package Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Package Settings</CardTitle>
            <CardDescription>Package status and visibility settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Active Package</Label>
                <p className="text-sm text-muted-foreground">Make this package available for subscription</p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_featured">Featured Package</Label>
                <p className="text-sm text-muted-foreground">Highlight this package as recommended</p>
              </div>
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Package Limits */}
        <Card>
          <CardHeader>
            <CardTitle>Package Limits</CardTitle>
            <CardDescription>Set resource limits and restrictions for this package</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="max_members">Max Members</Label>
                <Input
                  id="max_members"
                  type="number"
                  placeholder="100"
                  value={formData.limits.max_members || 0}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    limits: { ...formData.limits, max_members: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_properties">Max Properties</Label>
                <Input
                  id="max_properties"
                  type="number"
                  placeholder="50"
                  value={formData.limits.max_properties || 0}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    limits: { ...formData.limits, max_properties: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_loan_products">Max Loan Products</Label>
                <Input
                  id="max_loan_products"
                  type="number"
                  placeholder="10"
                  value={formData.limits.max_loan_products || 0}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    limits: { ...formData.limits, max_loan_products: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_contribution_plans">Max Contribution Plans</Label>
                <Input
                  id="max_contribution_plans"
                  type="number"
                  placeholder="5"
                  value={formData.limits.max_contribution_plans || 0}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    limits: { ...formData.limits, max_contribution_plans: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_investment_plans">Max Investment Plans</Label>
                <Input
                  id="max_investment_plans"
                  type="number"
                  placeholder="3"
                  value={formData.limits.max_investment_plans || 0}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    limits: { ...formData.limits, max_investment_plans: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_mortgage_plans">Max Mortgage Plans</Label>
                <Input
                  id="max_mortgage_plans"
                  type="number"
                  placeholder="2"
                  value={formData.limits.max_mortgage_plans || 0}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    limits: { ...formData.limits, max_mortgage_plans: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storage_gb">Storage (GB)</Label>
                <Input
                  id="storage_gb"
                  type="number"
                  placeholder="10"
                  value={formData.limits.storage_gb || 0}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    limits: { ...formData.limits, storage_gb: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_admins">Max Admins</Label>
                <Input
                  id="max_admins"
                  type="number"
                  placeholder="3"
                  value={formData.limits.max_admins || 0}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    limits: { ...formData.limits, max_admins: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="has_role_management">Role Management</Label>
                <p className="text-sm text-muted-foreground">Allow custom role management</p>
              </div>
              <Switch
                id="has_role_management"
                checked={formData.limits.has_role_management}
                onCheckedChange={(checked) => setFormData({ 
                  ...formData, 
                  limits: { ...formData.limits, has_role_management: checked }
                })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Updating..." : "Update Package"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/super-admin/member-subscriptions/${resolvedParams.id}`}>Cancel</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
