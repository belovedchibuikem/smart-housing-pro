"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Wallet, TrendingUp, Home, CheckCircle, Clock, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { usePageLoading } from "@/hooks/use-loading"

export default function AdminDashboardPage() {
  const { isLoading, loadData } = usePageLoading()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    // Simulate API call
    loadData(async () => {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      return { loaded: true }
    }).then(setData)
  }, [loadData])

  const stats = [
    {
      title: "Total Members",
      value: "1,234",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Total Contributions",
      value: "₦45.2M",
      change: "+8%",
      icon: Wallet,
      color: "text-green-600",
    },
    {
      title: "Active Loans",
      value: "156",
      change: "+5%",
      icon: TrendingUp,
      color: "text-orange-600",
    },
    {
      title: "Properties",
      value: "23",
      change: "+2",
      icon: Home,
      color: "text-purple-600",
    },
  ]

  const pendingApprovals = [
    { type: "KYC", count: 45, icon: Users, color: "bg-blue-100 text-blue-700" },
    { type: "Loans", count: 23, icon: TrendingUp, color: "bg-orange-100 text-orange-700" },
    { type: "Withdrawals", count: 12, icon: DollarSign, color: "bg-green-100 text-green-700" },
  ]

  const recentActivities = [
    {
      user: "John Doe",
      action: "Applied for housing loan",
      amount: "₦5,000,000",
      time: "2 hours ago",
      status: "pending",
    },
    {
      user: "Jane Smith",
      action: "Completed KYC verification",
      amount: null,
      time: "3 hours ago",
      status: "approved",
    },
    {
      user: "Mike Johnson",
      action: "Made monthly contribution",
      amount: "₦50,000",
      time: "5 hours ago",
      status: "completed",
    },
    {
      user: "Sarah Williams",
      action: "Invested in property",
      amount: "₦2,000,000",
      time: "1 day ago",
      status: "completed",
    },
  ]

  return (
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of FRSC Housing Management System</p>
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
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 py-3 border-b last:border-0"
              >
                <div className="flex-1">
                  <p className="font-medium">{activity.user}</p>
                  <p className="text-sm text-muted-foreground">{activity.action}</p>
                </div>
                {activity.amount && (
                  <div className="sm:text-right">
                    <p className="font-semibold">{activity.amount}</p>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      activity.status === "approved"
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
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
  )
}
