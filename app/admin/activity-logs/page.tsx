"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Download, User, DollarSign, FileText, Home, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getActivityLogs, exportReport } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"

// Icon mapping
const iconMap: Record<string, any> = {
  dollar: DollarSign,
  shield: Shield,
  home: Home,
  user: User,
  'file-text': FileText,
  file: FileText,
}

export default function ActivityLogsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [dateRange, setDateRange] = useState("this-month")
  const [loading, setLoading] = useState(true)
  const [activityLogs, setActivityLogs] = useState<any[]>([])

  useEffect(() => {
    fetchLogs()
  }, [searchQuery, filterType, dateRange])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const response = await getActivityLogs({
        search: searchQuery || undefined,
        module: filterType !== 'all' ? filterType : undefined,
        date_range: dateRange,
        per_page: 50,
      })
      if (response.success) {
        setActivityLogs(response.data || [])
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load activity logs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      await exportReport('activity-logs', { date_range: dateRange, search: searchQuery, module: filterType })
      toast({
        title: "Export initiated",
        description: "Your logs are being generated.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export logs",
        variant: "destructive",
      })
    }
  }

  const filteredLogs = activityLogs

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Activity Logs</h1>
            <p className="text-muted-foreground mt-1">Track all system activities and user actions</p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user, action, or details..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="loan">Loans</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="kyc">KYC</SelectItem>
                  <SelectItem value="property">Properties</SelectItem>
                  <SelectItem value="profile">Profile Updates</SelectItem>
                  <SelectItem value="report">Reports</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="admin">Admin Actions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Activity Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              {loading ? "Loading..." : `Showing ${filteredLogs.length} ${filterType === "all" ? "" : filterType} activities`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No activity logs found</div>
            ) : (
              <div className="space-y-4">
                {filteredLogs.map((log) => {
                  const Icon = iconMap[log.icon] || FileText
                  return (
                    <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50">
                      <div className={`p-2 rounded-lg ${log.bgColor} flex-shrink-0`}>
                        <Icon className={`h-5 w-5 ${log.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium">{log.user}</p>
                            <p className="text-sm text-muted-foreground mt-0.5">{log.action}</p>
                          </div>
                          <Badge variant="outline" className="capitalize flex-shrink-0">
                            {log.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{log.details}</p>
                        <p className="text-xs text-muted-foreground mt-2">{log.timestamp}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
