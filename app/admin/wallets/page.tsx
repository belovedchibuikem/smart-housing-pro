"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Eye, Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { apiFetch, exportReport } from "@/lib/api/client"
import { toast as sonnerToast } from "sonner"

export default function AdminWalletsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [wallets, setWallets] = useState<Array<{
    id: string
    memberName: string
    memberId: string
    balance: number
    totalDeposits: number
    totalWithdrawals: number
    status: string
    lastTransaction?: string
  }>>([])
  const [meta, setMeta] = useState<{ current_page: number; total: number; per_page: number; total_balance?: number } | null>(null)

  const fetchWallets = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      const path = `/admin/wallets${params.toString() ? `?${params.toString()}` : ''}`

      const res = await apiFetch<any>(path)
      const list: any[] = Array.isArray(res?.data) ? res.data : (res?.wallets ?? [])
      const normalized = list.map((w) => {
        const member = w.member || w.user || {}
        return {
          id: String(w.id ?? member.id ?? Math.random()),
          memberName: (member.name ?? member.full_name ?? `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim()) || 'Unknown',
          memberId: member.member_id ?? member.staff_id ?? member.code ?? '—',
          balance: Number(w.balance ?? w.current_balance ?? 0) || 0,
          totalDeposits: Number(w.total_deposits ?? w.total_credits ?? 0) || 0,
          totalWithdrawals: Number(w.total_withdrawals ?? w.total_debits ?? 0) || 0,
          status: String(w.status ?? w.state ?? 'active'),
          lastTransaction: w.last_transaction ?? w.last_tx_at ?? w.updated_at ?? undefined,
        }
      })
      setWallets(normalized)
      const m = res?.meta || res?.pagination || null
      if (m) setMeta({ current_page: m.current_page ?? 1, total: m.total ?? 0, per_page: m.per_page ?? 50, total_balance: m.total_balance })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWallets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter])

  const handleExport = async () => {
    try {
      // Export wallets data - we'll use members export since wallets are part of member data
      await exportReport('members', {})
      sonnerToast.success("Export completed", {
        description: "Wallet data has been downloaded.",
      })
    } catch (error: any) {
      sonnerToast.error("Failed to export wallets", {
        description: error.message || "Please try again later",
      })
    }
  }

  const stats = useMemo(() => {
    const totalBalance = meta?.total_balance ?? wallets.reduce((sum, w) => sum + (w.balance || 0), 0)
    const totalDeposits = wallets.reduce((sum, w) => sum + (w.totalDeposits || 0), 0)
    const totalWithdrawals = wallets.reduce((sum, w) => sum + (w.totalWithdrawals || 0), 0)
    const activeCount = wallets.filter((w) => (w.status || '').toLowerCase() === 'active').length
    return [
      { title: "Total Wallet Balance", value: `₦${Number(totalBalance).toLocaleString()}`, icon: Wallet, trend: '', trendUp: true },
      { title: "Total Deposits", value: `₦${Number(totalDeposits).toLocaleString()}`, icon: TrendingUp, trend: '', trendUp: true },
      { title: "Total Withdrawals", value: `₦${Number(totalWithdrawals).toLocaleString()}`, icon: TrendingDown, trend: '', trendUp: false },
      { title: "Active Wallets", value: String(activeCount), icon: DollarSign, trend: '', trendUp: true },
    ]
  }, [wallets, meta])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wallet Management</h1>
        <p className="text-muted-foreground mt-2">Manage all member wallets and transactions</p>
      </div>

      {/* Stats Cards */}
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
                <p className={`text-xs ${stat.trendUp ? "text-green-600" : "text-red-600"}`}>
                  {stat.trend} from last month
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>All Wallets</CardTitle>
          <CardDescription>View and manage member wallet balances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or member ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Wallets Table */}
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-4 text-left text-sm font-medium">Member</th>
                    <th className="p-4 text-left text-sm font-medium">Balance</th>
                    <th className="p-4 text-left text-sm font-medium">Total Deposits</th>
                    <th className="p-4 text-left text-sm font-medium">Total Withdrawals</th>
                    <th className="p-4 text-left text-sm font-medium">Status</th>
                    <th className="p-4 text-left text-sm font-medium">Last Transaction</th>
                    <th className="p-4 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && wallets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-muted-foreground">Loading wallets…</td>
                    </tr>
                  ) : wallets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-muted-foreground">No wallets found</td>
                    </tr>
                  ) : wallets.map((wallet) => (
                    <tr key={wallet.id} className="border-b">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{wallet.memberName}</p>
                          <p className="text-sm text-muted-foreground">{wallet.memberId}</p>
                        </div>
                      </td>
                      <td className="p-4 font-semibold">₦{wallet.balance.toLocaleString()}</td>
                      <td className="p-4 text-green-600">₦{wallet.totalDeposits.toLocaleString()}</td>
                      <td className="p-4 text-red-600">₦{wallet.totalWithdrawals.toLocaleString()}</td>
                      <td className="p-4">
                        <Badge variant={wallet.status === "active" ? "default" : "destructive"}>{wallet.status}</Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{wallet.lastTransaction ? new Date(wallet.lastTransaction).toISOString().slice(0,10) : '—'}</td>
                      <td className="p-4">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
