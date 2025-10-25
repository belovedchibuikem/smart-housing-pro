"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Activity, User, Building2, Package, CreditCard, Settings } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"

interface ActivityLog {
  id: string
  type: string
  user: string
  description: string
  timestamp: string
  ip_address: string
  metadata: Record<string, any>
  causer?: {
    id: string
    name: string
    email: string
  }
}

export default function ActivityLogsPage() {
  const { isLoading, data, error, loadData } = usePageLoading<{ activities: ActivityLog[] }>()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")

  useEffect(() => {
    loadData(async () => {
      const response = await apiFetch<{ activities: ActivityLog[] }>("/super-admin/analytics/activity")
      return response
    })
  }, [loadData])

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (isLoading || !data) return null // Let the skeleton loader handle the display

  const activities = data?.activities || []

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "business_created":
      case "business_updated":
        return <Building2 className="h-5 w-5" />
      case "subscription_updated":
      case "subscription_created":
        return <CreditCard className="h-5 w-5" />
      case "package_created":
      case "package_updated":
        return <Package className="h-5 w-5" />
      case "user_login":
      case "user_created":
        return <User className="h-5 w-5" />
      case "settings_updated":
        return <Settings className="h-5 w-5" />
      default:
        return <Activity className="h-5 w-5" />
    }
  }

  const getActivityColor = (type: string) => {
    if (type.includes("created")) return "bg-green-100 text-green-700"
    if (type.includes("updated")) return "bg-blue-100 text-blue-700"
    if (type.includes("deleted")) return "bg-red-100 text-red-700"
    if (type.includes("login")) return "bg-purple-100 text-purple-700"
    return "bg-gray-100 text-gray-700"
  }

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      (activity.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      ((activity.causer?.name || activity.user || '')?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || activity.type.includes(filterType)
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Activity Logs</h1>
        <p className="text-muted-foreground mt-2">Monitor all platform activities and changes</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Activities</option>
            <option value="business">Business</option>
            <option value="subscription">Subscription</option>
            <option value="package">Package</option>
            <option value="user">User</option>
            <option value="settings">Settings</option>
          </select>
        </div>
      </Card>

      {/* Activity List */}
      <div className="space-y-3">
        {filteredActivities.map((activity) => (
          <Card key={activity.id} className="p-4">
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <p className="font-medium">{activity.description}</p>
                  <Badge variant="outline" className="text-xs whitespace-nowrap">
                    {activity.type.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {activity.causer?.name || activity.user}
                  </span>
                  <span>•</span>
                  <span>{new Date(activity.timestamp).toLocaleString()}</span>
                  <span>•</span>
                  <span>IP: {activity.ip_address}</span>
                </div>
                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                  <div className="mt-2 p-2 bg-muted rounded text-xs">
                    <details>
                      <summary className="cursor-pointer font-medium">View Details</summary>
                      <pre className="mt-2 whitespace-pre-wrap">
                        {JSON.stringify(activity.metadata, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <Card className="p-12 text-center">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">No activities found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </Card>
      )}
    </div>
  )
}