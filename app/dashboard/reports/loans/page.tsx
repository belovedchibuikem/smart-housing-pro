"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download, Filter, DollarSign, Percent, Clock, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

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

  const stats = [
    {
      title: "Total Borrowed",
      value: "₦3,500,000",
      icon: DollarSign,
    },
    {
      title: "Total Repaid",
      value: "₦1,200,000",
      icon: CheckCircle,
    },
    {
      title: "Outstanding Balance",
      value: "₦2,300,000",
      icon: Clock,
    },
    {
      title: "Interest Paid",
      value: "₦180,000",
      icon: Percent,
    },
  ]

  const loans = [
    {
      id: 1,
      reference: "LOAN-2024-001",
      type: "Personal",
      amount: 1000000,
      repaid: 400000,
      balance: 600000,
      interestRate: 12,
      status: "Active",
      dueDate: "2025-06-15",
      progress: 40,
    },
    {
      id: 2,
      reference: "LOAN-2023-045",
      type: "Emergency",
      amount: 500000,
      repaid: 500000,
      balance: 0,
      interestRate: 10,
      status: "Completed",
      dueDate: "2024-12-01",
      progress: 100,
    },
    {
      id: 3,
      reference: "LOAN-2024-012",
      type: "Housing",
      amount: 2000000,
      repaid: 300000,
      balance: 1700000,
      interestRate: 15,
      status: "Active",
      dueDate: "2026-03-20",
      progress: 15,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Loan Report</h1>
        <p className="text-muted-foreground mt-1">Monitor your loan history, repayments, and outstanding balances</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
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
            <Button variant="outline" size="sm">
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
                  <SelectItem value="active">Active</SelectItem>
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
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loans.map((loan) => (
              <div key={loan.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{loan.reference}</span>
                      <Badge variant="outline">{loan.type}</Badge>
                      <Badge variant={loan.status === "Active" ? "default" : "secondary"}>{loan.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Due: {formatDate(new Date(loan.dueDate), "short")}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Interest Rate</div>
                    <div className="font-semibold">{loan.interestRate}% p.a.</div>
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
                    <span className="font-medium">{loan.progress}%</span>
                  </div>
                  <Progress value={loan.progress} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
