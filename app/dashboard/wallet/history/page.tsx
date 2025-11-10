"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDownRight, ArrowUpRight, Calendar, Download, Filter, Loader2, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiFetch, getApiBaseUrl, getAuthToken } from "@/lib/api/client"

interface WalletTransaction {
  id: string
  type: "credit" | "debit"
  status: string
  amount: number
  payment_method?: string | null
  payment_reference?: string | null
  description?: string | null
  metadata?: Record<string, unknown> | null
  created_at?: string | null
}

interface Pagination {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

interface SummaryMetrics {
  total_transactions: number
  total_credit: number
  total_debit: number
}

interface TransactionsResponse {
  transactions: WalletTransaction[]
  pagination: Pagination
  summary?: SummaryMetrics
}

type FilterState = {
  search: string
  type: string
  status: string
  payment_method: string
  date_from: string
  date_to: string
  per_page: number
}

const paymentMethodOptions = [
  { label: "All Methods", value: "all" },
  { label: "Paystack", value: "paystack" },
  { label: "Remita", value: "remita" },
  { label: "Stripe", value: "stripe" },
  { label: "Manual", value: "manual" },
  { label: "Bank Transfer", value: "bank_transfer" },
  { label: "Virtual Account", value: "paystack_virtual_account" },
  { label: "Wallet", value: "wallet" },
]

const transactionTypeOptions = [
  { label: "All Types", value: "all" },
  { label: "Credit", value: "credit" },
  { label: "Debit", value: "debit" },
]

const statusOptions = [
  { label: "All Status", value: "all" },
  { label: "Completed", value: "completed" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "cancelled" },
]

const perPageOptions = [10, 20, 50, 100]

const defaultFilters: FilterState = {
  search: "",
  type: "all",
  status: "all",
  payment_method: "all",
  date_from: "",
  date_to: "",
  per_page: perPageOptions[0],
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "2-digit",
})

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
})

export default function WalletHistoryPage() {
  const { toast } = useToast()
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(defaultFilters)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [summary, setSummary] = useState<SummaryMetrics>({
    total_transactions: 0,
    total_credit: 0,
    total_debit: 0,
  })
  const [walletBalance, setWalletBalance] = useState<{ amount: number; currency: string } | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    last_page: 1,
    per_page: defaultFilters.per_page,
    total: 0,
  })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  const buildQueryParams = useCallback(
    (pageParam: number, perPageParam: number, includePagination: boolean = true) => {
      const params = new URLSearchParams()

      if (includePagination) {
        params.set("page", String(pageParam))
        params.set("per_page", String(perPageParam))
      }

      const { search, type, status, payment_method, date_from, date_to } = appliedFilters

      if (search.trim()) params.set("search", search.trim())
      if (type !== "all") params.set("type", type)
      if (status !== "all") params.set("status", status)
      if (payment_method !== "all") params.set("payment_method", payment_method)
      if (date_from) params.set("date_from", date_from)
      if (date_to) params.set("date_to", date_to)

      return params
    },
    [appliedFilters],
  )

  const loadTransactions = useCallback(
    async (pageParam: number, perPageParam: number) => {
      setLoading(true)
      try {
        const params = buildQueryParams(pageParam, perPageParam)
        const response = await apiFetch<TransactionsResponse>(`/user/wallet/transactions?${params.toString()}`)

        setTransactions(response.transactions ?? [])
        if (response.pagination) {
          setPagination(response.pagination)
        } else {
          setPagination({ current_page: 1, last_page: 1, per_page: perPageParam, total: (response.transactions ?? []).length })
        }

        if (response.summary) {
          setSummary(response.summary)
        } else {
          const credit = (response.transactions ?? [])
            .filter((item) => item.type === "credit")
            .reduce((total, item) => total + Number(item.amount || 0), 0)
          const debit = (response.transactions ?? [])
            .filter((item) => item.type === "debit")
            .reduce((total, item) => total + Number(item.amount || 0), 0)
          setSummary({
            total_transactions: response.transactions?.length ?? 0,
            total_credit: credit,
            total_debit: debit,
          })
        }
      } catch (error: any) {
        console.error("Failed to load transactions", error)
        toast({
          title: "Error",
          description: error?.message || "Unable to load wallet transactions",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    },
    [buildQueryParams, toast],
  )

  useEffect(() => {
    loadTransactions(page, appliedFilters.per_page)
  }, [page, appliedFilters, loadTransactions])

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const response = await apiFetch<{ wallet: { balance: number; currency?: string } }>("/user/wallet")
        setWalletBalance({
          amount: Number(response.wallet?.balance ?? 0),
          currency: response.wallet?.currency || "NGN",
        })
      } catch (error) {
        console.error("Failed to fetch wallet balance", error)
      }
    }

    fetchWallet()
  }, [])

  const formatMoney = useCallback(
    (amount: number, currency?: string) => {
      const activeCurrency = currency || walletBalance?.currency || "NGN"
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: activeCurrency,
      }).format(amount)
    },
    [walletBalance?.currency],
  )

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters })
    setPage(1)
  }

  const handleClearFilters = () => {
    setFilters(defaultFilters)
    setAppliedFilters(defaultFilters)
    setPage(1)
  }

  const handlePageChange = (direction: "prev" | "next") => {
    const nextPage = direction === "prev" ? pagination.current_page - 1 : pagination.current_page + 1
    if (nextPage < 1 || nextPage > pagination.last_page) return
    setPage(nextPage)
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const params = buildQueryParams(1, appliedFilters.per_page, false)
      const baseUrl = getApiBaseUrl()
      const token = getAuthToken()

      const response = await fetch(`${baseUrl}/user/wallet/transactions/export${params.toString() ? `?${params.toString()}` : ""}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to export transactions")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `wallet-transactions-${new Date().toISOString()}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast({ title: "Export started", description: "Your wallet transactions CSV has been downloaded." })
    } catch (error: any) {
      console.error("Failed to export wallet transactions", error)
      toast({
        title: "Export failed",
        description: error?.message || "Unable to export wallet transactions",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const totals = useMemo(() => {
    return {
      transactions: summary.total_transactions,
      completed: (summary as any).total_completed_transactions ?? summary.total_transactions,
      credit: summary.total_credit,
      debit: summary.total_debit,
      balance: walletBalance?.amount ?? 0,
    }
  }, [summary, walletBalance])

  const formatDateParts = (timestamp?: string | null) => {
    if (!timestamp) return { date: "", time: "" }
    const date = new Date(timestamp)
    return {
      date: dateFormatter.format(date),
      time: timeFormatter.format(date),
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wallet History</h1>
        <p className="text-muted-foreground mt-2">Track every credit and debit across your wallet.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.transactions.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Credit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatMoney(totals.credit)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Debit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatMoney(totals.debit)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(totals.balance)}</div>
            <p className="mt-2 text-xs text-muted-foreground">
              {totals.completed.toLocaleString()} completed transactions counted in credit/debit totals.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Filter, search, and export your wallet transactions.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters((prev) => !prev)}>
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? "Hide" : "Show"} Filters
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
                {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by description or reference"
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
              className="pl-10"
            />
          </div>

          {showFilters && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 p-4 rounded-lg border bg-muted/50">
              <div className="space-y-2">
                <Label>Transaction Type</Label>
                <Select value={filters.type} onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {transactionTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select
                  value={filters.payment_method}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, payment_method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethodOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date From</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={filters.date_from}
                    onChange={(event) => setFilters((prev) => ({ ...prev, date_from: event.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Date To</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={filters.date_to}
                    onChange={(event) => setFilters((prev) => ({ ...prev, date_to: event.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Per Page</Label>
                <Select
                  value={String(filters.per_page)}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, per_page: Number(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {perPageOptions.map((size) => (
                      <SelectItem key={`per-page-${size}`} value={String(size)}>
                        {size} per page
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 lg:col-span-4 flex flex-wrap gap-3">
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  Clear All Filters
                </Button>
                <Button size="sm" onClick={handleApplyFilters}>
                  Apply Filters
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
              <p>No transactions found. Try adjusting your filters.</p>
              </div>
            ) : (
            <div className="space-y-3">
                {transactions.map((transaction) => {
                const { date, time } = formatDateParts(transaction.created_at)
                const isCredit = transaction.type === "credit"
                  const amountDisplay = `${isCredit ? "+" : "-"}${formatMoney(Math.abs(Number(transaction.amount || 0)))}`

                return (
                <div
                  key={transaction.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-full ${isCredit ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                        {isCredit ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                        <p className="font-medium">{transaction.description || "Wallet transaction"}</p>
                      <p className="text-sm text-muted-foreground">
                          {transaction.payment_reference || transaction.id}
                          {date && ` • ${date}`}
                          {time && ` • ${time}`}
                      </p>
                        {transaction.payment_method && (
                          <p className="text-xs text-muted-foreground mt-1">Method: {transaction.payment_method.replace(/_/g, " ")}</p>
                        )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <Badge
                        variant={
                          transaction.status === "completed"
                            ? "secondary"
                            : transaction.status === "pending"
                              ? "outline"
                              : "destructive"
                        }
                        className="text-xs capitalize"
                    >
                        {transaction.status || "unknown"}
                    </Badge>
                      <p className={`font-semibold text-lg ${isCredit ? "text-green-600" : "text-red-600"}`}>{amountDisplay}</p>
                    </div>
                  </div>
                )
              })}

              <div className="flex items-center justify-between border rounded-lg px-4 py-3 text-sm text-muted-foreground">
                <span>
                  Page {pagination.current_page} of {pagination.last_page} • {pagination.total.toLocaleString()} records
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange("prev")}
                    disabled={pagination.current_page <= 1 || loading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange("next")}
                    disabled={pagination.current_page >= pagination.last_page || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
