"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { apiFetch } from "@/lib/api/client"
import { useRouter } from "next/navigation"

export default function NewPackagePage() {
  const router = useRouter()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const packageData = {
        ...formData,
        price: parseFloat(formData.price),
        trial_days: parseInt(formData.trial_days),
        limits: {
          ...formData.limits,
          max_members: parseInt(formData.limits.max_members),
          max_properties: parseInt(formData.limits.max_properties),
          max_loan_products: parseInt(formData.limits.max_loan_products),
          max_contribution_plans: parseInt(formData.limits.max_contribution_plans),
          max_investment_plans: parseInt(formData.limits.max_investment_plans),
          max_mortgage_plans: parseInt(formData.limits.max_mortgage_plans),
          storage_gb: parseInt(formData.limits.storage_gb),
          max_admins: parseInt(formData.limits.max_admins),
        }
      }
      
      await apiFetch("/super-admin/packages", {
        method: 'POST',
        body: packageData
      })
      
      // Redirect back to packages list
      router.push("/super-admin/packages")
    } catch (error) {
      console.error('Failed to create package:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLimitChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      limits: {
        ...prev.limits,
        [key]: value,
      },
    }))
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
          <h1 className="text-3xl font-bold">Create New Package</h1>
          <p className="text-muted-foreground mt-2">Define a new subscription package with limits</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Package Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Professional"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    placeholder="e.g., professional"
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
                  placeholder="Describe what this package offers..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₦)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="29.99"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing_cycle">Billing Cycle</Label>
                  <select
                    id="billing_cycle"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.billing_cycle}
                    onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trial_days">Trial Days</Label>
                  <Input
                    id="trial_days"
                    type="number"
                    placeholder="14"
                    value={formData.trial_days}
                    onChange={(e) => setFormData({ ...formData, trial_days: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">Active Package</Label>
                  <p className="text-sm text-muted-foreground">Make this package available for purchase</p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
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
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Package Limits</h2>
            <p className="text-sm text-muted-foreground mb-4">Set -1 for unlimited access</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="max_members">Maximum Members Registration</Label>
                <Input
                  id="max_members"
                  type="number"
                  placeholder="100"
                  value={formData.limits.max_members}
                  onChange={(e) => handleLimitChange("max_members", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_properties">Maximum Property Listings</Label>
                <Input
                  id="max_properties"
                  type="number"
                  placeholder="20"
                  value={formData.limits.max_properties}
                  onChange={(e) => handleLimitChange("max_properties", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_loan_products">Maximum Loan Plans</Label>
                <Input
                  id="max_loan_products"
                  type="number"
                  placeholder="5"
                  value={formData.limits.max_loan_products}
                  onChange={(e) => handleLimitChange("max_loan_products", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_contribution_plans">Maximum Contribution Plans</Label>
                <Input
                  id="max_contribution_plans"
                  type="number"
                  placeholder="3"
                  value={formData.limits.max_contribution_plans}
                  onChange={(e) => handleLimitChange("max_contribution_plans", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_mortgage_plans">Maximum Mortgage Plans</Label>
                <Input
                  id="max_mortgage_plans"
                  type="number"
                  placeholder="2"
                  value={formData.limits.max_mortgage_plans}
                  onChange={(e) => handleLimitChange("max_mortgage_plans", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_investment_plans">Maximum Investment Plans</Label>
                <Input
                  id="max_investment_plans"
                  type="number"
                  placeholder="2"
                  value={formData.limits.max_investment_plans}
                  onChange={(e) => handleLimitChange("max_investment_plans", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage_gb">Storage (GB)</Label>
                <Input
                  id="storage_gb"
                  type="number"
                  placeholder="5"
                  value={formData.limits.storage_gb}
                  onChange={(e) => handleLimitChange("storage_gb", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_admins">Maximum Admins</Label>
                <Input
                  id="max_admins"
                  type="number"
                  placeholder="2"
                  value={formData.limits.max_admins}
                  onChange={(e) => handleLimitChange("max_admins", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t mt-6">
              <div className="space-y-0.5">
                <Label htmlFor="has_role_management">Role Management Access</Label>
                <p className="text-sm text-muted-foreground">
                  Enable advanced role and permission management (typically for Enterprise tier)
                </p>
              </div>
              <Switch
                id="has_role_management"
                checked={formData.limits.has_role_management}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    limits: {
                      ...prev.limits,
                      has_role_management: checked,
                    },
                  }))
                }
              />
            </div>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Creating..." : "Create Package"}
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
