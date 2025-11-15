"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download, Filter, TrendingUp, DollarSign, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { getEquityContributionReport } from "@/lib/api/client"
import { exportReport } from "@/lib/utils/export"
import { toast } from "sonner"

const formatDate = (date: Date, formatStr = "PPP") => {
  if (formatStr === "PPP") {
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
}

export default function EquityContributionReportPage() {
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [status, setStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_contributions: 0,
    this_month: 0,
    total_payments: 0,
  })
  const [equityContributions, setEquityContributions] = useState<any[]>([])

  const loadReport = async () => {
    try {
      setLoading(true)
      const params: any = {
        status: status !== "all" ? status : undefined,
      }
      if (dateFrom) params.date_from = dateFrom.toISOString().split("T")[0]
      if (dateTo) params.date_to = dateTo.toISOString().split("T")[0]

      const response = await getEquityContributionReport(params)
      if (response.success) {
        setStats(response.stats)
        setEquityContributions(response.equity_contributions)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load equity contribution report")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReport()
  }, [status, dateFrom, dateTo])

  const handleReset = () => {
    setDateFrom(undefined)
    setDateTo(undefined)
    setStatus("all")
  }

  const handleExport = async (format: "PDF" | "Excel") => {
    try {
      const params: any = {
        status: status !== "all" ? status : undefined,
      }
      if (dateFrom) params.date_from = dateFrom.toISOString().split("T")[0]
      if (dateTo) params.date_to = dateTo.toISOString().split("T")[0]

      await exportReport("equity-contributions", format, params)
      toast.success(`Report exported successfully as ${format}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to export report")
    }
  }

  const displayStats = [
    {
      title: "Total Equity Contributions",
      value: `₦${stats.total_contributions.toLocaleString()}`,
      icon: DollarSign,
    },
    {
      title: "This Month",
      value: `₦${stats.this_month.toLocaleString()}`,
      icon: TrendingUp,
    },
    {
      title: "Total Payments",
      value: stats.total_payments.toString(),
      icon: DollarSign,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Equity Contribution Report</h1>
        <p className="text-muted-foreground mt-1">Track your equity contribution history and performance</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
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
                  <CardDescription>Filter your equity contribution data</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <Filter className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Equity Contribution History</CardTitle>
                  <CardDescription>Detailed breakdown of all your equity contributions</CardDescription>
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
              {equityContributions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No equity contributions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                        <th className="text-left py-3 px-4 font-medium">Reference</th>
                        <th className="text-right py-3 px-4 font-medium">Amount</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equityContributions.map((contribution) => (
                        <tr key={contribution.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">{contribution.date ? formatDate(new Date(contribution.date), "short") : "N/A"}</td>
                          <td className="py-3 px-4 font-mono text-sm">{contribution.reference}</td>
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

