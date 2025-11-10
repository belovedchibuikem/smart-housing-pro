"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, HandCoins, CheckCircle, Clock, Wallet, TrendingUp } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { apiFetch, exportReport } from "@/lib/api/client"
import { toast as sonnerToast } from "sonner"

export default function EquityContributionReportsPage() {
  const [dateRange, setDateRange] = useState("this-month")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_contributions: "₦0",
    approved: "₦0",
    pending: "₦0",
    total_wallet_balance: "₦0",
    total_used: "₦0",
    wallet_transactions: 0,
  })
  const [contributions, setContributions] = useState<any[]>([])
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [searchQuery, dateRange])

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('date_range', dateRange)
      if (searchQuery) params.append('search', searchQuery)
      params.append('per_page', '50')

      const response = await apiFetch<{ success: boolean; data: any }>(
        `/admin/reports/equity-contributions?${params.toString()}`
      )
      
      if (response.success) {
        setStats(response.data.stats || stats)
        setContributions(response.data.contributions || [])
        setPaymentMethods(response.data.payment_methods || [])
      }
    } catch (error: any) {
      console.error('Error fetching equity contribution reports:', error)
      sonnerToast.error("Failed to load equity contribution reports", {
        description: error.message || "Please try again later",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      await exportReport('equity-contributions', { date_range: dateRange, search: searchQuery })
      sonnerToast.success("Export completed", {
        description: "Your report has been downloaded.",
      })
    } catch (error: any) {
      sonnerToast.error("Failed to export report", {
        description: error.message || "Please try again later",
      })
    }
  }

  const statsCards = [
    { label: "Total Contributions", value: stats.total_contributions, icon: HandCoins, color: "text-blue-600" },
    { label: "Approved", value: stats.approved, icon: CheckCircle, color: "text-green-600" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "text-orange-600" },
    { label: "Wallet Balance", value: stats.total_wallet_balance, icon: Wallet, color: "text-purple-600" },
    { label: "Total Used", value: stats.total_used, icon: TrendingUp, color: "text-indigo-600" },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Equity Contribution Reports</h1>
          <p className="text-muted-foreground mt-1">Track equity contributions and wallet usage</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className={`text-2xl ${stat.color}`}>{stat.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <Icon className={`h-8 w-8 ${stat.color} opacity-50`} />
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Payment Methods Breakdown */}
      {paymentMethods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {paymentMethods.map((method, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">{method.method}</div>
                  <div className="text-2xl font-bold">{method.total_amount}</div>
                  <div className="text-sm text-muted-foreground">{method.count} transactions</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contributions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Equity Contributions</CardTitle>
              <CardDescription>List of all equity contributions</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contributions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contributions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No equity contributions found
                    </TableCell>
                  </TableRow>
                ) : (
                  contributions.map((contribution) => (
                    <TableRow key={contribution.id}>
                      <TableCell className="font-mono text-sm">{contribution.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{contribution.member}</div>
                          <div className="text-sm text-muted-foreground">{contribution.member_id}</div>
                        </div>
                      </TableCell>
                      <TableCell>{contribution.plan}</TableCell>
                      <TableCell className="font-semibold">{contribution.amount}</TableCell>
                      <TableCell>{contribution.payment_method}</TableCell>
                      <TableCell className="font-mono text-sm">{contribution.payment_reference}</TableCell>
                      <TableCell>
                        <Badge variant={contribution.status === 'Approved' ? 'default' : 'secondary'}>
                          {contribution.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{contribution.created_at}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

