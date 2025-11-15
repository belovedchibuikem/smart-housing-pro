"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download, Filter, DollarSign, Percent, Clock, CheckCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getLoanReport } from "@/lib/api/client"
import { exportReport } from "@/lib/utils/export"
import { toast } from "sonner"

const formatDate = (date: Date, formatStr = "PPP") => {
  if (formatStr === "PPP") {
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
}

export default function LoanReportPage() {
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [status, setStatus] = useState("all")
  const [loanType, setLoanType] = useState("all")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_borrowed: 0,
    total_repaid: 0,
    outstanding_balance: 0,
    interest_paid: 0,
  })
  const [loans, setLoans] = useState<any[]>([])

  const loadReport = async () => {
    try {
      setLoading(true)
      const params: any = {
        status: status !== "all" ? status : undefined,
        loan_type: loanType !== "all" ? loanType : undefined,
      }
      if (dateFrom) params.date_from = dateFrom.toISOString().split("T")[0]
      if (dateTo) params.date_to = dateTo.toISOString().split("T")[0]

      const response = await getLoanReport(params)
      if (response.success) {
        setStats(response.stats)
        setLoans(response.loans)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load loan report")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReport()
  }, [status, loanType, dateFrom, dateTo])

  const handleReset = () => {
    setDateFrom(undefined)
    setDateTo(undefined)
    setStatus("all")
    setLoanType("all")
  }

  const handleExport = async (format: "PDF" | "Excel") => {
    try {
      const params: any = {
        status: status !== "all" ? status : undefined,
        loan_type: loanType !== "all" ? loanType : undefined,
      }
      if (dateFrom) params.date_from = dateFrom.toISOString().split("T")[0]
      if (dateTo) params.date_to = dateTo.toISOString().split("T")[0]

      await exportReport("loans", format, params)
      toast.success(`Report exported successfully as ${format}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to export report")
    }
  }

  const displayStats = [
    {
      title: "Total Borrowed",
      value: `₦${stats.total_borrowed.toLocaleString()}`,
      icon: DollarSign,
    },
    {
      title: "Total Repaid",
      value: `₦${stats.total_repaid.toLocaleString()}`,
      icon: CheckCircle,
    },
    {
      title: "Outstanding Balance",
      value: `₦${stats.outstanding_balance.toLocaleString()}`,
      icon: Clock,
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
        <h1 className="text-2xl md:text-3xl font-bold">Loan Report</h1>
        <p className="text-muted-foreground mt-1">Monitor your loan history, repayments, and outstanding balances</p>
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
                  <CardDescription>Filter loans by type, status, and date range</CardDescription>
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
                  <Label>Loan Type</Label>
                  <Select value={loanType} onValueChange={setLoanType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="housing">Housing</SelectItem>
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
                      <SelectItem value="approved">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
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
                  <CardTitle>Loan History</CardTitle>
                  <CardDescription>Complete overview of all your loans and repayment progress</CardDescription>
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
              {loans.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No loans found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {loans.map((loan) => (
                    <div key={loan.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{loan.reference}</span>
                            <Badge variant="outline">{loan.type}</Badge>
                            <Badge variant={loan.status === "approved" ? "default" : "secondary"}>{loan.status}</Badge>
                          </div>
                          {loan.due_date && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Due: {formatDate(new Date(loan.due_date), "short")}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Interest Rate</div>
                          <div className="font-semibold">{loan.interest_rate}% p.a.</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Loan Amount</div>
                          <div className="font-semibold">₦{loan.amount.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Repaid</div>
                          <div className="font-semibold text-green-600">₦{loan.repaid.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Balance</div>
                          <div className="font-semibold text-red-600">₦{loan.balance.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Repayment Progress</span>
                          <span className="font-medium">{loan.progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={loan.progress} className="h-2" />
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
