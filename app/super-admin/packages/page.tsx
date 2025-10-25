"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Check, X } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { apiFetch } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"

interface Package {
  id: string
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
    storage_gb: number
    max_admins: number
  }
  subscribers: number
  created_at: string
  updated_at: string
}

export default function PackagesPage() {
  const { isLoading, data, error, loadData } = usePageLoading<{ packages: Package[] }>()

  useEffect(() => {
    loadData(async () => {
      const response = await apiFetch<{ packages: Package[] }>("/super-admin/packages")
      return response
    })
  }, [loadData])

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (isLoading || !data) return null // Let the skeleton loader handle the display

  const packages = data?.packages || []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription Packages</h1>
          <p className="text-muted-foreground mt-2">Manage pricing plans and feature limits</p>
        </div>
        <Button asChild>
          <Link href="/super-admin/packages/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Package
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <Card key={pkg.id} className={pkg.is_featured ? "border-primary border-2" : ""}>
            {pkg.is_featured && (
              <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium rounded-t-lg">
                Most Popular
              </div>
            )}
            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold">{pkg.name}</h3>
                  {pkg.is_active ? (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <Check className="h-4 w-4" />
                      Active
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <X className="h-4 w-4" />
                      Inactive
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">{pkg.description}</p>
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  {pkg.price === 0 ? (
                    <span className="text-4xl font-bold">Free</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">₦{pkg.price}</span>
                      <span className="text-muted-foreground">/{pkg.billing_cycle}</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {pkg.billing_cycle === "trial" ? `${pkg.trial_days} days trial` : `${pkg.trial_days} days free trial`}
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <p className="text-sm font-medium">Package Limits:</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Members:</span>
                    <span className="font-medium text-foreground">
                      {pkg.limits.max_members === -1 ? "Unlimited" : pkg.limits.max_members}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Properties:</span>
                    <span className="font-medium text-foreground">
                      {pkg.limits.max_properties === -1 ? "Unlimited" : pkg.limits.max_properties}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Loan Products:</span>
                    <span className="font-medium text-foreground">
                      {pkg.limits.max_loan_products === -1 ? "Unlimited" : pkg.limits.max_loan_products}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage:</span>
                    <span className="font-medium text-foreground">{pkg.limits.storage_gb} GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Admins:</span>
                    <span className="font-medium text-foreground">
                      {pkg.limits.max_admins === -1 ? "Unlimited" : pkg.limits.max_admins}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  <span className="font-medium text-foreground">{pkg.subscribers}</span> active subscribers
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 bg-transparent" asChild>
                    <Link href={`/super-admin/packages/${pkg.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:text-destructive bg-transparent"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
