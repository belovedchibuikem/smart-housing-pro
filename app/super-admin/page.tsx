"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Building2, Users, DollarSign, TrendingUp, Package, CreditCard, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { apiFetch } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"

interface DashboardData {
  metrics: {
    total_businesses: number
    active_businesses: number
    trial_businesses: number
    total_revenue: number
    monthly_revenue: number
    total_members: number
    active_subscriptions: number
    past_due_subscriptions: number
    revenue_growth_percentage: number
    member_growth_percentage: number
  }
  recent_businesses: Array<{
    id: string
    name: string
    slug: string
    package: string
    status: string
    members: number
    revenue: number
    joined_date: string
    logo_url?: string
    contact_email?: string
  }>
  alerts: Array<{
    type: string
    title: string
    message: string
    count: number
    action_url: string
  }>
}

export default function SuperAdminDashboard() {
  const { isLoading, data, error, loadData } = usePageLoading()

	useEffect(() => {
    loadData(async () => {
      const response = await apiFetch<{ data: DashboardData }>("/super-admin/dashboard/overview")
      return response.data
    })
	}, [loadData])

	if (error) return <div className="p-6 text-red-600">{error}</div>
  if (isLoading || !data) return null // Let the skeleton loader handle the display

  const { metrics, recent_businesses, alerts } = data || { metrics: {}, recent_businesses: [], alerts: [] }

	return (
      <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Platform overview and key metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Businesses</p>
              <p className="text-3xl font-bold mt-2">{metrics.total_businesses}</p>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">{metrics.active_businesses} active</span>
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
              <p className="text-3xl font-bold mt-2">₦{(metrics.monthly_revenue || 0).toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">
                {(metrics.revenue_growth_percentage || 0) > 0 ? '+' : ''}{metrics.revenue_growth_percentage || 0}% from last month
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Members</p>
              <p className="text-3xl font-bold mt-2">{(metrics.total_members || 0).toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">
                {(metrics.member_growth_percentage || 0) > 0 ? '+' : ''}{metrics.member_growth_percentage || 0}% from last month
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
              <p className="text-3xl font-bold mt-2">{metrics.active_subscriptions}</p>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-orange-600">{metrics.trial_businesses} in trial</span>
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{metrics.past_due_subscriptions} Past Due</p>
              <p className="text-sm text-muted-foreground">Subscriptions need attention</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/super-admin/subscriptions?status=past_due">View</Link>
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{metrics.trial_businesses} Trial Businesses</p>
              <p className="text-sm text-muted-foreground">Convert to paid plans</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/super-admin/businesses?status=trial">View</Link>
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
                    <p className="font-semibold">₦{(metrics.total_revenue || 0).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total revenue (all time)</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/super-admin/analytics">View</Link>
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Businesses */}
      <Card>
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Recent Businesses</h2>
              <p className="text-sm text-muted-foreground mt-1">Latest businesses that joined the platform</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/super-admin/businesses">View All</Link>
            </Button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recent_businesses.map((business: DashboardData['recent_businesses'][0]) => (
              <div key={business.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{business.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {business.slug} • {(business.members || 0).toLocaleString()} members
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{business.package}</p>
                    <p className="text-xs text-muted-foreground">
                      {business.status === "trial" ? "Trial" : `₦${business.revenue || 0}/mo`}
                    </p>
                  </div>
                  <div>
                    {business.status === "active" ? (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        Active
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-orange-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        Trial
                      </div>
                    )}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/super-admin/businesses/${business.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
      </div>
	)
}
