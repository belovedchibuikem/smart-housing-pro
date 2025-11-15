"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download, Filter, TrendingUp, TrendingDown, DollarSign, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { getContributionReport } from "@/lib/api/client"
import { exportReport } from "@/lib/utils/export"
import { toast } from "sonner"

const formatDate = (date: Date, formatStr = "PPP") => {
  if (formatStr === "PPP") {
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
}

export default function ContributionReportPage() {
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [status, setStatus] = useState("all")
  const [period, setPeriod] = useState("all")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_contributions: 0,
    this_month: 0,
    average_monthly: 0,
    total_payments: 0,
    monthly_change: 0,
  })
  const [contributions, setContributions] = useState<any[]>([])

  const loadReport = async () => {
    try {
      setLoading(true)
      const params: any = {
        status: status !== "all" ? status : undefined,
        period: period !== "all" ? period : undefined,
      }
      if (dateFrom) params.date_from = dateFrom.toISOString().split("T")[0]
      if (dateTo) params.date_to = dateTo.toISOString().split("T")[0]

      const response = await getContributionReport(params)
      if (response.success) {
        setStats(response.stats)
        setContributions(response.contributions)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load contribution report")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReport()
  }, [status, period, dateFrom, dateTo])

  const handleReset = () => {
    setDateFrom(undefined)
    setDateTo(undefined)
    setStatus("all")
    setPeriod("all")
  }

  const handleExport = async (format: "PDF" | "Excel") => {
    try {
      const params: any = {
        status: status !== "all" ? status : undefined,
        period: period !== "all" ? period : undefined,
      }
      if (dateFrom) params.date_from = dateFrom.toISOString().split("T")[0]
      if (dateTo) params.date_to = dateTo.toISOString().split("T")[0]

      await exportReport("contributions", format, params)
      toast.success(`Report exported successfully as ${format}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to export report")
    }
  }

  const displayStats = [
    {
      title: "Total Contributions",
      value: `₦${stats.total_contributions.toLocaleString()}`,
      change: `${stats.monthly_change >= 0 ? "+" : ""}${stats.monthly_change.toFixed(1)}%`,
      trend: stats.monthly_change >= 0 ? "up" : "down",
      icon: DollarSign,
    },
    {
      title: "This Month",
      value: `₦${stats.this_month.toLocaleString()}`,
      change: `${stats.monthly_change >= 0 ? "+" : ""}${stats.monthly_change.toFixed(1)}%`,
      trend: stats.monthly_change >= 0 ? "up" : "down",
      icon: TrendingUp,
    },
    {
      title: "Average Monthly",
      value: `₦${stats.average_monthly.toLocaleString()}`,
      change: `${stats.monthly_change >= 0 ? "+" : ""}${stats.monthly_change.toFixed(1)}%`,
      trend: stats.monthly_change >= 0 ? "up" : "down",
      icon: TrendingDown,
    },
    {
      title: "Total Payments",
      value: stats.total_payments.toString(),
      change: `+${stats.total_payments}`,
      trend: "up",
      icon: DollarSign,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Contribution Report</h1>
        <p className="text-muted-foreground mt-1">Comprehensive analysis of your contribution history and patterns</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {displayStats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p
                      className={cn(
                        "text-xs flex items-center gap-1 mt-1",
                        stat.trend === "up" ? "text-green-600" : "text-red-600",
                      )}
                    >
                      {stat.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {stat.change} from last period
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Advanced Filters</CardTitle>
                  <CardDescription>Filter your contribution data for detailed analysis</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <Filter className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>Date From</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? formatDate(dateFrom) : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Date To</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !dateTo && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? formatDate(dateTo) : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="approved">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Period</Label>
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Contribution History</CardTitle>
                  <CardDescription>Detailed breakdown of all your contributions</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExport("PDF")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport("Excel")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {contributions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No contributions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                        <th className="text-left py-3 px-4 font-medium">Reference</th>
                        <th className="text-left py-3 px-4 font-medium">Type</th>
                        <th className="text-right py-3 px-4 font-medium">Amount</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contributions.map((contribution) => (
                        <tr key={contribution.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">{contribution.date ? formatDate(new Date(contribution.date), "short") : "N/A"}</td>
                          <td className="py-3 px-4 font-mono text-sm">{contribution.reference}</td>
                          <td className="py-3 px-4">{contribution.type}</td>
                          <td className="py-3 px-4 text-right font-semibold">₦{contribution.amount.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <Badge variant={contribution.status === "approved" ? "default" : "secondary"}>
                              {contribution.status === "approved" ? "Completed" : contribution.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
