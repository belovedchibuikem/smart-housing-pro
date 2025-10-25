"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Users, DollarSign, Calendar, CheckCircle, XCircle, Package, Settings } from "lucide-react"
import Link from "next/link"
import { useEffect, use } from "react"
import { apiFetch } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"

interface MemberSubscriptionPackage {
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
    max_mortgage_plans: number
    storage_gb: number
    max_admins: number
    has_role_management: boolean
  }
  subscribers: number
  created_at: string
  updated_at: string
}

export default function MemberSubscriptionPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { isLoading, data, error, loadData } = usePageLoading<{ package: MemberSubscriptionPackage }>()

  useEffect(() => {
    loadData(async () => {
      const response = await apiFetch<{ package: MemberSubscriptionPackage }>(`/super-admin/member-subscriptions/${resolvedParams.id}`)
      return response
    })
  }, [loadData, resolvedParams.id])

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (isLoading || !data) return null // Let the skeleton loader handle the display

  const packageData = data?.package

  if (!packageData) return null

  const limits = packageData.limits || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/super-admin/member-subscriptions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{packageData.name}</h1>
            {packageData.is_featured && (
              <Badge className="bg-primary text-primary-foreground">Featured</Badge>
            )}
            <Badge variant={packageData.is_active ? "default" : "secondary"}>
              {packageData.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-muted-foreground">{packageData.description}</p>
        </div>
        <Button asChild>
          <Link href={`/super-admin/member-subscriptions/${params.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Package
          </Link>
        </Button>
      </div>

      {/* Package Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{(packageData.price || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground capitalize">{packageData.billing_cycle}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(packageData.subscribers || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active subscribers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Trial Period</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{packageData.trial_days || 0}</div>
            <p className="text-xs text-muted-foreground">Days free trial</p>
          </CardContent>
        </Card>
      </div>

      {/* Package Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Package Information</CardTitle>
            <CardDescription>Basic package details and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Package Name</label>
                <p className="text-sm">{packageData.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Slug</label>
                <p className="text-sm font-mono">{packageData.slug}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm">{packageData.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Billing Cycle</label>
                <p className="text-sm capitalize">{packageData.billing_cycle}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="flex items-center gap-2">
                  {packageData.is_active ? (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      Active
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <XCircle className="h-4 w-4" />
                      Inactive
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Package Limits</CardTitle>
            <CardDescription>Resource limits and restrictions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex justify-between">
                <span className="text-sm">Max Members</span>
                <span className="text-sm font-medium">{limits.max_members === -1 ? 'Unlimited' : limits.max_members?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Max Properties</span>
                <span className="text-sm font-medium">{limits.max_properties === -1 ? 'Unlimited' : limits.max_properties?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Max Loan Products</span>
                <span className="text-sm font-medium">{limits.max_loan_products === -1 ? 'Unlimited' : limits.max_loan_products?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Max Contribution Plans</span>
                <span className="text-sm font-medium">{limits.max_contribution_plans === -1 ? 'Unlimited' : limits.max_contribution_plans?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Max Investment Plans</span>
                <span className="text-sm font-medium">{limits.max_investment_plans === -1 ? 'Unlimited' : limits.max_investment_plans?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Max Mortgage Plans</span>
                <span className="text-sm font-medium">{limits.max_mortgage_plans === -1 ? 'Unlimited' : limits.max_mortgage_plans?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Storage</span>
                <span className="text-sm font-medium">{limits.storage_gb === -1 ? 'Unlimited' : `${limits.storage_gb} GB`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Max Admins</span>
                <span className="text-sm font-medium">{limits.max_admins === -1 ? 'Unlimited' : limits.max_admins?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Role Management</span>
                <span className="text-sm font-medium">
                  {limits.has_role_management ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Enabled
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <XCircle className="h-4 w-4" />
                      Disabled
                    </div>
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Information */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Information</CardTitle>
          <CardDescription>Package revenue and subscriber metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold">₦{((packageData.price || 0) * (packageData.subscribers || 0)).toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">₦{(packageData.price || 0).toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Per Subscriber</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{(packageData.subscribers || 0).toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Active Subscribers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Package Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Package Actions</CardTitle>
          <CardDescription>Manage this subscription package</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button asChild>
              <Link href={`/super-admin/member-subscriptions/${params.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Package
              </Link>
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Package Settings
            </Button>
            <Button variant="outline">
              <Package className="h-4 w-4 mr-2" />
              View Subscribers
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
