"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download, Filter, TrendingUp, Percent, DollarSign, PieChart, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { getInvestmentReport } from "@/lib/api/client"
import { exportReport } from "@/lib/utils/export"
import { toast } from "sonner"

const formatDate = (date: Date, formatStr = "PPP") => {
  if (formatStr === "PPP") {
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
}

export default function InvestmentReportPage() {
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [type, setType] = useState("all")
  const [status, setStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_invested: 0,
    current_value: 0,
    total_roi: 0,
    roi_percentage: 0,
    active_investments: 0,
  })
  const [investments, setInvestments] = useState<any[]>([])

  const loadReport = async () => {
    try {
      setLoading(true)
      const params: any = {
        type: type !== "all" ? type : undefined,
        status: status !== "all" ? status : undefined,
      }
      if (dateFrom) params.date_from = dateFrom.toISOString().split("T")[0]
      if (dateTo) params.date_to = dateTo.toISOString().split("T")[0]

      const response = await getInvestmentReport(params)
      if (response.success) {
        setStats(response.stats)
        setInvestments(response.investments)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load investment report")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReport()
  }, [type, status, dateFrom, dateTo])

  const handleReset = () => {
    setDateFrom(undefined)
    setDateTo(undefined)
    setType("all")
    setStatus("all")
  }

  const handleExport = async (format: "PDF" | "Excel") => {
    try {
      const params: any = {
        type: type !== "all" ? type : undefined,
        status: status !== "all" ? status : undefined,
      }
      if (dateFrom) params.date_from = dateFrom.toISOString().split("T")[0]
      if (dateTo) params.date_to = dateTo.toISOString().split("T")[0]

      await exportReport("investments", format, params)
      toast.success(`Report exported successfully as ${format}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to export report")
    }
  }

  const displayStats = [
    {
      title: "Total Invested",
      value: `₦${stats.total_invested.toLocaleString()}`,
      icon: DollarSign,
    },
    {
      title: "Current Value",
      value: `₦${stats.current_value.toLocaleString()}`,
      icon: TrendingUp,
    },
    {
      title: "Total ROI",
      value: `₦${stats.total_roi.toLocaleString()}`,
      icon: Percent,
    },
    {
      title: "Active Investments",
      value: stats.active_investments.toString(),
      icon: PieChart,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Investment Report</h1>
        <p className="text-muted-foreground mt-1">Track your investment portfolio performance and returns</p>
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
                    {stat.title === "Total ROI" && (
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3" />
                        {stats.roi_percentage.toFixed(2)}% ROI
                      </p>
                    )}
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
                  <CardDescription>Filter investments by type, status, and date range</CardDescription>
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
                  <Label>Investment Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="money">Money</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                      <SelectItem value="property">Property</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="matured">Matured</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
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
                  <CardTitle>Investment Portfolio</CardTitle>
                  <CardDescription>Detailed view of all your investments and their performance</CardDescription>
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
              {investments.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No investments found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Investment</th>
                        <th className="text-left py-3 px-4 font-medium">Type</th>
                        <th className="text-right py-3 px-4 font-medium">Amount Invested</th>
                        <th className="text-right py-3 px-4 font-medium">Current Value</th>
                        <th className="text-right py-3 px-4 font-medium">ROI</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investments.map((investment) => (
                        <tr key={investment.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{investment.name}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{investment.type}</Badge>
                          </td>
                          <td className="py-3 px-4 text-right">₦{investment.amount.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-semibold">₦{investment.current_value.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-green-600 font-semibold">+{investment.roi.toFixed(2)}%</td>
                          <td className="py-3 px-4">
                            <Badge variant={investment.status === "active" ? "default" : "secondary"}>
                              {investment.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{formatDate(new Date(investment.date), "short")}</td>
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
