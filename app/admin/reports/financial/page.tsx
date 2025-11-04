"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getFinancialReports, exportReport } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"

export default function FinancialReportsPage() {
  const { toast } = useToast()
  const [dateRange, setDateRange] = useState("this-month")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_revenue: "₦0",
    total_expenses: "₦0",
    net_profit: "₦0",
    cash_balance: "₦0",
  })
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await getFinancialReports({ date_range: dateRange })
      if (response.success) {
        setStats(response.data.stats)
        setMonthlyData(response.data.monthly_data || [])
        setTransactions(response.data.transactions || [])
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load financial reports",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      await exportReport('financial', { date_range: dateRange })
      toast({
        title: "Export initiated",
        description: "Your report is being generated.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export report",
        variant: "destructive",
      })
    }
  }

  const statsCards = [
    { label: "Total Revenue", value: stats.total_revenue, icon: DollarSign, color: "text-green-600" },
    { label: "Total Expenses", value: stats.total_expenses, icon: TrendingDown, color: "text-red-600" },
    { label: "Net Profit", value: stats.net_profit, icon: TrendingUp, color: "text-blue-600" },
    { label: "Cash Balance", value: stats.cash_balance, icon: Wallet, color: "text-purple-600" },
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
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Monthly Summary */}
      {monthlyData.length > 0 && (
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
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest financial transactions across all categories</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No transactions found</div>
          ) : (
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
                        <Badge variant={txn.status === "completed" ? "default" : "secondary"}>
                          {txn.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
