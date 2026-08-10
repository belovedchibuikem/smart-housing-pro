"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, HandCoins, CheckCircle, Clock, Wallet, TrendingUp, MinusCircle, Scale } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { apiFetch, exportReport } from "@/lib/api/client"
import { toast as sonnerToast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
    members_total_contributed: "₦0",
    members_total_deductions: "₦0",
    members_total_balance: "₦0",
    wallet_transactions: 0,
  })
  const [contributions, setContributions] = useState<any[]>([])
  const [memberBalances, setMemberBalances] = useState<any[]>([])
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [searchQuery, dateRange])

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append("date_range", dateRange)
      if (searchQuery) params.append("search", searchQuery)
      params.append("per_page", "50")

      const response = await apiFetch<{ success: boolean; data: any }>(
        `/admin/reports/equity-contributions?${params.toString()}`,
      )

      if (response.success) {
        setStats({
          total_contributions: "₦0",
          approved: "₦0",
          pending: "₦0",
          total_wallet_balance: "₦0",
          total_used: "₦0",
          members_total_contributed: "₦0",
          members_total_deductions: "₦0",
          members_total_balance: "₦0",
          wallet_transactions: 0,
          ...(response.data.stats || {}),
        })
        setContributions(response.data.contributions || [])
        setMemberBalances(response.data.member_balances || [])
        setPaymentMethods(response.data.payment_methods || [])
      }
    } catch (error: any) {
      console.error("Error fetching equity contribution reports:", error)
      sonnerToast.error("Failed to load equity contribution reports", {
        description: error.message || "Please try again later",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: "csv" | "xlsx", view: "balances" | "transactions" = "balances") => {
    try {
      await exportReport("equity-contributions", {
        date_range: dateRange,
        search: searchQuery,
        format,
        view,
      })
      sonnerToast.success("Export completed", {
        description: `Downloaded ${format.toUpperCase()} (${view}).`,
      })
    } catch (error: any) {
      sonnerToast.error("Failed to export report", {
        description: error.message || "Please try again later",
      })
    }
  }

  const positionCards = [
    {
      label: "Equity total contributions",
      value: stats.members_total_contributed || stats.total_wallet_balance,
      icon: Wallet,
      color: "text-emerald-700",
    },
    {
      label: "Deductions (used for deposits)",
      value: stats.members_total_deductions || stats.total_used,
      icon: MinusCircle,
      color: "text-rose-700",
    },
    {
      label: "Equity balances",
      value: stats.members_total_balance || stats.total_wallet_balance,
      icon: Scale,
      color: "text-slate-800",
    },
  ]

  const periodCards = [
    { label: "Period contributions", value: stats.total_contributions, icon: HandCoins, color: "text-blue-600" },
    { label: "Approved", value: stats.approved, icon: CheckCircle, color: "text-green-600" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "text-orange-600" },
    { label: "Usage txs (period)", value: String(stats.wallet_transactions), icon: TrendingUp, color: "text-indigo-600" },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Equity Contribution Reports</h1>
          <p className="text-muted-foreground mt-1">
            Equity totals, deductions applied to property deposits, and remaining balances
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
              <SelectItem value="all-time">All Time</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv", "balances")}>
                Member balances (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("xlsx", "balances")}>
                Member balances (Excel)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("csv", "transactions")}>
                Period transactions (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("xlsx", "transactions")}>
                Period transactions (Excel)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {positionCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="pb-2">
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className={`text-2xl ${stat.color}`}>{stat.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <Icon className={`h-7 w-7 ${stat.color} opacity-50`} />
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {periodCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="pb-2">
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className={`text-xl ${stat.color}`}>{stat.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <Icon className={`h-6 w-6 ${stat.color} opacity-40`} />
              </CardContent>
            </Card>
          )
        })}
      </div>

      {paymentMethods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment methods (period)</CardTitle>
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

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Member equity position</CardTitle>
              <CardDescription>Total equity in, deductions out, balance remaining</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members…"
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
                  <TableHead>Member</TableHead>
                  <TableHead>Member ID</TableHead>
                  <TableHead className="text-right">Equity total</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberBalances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No equity balances found
                    </TableCell>
                  </TableRow>
                ) : (
                  memberBalances.map((row) => (
                    <TableRow key={row.member_id || row.member_number}>
                      <TableCell className="font-medium">{row.member}</TableCell>
                      <TableCell>{row.member_number}</TableCell>
                      <TableCell className="text-right">{row.total_contributions}</TableCell>
                      <TableCell className="text-right text-rose-700">{row.deductions}</TableCell>
                      <TableCell className="text-right font-semibold">{row.balance}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Equity contributions (period)</CardTitle>
          <CardDescription>Individual equity postings in the selected period</CardDescription>
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
                  <TableHead className="text-right">Member balance</TableHead>
                  <TableHead>Payment Method</TableHead>
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
                      <TableCell className="text-right">{contribution.member_balance || "—"}</TableCell>
                      <TableCell>{contribution.payment_method}</TableCell>
                      <TableCell>
                        <Badge variant={contribution.status === "Approved" ? "default" : "secondary"}>
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
