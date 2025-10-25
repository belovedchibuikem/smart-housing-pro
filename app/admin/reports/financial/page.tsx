"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function FinancialReportsPage() {
  const [dateRange, setDateRange] = useState("this-month")

  const stats = [
    {
      label: "Total Revenue",
      value: "₦125.5M",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-600",
      trend: "up",
    },
    {
      label: "Total Expenses",
      value: "₦45.2M",
      change: "+5.2%",
      icon: TrendingDown,
      color: "text-red-600",
      trend: "up",
    },
    { label: "Net Profit", value: "₦80.3M", change: "+18.3%", icon: TrendingUp, color: "text-blue-600", trend: "up" },
    { label: "Cash Balance", value: "₦250.8M", change: "+8.7%", icon: Wallet, color: "text-purple-600", trend: "up" },
  ]

  const transactions = [
    {
      id: "TXN001",
      date: "2024-03-15",
      type: "Contribution",
      category: "Income",
      amount: "₦2,500,000",
      status: "Completed",
    },
    {
      id: "TXN002",
      date: "2024-03-14",
      type: "Loan Disbursement",
      category: "Expense",
      amount: "₦5,000,000",
      status: "Completed",
    },
    {
      id: "TXN003",
      date: "2024-03-13",
      type: "Property Purchase",
      category: "Investment",
      amount: "₦15,000,000",
      status: "Completed",
    },
    {
      id: "TXN004",
      date: "2024-03-12",
      type: "Loan Repayment",
      category: "Income",
      amount: "₦450,000",
      status: "Completed",
    },
    {
      id: "TXN005",
      date: "2024-03-11",
      type: "Maintenance",
      category: "Expense",
      amount: "₦350,000",
      status: "Pending",
    },
  ]

  const monthlyData = [
    { month: "January", income: "₦42.5M", expenses: "₦15.2M", profit: "₦27.3M" },
    { month: "February", income: "₦38.8M", expenses: "₦14.8M", profit: "₦24.0M" },
    { month: "March", income: "₦44.2M", expenses: "₦15.2M", profit: "₦29.0M" },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground mt-1">Comprehensive financial analytics and statements</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stat.change} from last period
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Monthly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Financial Summary</CardTitle>
          <CardDescription>Income, expenses, and profit breakdown by month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Total Income</TableHead>
                  <TableHead className="text-right">Total Expenses</TableHead>
                  <TableHead className="text-right">Net Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyData.map((data) => (
                  <TableRow key={data.month}>
                    <TableCell className="font-medium">{data.month}</TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">{data.income}</TableCell>
                    <TableCell className="text-right text-red-600 font-semibold">{data.expenses}</TableCell>
                    <TableCell className="text-right text-blue-600 font-bold">{data.profit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest financial transactions across all categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-medium">{txn.id}</TableCell>
                    <TableCell>{txn.date}</TableCell>
                    <TableCell>{txn.type}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          txn.category === "Income"
                            ? "default"
                            : txn.category === "Expense"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {txn.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{txn.amount}</TableCell>
                    <TableCell>
                      <Badge variant={txn.status === "Completed" ? "default" : "secondary"}>{txn.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
