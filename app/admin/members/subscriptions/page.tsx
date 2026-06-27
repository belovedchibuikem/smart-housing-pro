"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  Download,
  Filter,
  Home,
  Landmark,
  Loader2,
  Search,
  Users,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { apiFetch, apiFetchBlob } from "@/lib/api/client"
import { formatNaira } from "@/lib/properties/pricing"
import { formatCompactNaira } from "@/lib/utils/currency"
import { useToast } from "@/hooks/use-toast"

type SubscriptionRow = {
  asset_type: string
  subscription_id: string
  member_id: string
  member_name: string
  member_number: string
  staff_id: string
  ippis_number: string
  email: string
  phone: string
  asset_title: string
  asset_code: string
  location: string
  city: string
  state: string
  property_type: string
  slots_assigned: number
  price_per_slot: number
  total_cost: number
  amount_paid: number
  outstanding: number
  collection_rate: number
  payment_status: string
  subscription_status: string
  subscription_date: string
}

type Summary = {
  total_subscriptions: number
  total_cost: number
  amount_paid: number
  outstanding: number
  house_count: number
  land_count: number
}

export default function MemberAssetSubscriptionsPage() {
  const { toast } = useToast()
  const [rows, setRows] = useState<SubscriptionRow[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)

  const [search, setSearch] = useState("")
  const [assetType, setAssetType] = useState("all")
  const [paymentStatus, setPaymentStatus] = useState("all")
  const [location, setLocation] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [minOutstanding, setMinOutstanding] = useState("")
  const [maxOutstanding, setMaxOutstanding] = useState("")

  const buildParams = useCallback(
    (forPage?: number) => {
      const params = new URLSearchParams()
      params.set("page", String(forPage ?? page))
      params.set("per_page", "20")
      if (search.trim()) params.set("search", search.trim())
      if (assetType !== "all") params.set("asset_type", assetType)
      if (paymentStatus !== "all") params.set("payment_status", paymentStatus)
      if (location.trim()) params.set("location", location.trim())
      if (city.trim()) params.set("city", city.trim())
      if (state.trim()) params.set("state", state.trim())
      if (dateFrom) params.set("date_from", dateFrom)
      if (dateTo) params.set("date_to", dateTo)
      if (minOutstanding) params.set("min_outstanding", minOutstanding)
      if (maxOutstanding) params.set("max_outstanding", maxOutstanding)
      return params
    },
    [page, search, assetType, paymentStatus, location, city, state, dateFrom, dateTo, minOutstanding, maxOutstanding],
  )

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = buildParams()
      const res = await apiFetch<{
        success: boolean
        data: SubscriptionRow[]
        summary: Summary
        pagination: { current_page: number; last_page: number; total: number }
      }>(`/admin/members/asset-subscriptions?${params.toString()}`)
      if (res.success) {
        setRows(res.data ?? [])
        setSummary(res.summary ?? null)
        setLastPage(res.pagination?.last_page ?? 1)
        setTotal(res.pagination?.total ?? 0)
      }
    } catch {
      toast({ title: "Failed to load subscriptions", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [buildParams, toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleExport = async () => {
    setExporting(true)
    try {
      const params = buildParams(1)
      params.delete("page")
      params.delete("per_page")
      const blob = await apiFetchBlob(`/admin/members/asset-subscriptions/export?${params.toString()}`)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `member_asset_subscriptions_${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      toast({ title: "Export downloaded" })
    } catch {
      toast({ title: "Export failed", variant: "destructive" })
    } finally {
      setExporting(false)
    }
  }

  const applyFilters = () => {
    if (page === 1) {
      void loadData()
    } else {
      setPage(1)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Member Property & Land Subscriptions</h1>
          <p className="text-muted-foreground">
            Filter and export member holdings with payment status, amounts paid, and outstanding balances.
          </p>
        </div>
        <Button onClick={handleExport} disabled={exporting}>
          {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Export CSV
        </Button>
      </div>

      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Subscriptions</CardDescription>
              <CardTitle>{summary.total_subscriptions}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Houses</CardDescription>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-4 w-4" /> {summary.house_count}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Land</CardDescription>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-4 w-4" /> {summary.land_count}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Collected</CardDescription>
              <CardTitle className="text-green-600 tabular-nums">{formatCompactNaira(summary.amount_paid)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Outstanding</CardDescription>
              <CardTitle className="text-orange-600 tabular-nums">{formatCompactNaira(summary.outstanding)}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search member, ID, property, land…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={assetType} onValueChange={setAssetType}>
            <SelectTrigger>
              <SelectValue placeholder="Asset type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="house">Houses only</SelectItem>
              <SelectItem value="land">Land only</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paymentStatus} onValueChange={setPaymentStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Payment status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All payment statuses</SelectItem>
              <SelectItem value="fully_paid">Fully paid</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Location / estate" value={location} onChange={(e) => setLocation(e.target.value)} />
          <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
          <Input placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          <Input
            type="number"
            placeholder="Min outstanding"
            value={minOutstanding}
            onChange={(e) => setMinOutstanding(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max outstanding"
            value={maxOutstanding}
            onChange={(e) => setMaxOutstanding(e.target.value)}
          />
          <div className="md:col-span-2 lg:col-span-4">
            <Button onClick={applyFilters}>Apply filters</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Results ({total})
          </CardTitle>
          <CardDescription>One row per house allocation or land subscription</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : rows.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No subscriptions match your filters</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={`${row.asset_type}-${row.subscription_id}`}>
                      <TableCell>
                        <Link href={`/admin/members/${row.member_id}`} className="font-medium hover:underline">
                          {row.member_name}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {[row.member_number, row.staff_id, row.ippis_number].filter(Boolean).join(" · ") || "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{row.asset_type === "land" ? "Land" : "House"}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate" title={row.asset_title}>
                        {row.asset_title}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {[row.location, row.city, row.state].filter(Boolean).join(", ") || "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatNaira(row.total_cost)}</TableCell>
                      <TableCell className="text-right tabular-nums text-green-600">
                        {formatNaira(row.amount_paid)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-orange-600">
                        {formatNaira(row.outstanding)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.payment_status === "fully_paid" ? "default" : "secondary"}>
                          {row.payment_status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{row.subscription_date || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {lastPage > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {lastPage}
              </span>
              <Button
                variant="outline"
                disabled={page >= lastPage}
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
