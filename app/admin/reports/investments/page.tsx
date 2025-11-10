"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, DollarSign, PieChart, Target } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getInvestmentReports, exportReport } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"

export default function InvestmentReportsPage() {
  const { toast } = useToast()
  const [dateRange, setDateRange] = useState("this-month")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_investments: "₦0",
    active_investments: 0,
    avg_roi: "0%",
    total_returns: "₦0",
  })
  const [planPerformance, setPlanPerformance] = useState<any[]>([])
  const [investments, setInvestments] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await getInvestmentReports({ date_range: dateRange, per_page: 50 })
      if (response.success) {
        setStats(response.data.stats)
        setPlanPerformance(response.data.plan_performance || [])
        setInvestments(response.data.investments || [])
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load investment reports",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      await exportReport('investments', { date_range: dateRange })
      toast({
        title: "Export completed",
        description: "Your report has been downloaded.",
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
    { label: "Total Investments", value: stats.total_investments, icon: DollarSign, color: "text-blue-600" },
    { label: "Active Investments", value: stats.active_investments.toString(), icon: TrendingUp, color: "text-green-600" },
    { label: "Average ROI", value: stats.avg_roi, icon: Target, color: "text-purple-600" },
    { label: "Total Returns", value: stats.total_returns, icon: PieChart, color: "text-orange-600" },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Investment Reports</h1>
          <p className="text-muted-foreground mt-1">Track investment performance and returns</p>
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

      {/* Plan Performance */}
      {planPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Investment Plan Performance</CardTitle>
            <CardDescription>Performance metrics by investment plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Name</TableHead>
                    <TableHead className="text-right">Total Invested</TableHead>
                    <TableHead className="text-right">Investors</TableHead>
                    <TableHead className="text-right">Avg ROI</TableHead>
                    <TableHead className="text-right">Total Returns</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {planPerformance.map((plan) => (
                    <TableRow key={plan.plan}>
                      <TableCell className="font-medium">{plan.plan}</TableCell>
                      <TableCell className="text-right font-semibold">{plan.total_invested}</TableCell>
                      <TableCell className="text-right">{plan.investors}</TableCell>
                      <TableCell className="text-right text-green-600 font-semibold">{plan.avg_roi}</TableCell>
                      <TableCell className="text-right text-blue-600 font-semibold">{plan.returns}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Investment Details */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Details</CardTitle>
          <CardDescription>Individual investment records and status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : investments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No investments found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Investment ID</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">ROI</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Maturity Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investments.map((investment) => (
                    <TableRow key={investment.id}>
                      <TableCell className="font-medium">{investment.id}</TableCell>
                      <TableCell>{investment.member}</TableCell>
                      <TableCell>{investment.plan}</TableCell>
                      <TableCell className="text-right font-semibold">{investment.amount}</TableCell>
                      <TableCell className="text-right text-green-600 font-semibold">{investment.roi}</TableCell>
                      <TableCell>{investment.start_date}</TableCell>
                      <TableCell>{investment.maturity_date}</TableCell>
                      <TableCell>
                        <Badge variant={investment.status === "Active" ? "default" : "secondary"}>
                          {investment.status}
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
