"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download, Filter, DollarSign, Percent, Clock, Building2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getMortgageReport } from "@/lib/api/client"
import { exportReport } from "@/lib/utils/export"
import { toast } from "sonner"

const formatDate = (date: Date, formatStr = "PPP") => {
  if (formatStr === "PPP") {
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
}

export default function MortgageReportPage() {
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [mortgageType, setMortgageType] = useState("all")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_mortgages: 0,
    total_mortgage_amount: 0,
    total_repaid: 0,
    outstanding_balance: 0,
    interest_paid: 0,
  })
  const [mortgages, setMortgages] = useState<any[]>([])

  const loadReport = async () => {
    try {
      setLoading(true)
      const params: any = {
        mortgage_type: mortgageType !== "all" ? mortgageType : undefined,
      }
      if (dateFrom) params.date_from = dateFrom.toISOString().split("T")[0]
      if (dateTo) params.date_to = dateTo.toISOString().split("T")[0]

      const response = await getMortgageReport(params)
      if (response.success) {
        setStats(response.stats)
        setMortgages(response.mortgages)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load mortgage report")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReport()
  }, [mortgageType, dateFrom, dateTo])

  const handleReset = () => {
    setDateFrom(undefined)
    setDateTo(undefined)
    setMortgageType("all")
  }

  const handleExport = async (format: "PDF" | "Excel") => {
    try {
      const params: any = {
        mortgage_type: mortgageType !== "all" ? mortgageType : undefined,
      }
      if (dateFrom) params.date_from = dateFrom.toISOString().split("T")[0]
      if (dateTo) params.date_to = dateTo.toISOString().split("T")[0]

      await exportReport("mortgages", format, params)
      toast.success(`Report exported successfully as ${format}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to export report")
    }
  }

  const displayStats = [
    {
      title: "Total Mortgages",
      value: stats.total_mortgages.toString(),
      icon: Building2,
    },
    {
      title: "Total Mortgage Amount",
      value: `₦${stats.total_mortgage_amount.toLocaleString()}`,
      icon: DollarSign,
    },
    {
      title: "Total Repaid",
      value: `₦${stats.total_repaid.toLocaleString()}`,
      icon: Clock,
    },
    {
      title: "Outstanding Balance",
      value: `₦${stats.outstanding_balance.toLocaleString()}`,
      icon: DollarSign,
    },
    {
      title: "Interest Paid",
      value: `₦${stats.interest_paid.toLocaleString()}`,
      icon: Percent,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Mortgages Report</h1>
        <p className="text-muted-foreground mt-1">Comprehensive overview of your mortgages and internal mortgages</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
                  <CardDescription>Filter mortgages by type and date range</CardDescription>
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
                  <Label>Mortgage Type</Label>
                  <Select value={mortgageType} onValueChange={setMortgageType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="mortgage">External Mortgage</SelectItem>
                      <SelectItem value="internal">Internal Mortgage</SelectItem>
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
                  <CardTitle>Mortgage History</CardTitle>
                  <CardDescription>Complete overview of all your mortgages and repayment progress</CardDescription>
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
              {mortgages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No mortgages found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mortgages.map((mortgage) => (
                    <div key={mortgage.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{mortgage.reference}</span>
                            <Badge variant={mortgage.type === "mortgage" ? "default" : "secondary"}>
                              {mortgage.type === "mortgage" ? "External Mortgage" : "Internal Mortgage"}
                            </Badge>
                            <Badge variant={mortgage.status === "approved" || mortgage.status === "active" ? "default" : "secondary"}>
                              {mortgage.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Provider: {mortgage.provider}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Interest Rate</div>
                          <div className="font-semibold">{mortgage.interest_rate}% p.a.</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Mortgage Amount</div>
                          <div className="font-semibold">₦{mortgage.amount.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Repaid</div>
                          <div className="font-semibold text-green-600">₦{mortgage.repaid.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Balance</div>
                          <div className="font-semibold text-red-600">₦{mortgage.balance.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Monthly Payment</div>
                          <div className="font-semibold">₦{mortgage.monthly_payment.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Repayment Progress</span>
                          <span className="font-medium">{mortgage.progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={mortgage.progress} className="h-2" />
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Created: {formatDate(new Date(mortgage.created_at), "short")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

