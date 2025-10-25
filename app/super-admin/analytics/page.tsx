"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Users, Building2 } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"

interface AnalyticsData {
  stats: {
    total_tenants: number
    active_tenants: number
    total_users: number
    total_transactions: number
    total_revenue: number
    monthly_revenue: Array<{
      month: string
      amount: number
    }>
    revenue_this_month: number
    new_tenants_this_month: number
    revenue_growth_percentage: number
    member_growth_percentage: number
    revenue_by_package: Array<{
      package_name: string
      business_count: number
      total_revenue: number
    }>
    system_health: {
      database_status: string
      api_status: string
      uptime: string
      last_backup: string
      active_connections: number
    }
  }
}

export default function SuperAdminAnalyticsPage() {
  const { isLoading, data, error, loadData } = usePageLoading<AnalyticsData>()

  useEffect(() => {
    loadData(async () => {
      const response = await apiFetch<AnalyticsData>("/super-admin/analytics/dashboard")
      return response
    })
  }, [loadData])

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (isLoading || !data) return null // Let the skeleton loader handle the display

  const { stats } = data

  const metrics = [
    {
      title: "Total Revenue",
      value: `₦${(stats?.total_revenue || 0).toLocaleString()}`,
      change: `${(stats?.revenue_growth_percentage || 0) > 0 ? '+' : ''}${stats?.revenue_growth_percentage || 0}%`,
      trend: (stats?.revenue_growth_percentage || 0) >= 0 ? "up" : "down",
      icon: DollarSign,
    },
    {
      title: "Active Businesses",
      value: (stats?.active_tenants || 0).toString(),
      change: `${stats?.new_tenants_this_month || 0} new this month`,
      trend: "up",
      icon: Building2,
    },
    {
      title: "Total Members",
      value: (stats?.total_users || 0).toString(),
      change: `${(stats?.member_growth_percentage || 0) > 0 ? '+' : ''}${stats?.member_growth_percentage || 0}%`,
      trend: (stats?.member_growth_percentage || 0) >= 0 ? "up" : "down",
      icon: Users,
    },
    {
      title: "System Uptime",
      value: stats?.system_health?.uptime || "99.9%",
      change: "Operational",
      trend: "up",
      icon: TrendingUp,
    },
  ]

  // Use real data from API or fallback to empty array
  const revenueByPackage = stats?.revenue_by_package?.map((pkg: any) => ({
    package: pkg.package_name,
    revenue: `₦${(pkg.total_revenue || 0).toLocaleString()}`,
    businesses: pkg.business_count || 0,
    percentage: stats?.revenue_by_package?.length > 0 ? 
      Math.round((pkg.total_revenue / stats.revenue_by_package.reduce((sum: number, p: any) => sum + p.total_revenue, 0)) * 100) : 0
  })) || []

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Analytics & Insights</h1>
        <p className="text-muted-foreground mt-1">Platform performance and business metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {metrics.map((metric) => (
          <Card key={metric.title} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <metric.icon className="h-6 w-6 text-primary" />
              </div>
              <div
                className={`flex items-center gap-1 text-sm ${
                  metric.trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {metric.trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {metric.change}
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{metric.value}</h3>
            <p className="text-sm text-muted-foreground">{metric.title}</p>
          </Card>
        ))}
      </div>

      {/* System Health */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">System Health</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold mb-1 text-green-600">{stats?.system_health?.uptime || "99.9%"}</div>
            <div className="text-sm text-muted-foreground">Uptime</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold mb-1 text-green-600">{stats?.system_health?.active_connections || 15}</div>
            <div className="text-sm text-muted-foreground">Active Connections</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold mb-1 text-blue-600">{stats?.system_health?.database_status || "Healthy"}</div>
            <div className="text-sm text-muted-foreground">Database Status</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold mb-1 text-green-600">{stats?.system_health?.api_status || "Operational"}</div>
            <div className="text-sm text-muted-foreground">API Status</div>
          </div>
        </div>
      </Card>

      {/* Revenue by Package */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Revenue by Package</h3>
        {revenueByPackage.length > 0 ? (
          <div className="space-y-4">
            {revenueByPackage.map((item) => (
              <div key={item.package}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium">{item.package}</span>
                    <span className="text-sm text-muted-foreground ml-2">({item.businesses} businesses)</span>
                  </div>
                  <span className="font-semibold">{item.revenue}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No package revenue data available</p>
          </div>
        )}
      </Card>

      {/* Monthly Revenue Chart */}
      {stats?.monthly_revenue && stats.monthly_revenue.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Revenue Trend</h3>
          <div className="space-y-2">
            {stats.monthly_revenue.map((month, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">{month.month}</span>
                <span className="font-semibold">₦{month.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}