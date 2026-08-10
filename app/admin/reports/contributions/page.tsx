"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, CreditCard, CheckCircle, Clock, XCircle, Wallet, MinusCircle, Scale } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { getContributionReports, exportReport } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ContributionReportsPage() {
  const { toast } = useToast()
  const [dateRange, setDateRange] = useState("this-month")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_contributions: "₦0",
    paid: "₦0",
    pending: "₦0",
    overdue: "₦0",
    members_total_contributed: "₦0",
    members_total_deductions: "₦0",
    members_total_balance: "₦0",
  })
  const [contributions, setContributions] = useState<any[]>([])
  const [memberBalances, setMemberBalances] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [searchQuery, dateRange])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await getContributionReports({
        date_range: dateRange,
        search: searchQuery || undefined,
        per_page: 50,
      })
      if (response.success) {
        setStats({
          total_contributions: "₦0",
          paid: "₦0",
          pending: "₦0",
          overdue: "₦0",
          members_total_contributed: "₦0",
          members_total_deductions: "₦0",
          members_total_balance: "₦0",
          ...(response.data.stats || {}),
        })
        setContributions(response.data.contributions || [])
        setMemberBalances((response.data as any).member_balances || [])
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load contribution reports",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: "csv" | "xlsx", view: "balances" | "transactions" = "balances") => {
    try {
      await exportReport("contributions", {
        date_range: dateRange,
        search: searchQuery,
        format,
        view,
      })
      toast({
        title: "Export completed",
        description: `Downloaded ${format.toUpperCase()} (${view}).`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export report",
        variant: "destructive",
      })
    }
  }

  const periodCards = [
    { label: "Period credited", value: stats.total_contributions, icon: CreditCard, color: "text-blue-600" },
    { label: "Paid (period)", value: stats.paid, icon: CheckCircle, color: "text-green-600" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "text-orange-600" },
    { label: "Overdue", value: stats.overdue, icon: XCircle, color: "text-red-600" },
  ]

  const positionCards = [
    { label: "Members total contributions", value: stats.members_total_contributed, icon: Wallet, color: "text-emerald-700" },
    { label: "Deductions (refunds / withdrawals)", value: stats.members_total_deductions, icon: MinusCircle, color: "text-rose-700" },
    { label: "Contribution balances", value: stats.members_total_balance, icon: Scale, color: "text-slate-800" },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Contribution Reports</h1>
          <p className="text-muted-foreground mt-1">
            Member contribution ledgers: totals, deductions, and live balances
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {periodCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-semibold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>Filter by member name, number, IPPIS, or staff ID</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Member contribution position</CardTitle>
          <CardDescription>Total contributed, deductions, and remaining balance per member</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : memberBalances.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No wallet balances found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Member ID</TableHead>
                    <TableHead className="text-right">Total contributions</TableHead>
                    <TableHead className="text-right">Deductions</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberBalances.map((row) => (
                    <TableRow key={row.member_id || row.member_number}>
                      <TableCell className="font-medium">{row.member}</TableCell>
                      <TableCell>{row.member_number}</TableCell>
                      <TableCell className="text-right">{row.total_contributions}</TableCell>
                      <TableCell className="text-right text-rose-700">{row.deductions}</TableCell>
                      <TableCell className="text-right font-semibold">{row.balance}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Period contribution activity</CardTitle>
          <CardDescription>Individual contribution postings in the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : contributions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No contributions found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contribution ID</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Member ID</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Member balance</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Paid Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contributions.map((contribution) => (
                    <TableRow key={contribution.id}>
                      <TableCell className="font-medium">
                        <Link href={`/admin/contributions/${contribution.id}`} className="hover:underline">
                          {contribution.id}
                        </Link>
                      </TableCell>
                      <TableCell>{contribution.member}</TableCell>
                      <TableCell>{contribution.member_id}</TableCell>
                      <TableCell className="text-right font-semibold">{contribution.amount}</TableCell>
                      <TableCell className="text-right">{contribution.member_balance || "—"}</TableCell>
                      <TableCell>{contribution.due_date}</TableCell>
                      <TableCell>{contribution.paid_date || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            contribution.status === "Paid" || contribution.status === "Approved" || contribution.status === "Completed"
                              ? "default"
                              : contribution.status === "Pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {contribution.status}
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
