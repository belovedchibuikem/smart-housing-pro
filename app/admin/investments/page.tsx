"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Eye, CheckCircle, XCircle, Loader2, Trash2 } from "lucide-react"
import { toast as sonnerToast } from "sonner"
import {
  getFinancialInvestments,
  approveFinancialInvestment,
  rejectFinancialInvestment,
  deleteFinancialInvestment,
  exportReport,
  type FinancialInvestment,
} from "@/lib/api/client"

const INVESTMENT_TYPES = [
  { value: "all", label: "All types" },
  { value: "savings", label: "Savings" },
  { value: "fixed_deposit", label: "Fixed deposit" },
  { value: "treasury_bills", label: "Treasury bills" },
  { value: "bonds", label: "Bonds" },
  { value: "stocks", label: "Stocks" },
]

function formatCurrency(amount: number | string | undefined): string {
  const n = typeof amount === "string" ? parseFloat(amount) : Number(amount)
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0,
  )
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "—"
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return dateString
  }
}

function formatTypeLabel(type: string | undefined): string {
  if (!type) return "—"
  return type.replace(/_/g, " ")
}

function memberDisplayName(inv: FinancialInvestment): string {
  const m = inv.member
  if (m?.full_name?.trim()) return m.full_name
  return "—"
}

interface Pagination {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export default function AdminInvestmentsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [investments, setInvestments] = useState<FinancialInvestment[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalThisMonth: 0,
    pending: 0,
    active: 0,
    totalAllTime: 0,
  })

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 450)
    return () => clearTimeout(t)
  }, [searchQuery])

  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, typeFilter, debouncedSearch])

  const fetchInvestments = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getFinancialInvestments({
        status: statusFilter !== "all" ? statusFilter : undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
        search: debouncedSearch || undefined,
        page: currentPage,
        per_page: 15,
      })
      setInvestments(response.investments || [])
      setPagination(response.pagination || null)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again later"
      sonnerToast.error("Failed to load investments", { description: message })
    } finally {
      setLoading(false)
    }
  }, [statusFilter, typeFilter, debouncedSearch, currentPage])

  const fetchStats = useCallback(async () => {
    try {
      const response = await getFinancialInvestments({ per_page: 500 })
      const list = response.investments || []
      const now = new Date()
      const thisMonth = list.filter((inv) => {
        const d = new Date(inv.investment_date || inv.created_at)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      const amount = (inv: FinancialInvestment) => {
        const n = typeof inv.amount === "string" ? parseFloat(inv.amount) : Number(inv.amount)
        return Number.isFinite(n) ? n : 0
      }
      setStats({
        totalThisMonth: thisMonth.reduce((s, inv) => s + amount(inv), 0),
        pending: list.filter((i) => i.status === "pending").length,
        active: list.filter((i) => i.status === "active").length,
        totalAllTime: list.reduce((s, inv) => s + amount(inv), 0),
      })
    } catch {
      /* stats are optional */
    }
  }, [])

  useEffect(() => {
    fetchInvestments()
  }, [fetchInvestments])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const handleExport = async () => {
    try {
      await exportReport("investments", {
        date_range: "this-year",
        search: debouncedSearch || undefined,
      })
      sonnerToast.success("Export completed", { description: "Your report has been downloaded." })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again later"
      sonnerToast.error("Failed to export report", { description: message })
    }
  }

  const handleApprove = async (id: string) => {
    try {
      setProcessing(id)
      const response = await approveFinancialInvestment(id)
      if (response.success) {
        sonnerToast.success("Investment approved", { description: response.message })
        fetchInvestments()
        fetchStats()
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again later"
      sonnerToast.error("Failed to approve investment", { description: message })
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (id: string) => {
    const reason = window.prompt("Please provide a reason for rejection:")
    if (!reason || !reason.trim()) return
    try {
      setProcessing(id)
      const response = await rejectFinancialInvestment(id, reason.trim())
      if (response.success) {
        sonnerToast.success("Investment rejected", { description: response.message })
        fetchInvestments()
        fetchStats()
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again later"
      sonnerToast.error("Failed to reject investment", { description: message })
    } finally {
      setProcessing(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this pending investment? This cannot be undone.")) return
    try {
      setProcessing(id)
      const response = await deleteFinancialInvestment(id)
      if (response.success) {
        sonnerToast.success("Investment deleted", { description: response.message })
        fetchInvestments()
        fetchStats()
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again later"
      sonnerToast.error("Failed to delete investment", { description: message })
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">All investments</h1>
          <p className="text-muted-foreground mt-1">Review member investment applications and active portfolios</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/investment-plans">Investment plans</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/investment-withdrawal-requests">Withdrawal requests</Link>
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total this month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalThisMonth)}</div>
            <p className="text-xs text-muted-foreground mt-1">By investment date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting decision</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">Approved / running</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total amount (sample)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalAllTime)}</div>
            <p className="text-xs text-muted-foreground mt-1">Up to 500 recent records</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Investments</CardTitle>
          <CardDescription>Filter by status, type, or search by member or reference</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search member name, email, member number, or investment ID…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {INVESTMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                          No investments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      investments.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-mono text-xs">{inv.id.slice(0, 8)}…</TableCell>
                          <TableCell>
                            <div className="font-medium">{memberDisplayName(inv)}</div>
                            <div className="text-xs text-muted-foreground">
                              {inv.member?.member_number || inv.member_id.slice(0, 8)}
                              {inv.member?.user?.email ? ` · ${inv.member.user.email}` : null}
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{formatTypeLabel(inv.type)}</TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(inv.amount)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {inv.expected_return_rate != null ? `${inv.expected_return_rate}%` : "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatDate(inv.investment_date)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                inv.status === "active" || inv.status === "completed"
                                  ? "default"
                                  : inv.status === "rejected"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {inv.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push(`/admin/investments/${inv.id}`)}
                                disabled={processing === inv.id}
                                aria-label="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {inv.status === "pending" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-green-600"
                                    onClick={() => handleApprove(inv.id)}
                                    disabled={processing === inv.id}
                                    aria-label="Approve"
                                  >
                                    {processing === inv.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                    onClick={() => handleReject(inv.id)}
                                    disabled={processing === inv.id}
                                    aria-label="Reject"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground"
                                    onClick={() => handleDelete(inv.id)}
                                    disabled={processing === inv.id}
                                    aria-label="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {pagination && pagination.last_page > 1 && (
                <div className="flex flex-col gap-3 mt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(pagination.current_page - 1) * pagination.per_page + 1} to{" "}
                    {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.current_page <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.current_page >= pagination.last_page}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
