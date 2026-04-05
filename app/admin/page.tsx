"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Wallet, TrendingUp, Home, CheckCircle, Clock, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { usePageLoading } from "@/hooks/use-loading"
import { apiFetch } from "@/lib/api/client"

interface DashboardData {
  tenant?: {
    name: string
  }
  stats: {
    total_members: number
    total_contributions: number
    total_loans: number
    total_investments: number
    total_properties: number
    active_properties: number
    monthly_revenue: number
    revenue_growth: number
    member_growth: number
  }
  pending_approvals: {
    kyc: number
    loans: number
    withdrawals: number
  }
  recent_activities: Array<{
    id: string
    type: string
    user: string
    action: string
    amount: string | null
    time: string
    status: string
  }>
}

function emptyDashboardPayload(): DashboardData {
  return {
    stats: {
      total_members: 0,
      total_contributions: 0,
      total_loans: 0,
      total_investments: 0,
      total_properties: 0,
      active_properties: 0,
      monthly_revenue: 0,
      revenue_growth: 0,
      member_growth: 0,
    },
    pending_approvals: { kyc: 0, loans: 0, withdrawals: 0 },
    recent_activities: [],
  }
}

/** Accepts flat JSON or `{ data: { ... } }` from proxies/older API wrappers */
function normalizeAdminDashboardPayload(raw: unknown): DashboardData {
  if (!raw || typeof raw !== "object") return emptyDashboardPayload()
  const r = raw as Record<string, unknown>
  const inner = (r.data && typeof r.data === "object" ? r.data : r) as Record<string, unknown>
  const base = emptyDashboardPayload()
  const stats = inner.stats as Record<string, unknown> | undefined
  if (stats && typeof stats === "object") {
    base.stats = {
      total_members: Number(stats.total_members) || 0,
      total_contributions: Number(stats.total_contributions) || 0,
      total_loans: Number(stats.total_loans) || 0,
      total_investments: Number(stats.total_investments) || 0,
      total_properties: Number(stats.total_properties) || 0,
      active_properties: Number(stats.active_properties) || 0,
      monthly_revenue: Number(stats.monthly_revenue) || 0,
      revenue_growth: Number(stats.revenue_growth) || 0,
      member_growth: Number(stats.member_growth) || 0,
    }
  }
  const pending = inner.pending_approvals as Record<string, unknown> | undefined
  if (pending && typeof pending === "object") {
    base.pending_approvals = {
      kyc: Number(pending.kyc) || 0,
      loans: Number(pending.loans) || 0,
      withdrawals: Number(pending.withdrawals) || 0,
    }
  }
  if (Array.isArray(inner.recent_activities)) {
    base.recent_activities = inner.recent_activities as DashboardData["recent_activities"]
  }
  if (inner.tenant && typeof inner.tenant === "object") {
    base.tenant = inner.tenant as DashboardData["tenant"]
  }
  return base
}

export default function AdminDashboardPage() {
  const { isLoading, loadData } = usePageLoading()
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    loadData(async () => {
      try {
        const response = await apiFetch<unknown>("/admin/dashboard/admin-stats")
        console.log("Dashboard data loaded:", response)
        return normalizeAdminDashboardPayload(response)
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
        return emptyDashboardPayload()
      }
    }).then(setData)
  }, [loadData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-NG').format(num)
  }

  const stats = data ? [
    {
      title: "Total Members",
      value: formatNumber(data.stats?.total_members ?? 0),
      change: `${(data.stats?.member_growth ?? 0) >= 0 ? '+' : ''}${(data.stats?.member_growth ?? 0).toFixed(1)}%`,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Total Contributions",
      value: formatCurrency(data.stats?.total_contributions ?? 0),
      change: `${(data.stats?.revenue_growth ?? 0) >= 0 ? '+' : ''}${(data.stats?.revenue_growth ?? 0).toFixed(1)}%`,
      icon: Wallet,
      color: "text-green-600",
    },
    {
      title: "Active Loans",
      value: formatNumber(data.stats?.total_loans ?? 0),
      change: "+5%",
      icon: TrendingUp,
      color: "text-orange-600",
    },
    {
      title: "Properties",
      value: formatNumber(data.stats?.total_properties ?? 0),
      change: `${data.stats?.active_properties ?? 0} active`,
      icon: Home,
      color: "text-purple-600",
    },
  ] : []

  const pendingApprovals = data ? [
    { type: "KYC", count: data.pending_approvals?.kyc ?? 0, icon: Users, color: "bg-blue-100 text-blue-700" },
    { type: "Loans", count: data.pending_approvals?.loans ?? 0, icon: TrendingUp, color: "bg-orange-100 text-orange-700" },
    { type: "Withdrawals", count: data.pending_approvals?.withdrawals ?? 0, icon: DollarSign, color: "bg-green-100 text-green-700" },
  ] : []

  const recentActivities = data?.recent_activities || []

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of {data?.tenant?.name || 'Housing Management'} System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-600 mt-1">{stat.change} from last month</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Items requiring your attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {pendingApprovals.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.type}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${item.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{item.type}</p>
                      <p className="text-sm text-muted-foreground">Pending review</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-lg font-semibold">
                    {item.count}
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest member activities across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 py-3 border-b last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{activity.user}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                  {activity.amount && (
                    <div className="sm:text-right">
                      <p className="font-semibold">₦{activity.amount}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        activity.status === "approved" || activity.status === "completed"
                          ? "default"
                          : activity.status === "pending"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {activity.status === "approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                      {activity.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                      {activity.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">{activity.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No recent activities</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
