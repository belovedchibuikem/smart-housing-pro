"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Search } from "lucide-react"
import { useBulkUploadPermission } from "@/lib/admin/bulk-upload-permissions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Pagination } from "@/components/ui/pagination"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"
import { formatNairaAmount } from "@/lib/utils/currency"

type AssetTypeFilter = "all" | "house" | "land"
type AmountMode = "full_wallet" | "part"

type Candidate = {
  row_key: string
  asset_type: "house" | "land"
  allocation_id: string | null
  subscription_id: string | null
  member_id: string
  member_number: string | null
  member_name: string
  asset_label: string
  outstanding: number
  equity_balance: number
  suggested_payable: number
}

type PreviewRow = {
  row_key: string
  asset_type: "house" | "land"
  member_id: string
  member_name?: string | null
  member_number?: string | null
  allocation_id: string | null
  subscription_id: string | null
  asset_label?: string | null
  outstanding: number
  equity_available: number
  requested: number
  payable: number
  status: "payable" | "skipped"
  skip_reason?: string | null
  equity_after?: number
  result?: "success" | "failed" | "skipped"
  message?: string
  paid_amount?: number
}

type PreviewData = {
  rows: PreviewRow[]
  payable_count: number
  skipped_count: number
  total_payable: number
  member_count: number
  amount_mode: AmountMode
}

type ExecuteData = {
  batch_id: string
  successful: number
  failed: number
  skipped: number
  total_paid: number
  results: PreviewRow[]
}

type PaginationMeta = {
  page: number
  per_page: number
  total: number
  last_page: number
  from?: number
  to?: number
}

const PER_PAGE = 50

function money(n: number | undefined | null) {
  return formatNairaAmount(n ?? 0, { compact: false })
}

export default function BulkEquityAssetRepaymentsPage() {
  const canUpload = useBulkUploadPermission("equity-asset-repayments")
  const { toast } = useToast()

  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [assetType, setAssetType] = useState<AssetTypeFilter>("all")
  const [equityOnly, setEquityOnly] = useState(true)
  const [minEquityInput, setMinEquityInput] = useState("")
  const [minOutstandingInput, setMinOutstandingInput] = useState("")
  const [minEquity, setMinEquity] = useState("")
  const [minOutstanding, setMinOutstanding] = useState("")
  const [page, setPage] = useState(1)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    per_page: PER_PAGE,
    total: 0,
    last_page: 1,
  })
  const [meta, setMeta] = useState<{
    scanned_houses?: number
    scanned_lands?: number
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Record<string, Candidate>>({})
  const [amountMode, setAmountMode] = useState<AmountMode>("full_wallet")
  const [globalAmount, setGlobalAmount] = useState("")
  const [overrides, setOverrides] = useState<Record<string, string>>({})
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [executeResult, setExecuteResult] = useState<ExecuteData | null>(null)
  const [selectingAll, setSelectingAll] = useState(false)

  const buildFilterQuery = useCallback(
    (opts?: { page?: number; keysOnly?: boolean }) => {
      const qs = new URLSearchParams()
      if (search.trim()) qs.set("search", search.trim())
      if (assetType !== "all") qs.set("asset_type", assetType)
      if (equityOnly) qs.set("equity_only", "1")
      if (minEquity.trim() && Number(minEquity) > 0) qs.set("min_equity", String(Number(minEquity)))
      if (minOutstanding.trim() && Number(minOutstanding) > 0) {
        qs.set("min_outstanding", String(Number(minOutstanding)))
      }
      qs.set("page", String(opts?.page ?? page))
      qs.set("per_page", String(PER_PAGE))
      if (opts?.keysOnly) qs.set("keys_only", "1")
      return qs
    },
    [search, assetType, equityOnly, minEquity, minOutstanding, page],
  )

  const loadCandidates = useCallback(async () => {
    setLoading(true)
    setPreview(null)
    setExecuteResult(null)
    try {
      const qs = buildFilterQuery({ page })
      const res = await apiFetch<{
        success?: boolean
        data?: {
          candidates?: Candidate[]
          pagination?: PaginationMeta
          meta?: { scanned_houses?: number; scanned_lands?: number }
        }
      }>(`/admin/bulk/equity-asset-repayments/candidates?${qs.toString()}`)
      const list = res.data?.candidates ?? []
      setCandidates(Array.isArray(list) ? list : [])
      setPagination(
        res.data?.pagination ?? {
          page,
          per_page: PER_PAGE,
          total: Array.isArray(list) ? list.length : 0,
          last_page: 1,
        },
      )
      setMeta(res.data?.meta ?? null)
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Failed to load holdings",
        description: e instanceof Error ? e.message : "Unknown error",
      })
      setCandidates([])
      setMeta(null)
    } finally {
      setLoading(false)
    }
  }, [buildFilterQuery, page, toast])

  // Debounce search text into applied search filter
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    void loadCandidates()
  }, [loadCandidates])

  const selectedList = useMemo(() => Object.values(selected), [selected])
  const selectedCount = selectedList.length

  const pageSelectedCount = useMemo(
    () => candidates.filter((c) => Boolean(selected[c.row_key])).length,
    [candidates, selected],
  )

  const allPageSelected = candidates.length > 0 && pageSelectedCount === candidates.length
  const somePageSelected = pageSelectedCount > 0 && !allPageSelected

  const togglePage = (checked: boolean) => {
    setSelected((prev) => {
      const next = { ...prev }
      if (checked) {
        candidates.forEach((c) => {
          next[c.row_key] = c
        })
      } else {
        candidates.forEach((c) => {
          delete next[c.row_key]
        })
      }
      return next
    })
  }

  const clearSelection = () => setSelected({})

  const selectAllMatching = async () => {
    setSelectingAll(true)
    try {
      const qs = buildFilterQuery({ page: 1, keysOnly: true })
      const res = await apiFetch<{
        data?: { candidates?: Candidate[]; count?: number }
      }>(`/admin/bulk/equity-asset-repayments/candidates?${qs.toString()}`)
      const list = res.data?.candidates ?? []
      const next: Record<string, Candidate> = {}
      list.forEach((c) => {
        next[c.row_key] = c
      })
      setSelected(next)
      toast({
        title: "Selection updated",
        description: `${list.length} holding(s) selected across all filtered pages`,
      })
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Could not select all",
        description: e instanceof Error ? e.message : "Unknown error",
      })
    } finally {
      setSelectingAll(false)
    }
  }

  const applyFilters = () => {
    setSearch(searchInput.trim())
    setMinEquity(minEquityInput.trim())
    setMinOutstanding(minOutstandingInput.trim())
    setPage(1)
  }

  const resetFilters = () => {
    setSearchInput("")
    setSearch("")
    setAssetType("all")
    setEquityOnly(true)
    setMinEquityInput("")
    setMinOutstandingInput("")
    setMinEquity("")
    setMinOutstanding("")
    setPage(1)
  }

  const buildPayload = () => {
    const overrideList = Object.entries(overrides)
      .filter(([key, val]) => selected[key] && val.trim() !== "" && Number(val) > 0)
      .map(([row_key, amount]) => ({ row_key, amount: Number(amount) }))

    return {
      amount_mode: amountMode,
      amount: amountMode === "part" && globalAmount.trim() ? Number(globalAmount) : null,
      rows: selectedList.map((r) => ({
        row_key: r.row_key,
        asset_type: r.asset_type,
        member_id: r.member_id,
        allocation_id: r.allocation_id,
        subscription_id: r.subscription_id,
      })),
      overrides: overrideList,
    }
  }

  const handlePreview = async () => {
    if (selectedCount === 0) {
      toast({ variant: "destructive", title: "Select at least one holding" })
      return
    }
    if (amountMode === "part") {
      const hasGlobal = Number(globalAmount) > 0
      const hasOverride = Object.entries(overrides).some(
        ([key, val]) => selected[key] && Number(val) > 0,
      )
      if (!hasGlobal && !hasOverride) {
        toast({
          variant: "destructive",
          title: "Enter a part amount",
          description: "Set a global amount and/or per-row overrides.",
        })
        return
      }
    }

    setPreviewing(true)
    setExecuteResult(null)
    try {
      const res = await apiFetch<{ success?: boolean; data: PreviewData }>(
        "/admin/bulk/equity-asset-repayments/preview",
        {
          method: "POST",
          body: buildPayload(),
        },
      )
      setPreview(res.data)
      toast({ title: "Preview ready", description: `${res.data.payable_count} payable row(s)` })
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Preview failed",
        description: e instanceof Error ? e.message : "Unknown error",
      })
    } finally {
      setPreviewing(false)
    }
  }

  const handleExecute = async () => {
    setExecuting(true)
    try {
      const res = await apiFetch<{ success?: boolean; data: ExecuteData }>(
        "/admin/bulk/equity-asset-repayments/execute",
        {
          method: "POST",
          body: buildPayload(),
        },
      )
      setExecuteResult(res.data)
      setConfirmOpen(false)
      toast({
        title: "Bulk repayment finished",
        description: `${res.data.successful} succeeded, ${res.data.failed} failed, ${res.data.skipped} skipped`,
      })
      clearSelection()
      setPreview(null)
      await loadCandidates()
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Execute failed",
        description: e instanceof Error ? e.message : "Unknown error",
      })
    } finally {
      setExecuting(false)
    }
  }

  if (!canUpload) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>You do not have permission to run bulk equity asset repayments.</AlertDescription>
      </Alert>
    )
  }

  const colSpan = amountMode === "part" ? 7 : 6

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bulk Equity → House/Land Repayment</h1>
        <p className="mt-2 text-muted-foreground">
          Filter holdings, select many at once (page or all matching), then repay from equity wallets in one
          batch. Members with equity balances appear first.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>1. Select holdings</CardTitle>
            <CardDescription>
              Active house/land holdings with outstanding balances · {pagination.total} match
              {equityOnly ? " (equity only)" : ""}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => void loadCandidates()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2 sm:col-span-2 lg:col-span-2">
              <Label htmlFor="holdings-search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="holdings-search"
                  className="pl-9"
                  placeholder="Name, member no, staff ID, property, land…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Asset type</Label>
              <RadioGroup
                value={assetType}
                onValueChange={(v) => {
                  setAssetType(v as AssetTypeFilter)
                  setPage(1)
                }}
                className="flex flex-row flex-wrap items-center gap-3 pt-2"
              >
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="all" id="asset-all" />
                  <Label htmlFor="asset-all" className="font-normal">
                    All
                  </Label>
                </div>
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="house" id="asset-house" />
                  <Label htmlFor="asset-house" className="font-normal">
                    Houses
                  </Label>
                </div>
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="land" id="asset-land" />
                  <Label htmlFor="asset-land" className="font-normal">
                    Lands
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Equity filter</Label>
              <div className="flex items-center gap-2 pt-2">
                <Checkbox
                  id="equity-only"
                  checked={equityOnly}
                  onCheckedChange={(v) => {
                    setEquityOnly(Boolean(v))
                    setPage(1)
                  }}
                />
                <Label htmlFor="equity-only" className="text-sm font-normal">
                  Only with equity balance
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-equity">Min equity (₦)</Label>
              <Input
                id="min-equity"
                type="number"
                min={0}
                step="1"
                placeholder="e.g. 10000"
                value={minEquityInput}
                onChange={(e) => setMinEquityInput(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-outstanding">Min outstanding (₦)</Label>
              <Input
                id="min-outstanding"
                type="number"
                min={0}
                step="1"
                placeholder="e.g. 100000"
                value={minOutstandingInput}
                onChange={(e) => setMinOutstandingInput(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-end gap-2 sm:col-span-2">
              <Button type="button" onClick={applyFilters}>
                Apply filters
              </Button>
              <Button type="button" variant="outline" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={candidates.length === 0 || loading}
                onClick={() => togglePage(true)}
              >
                Select this page
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={pagination.total === 0 || selectingAll || loading}
                onClick={() => void selectAllMatching()}
              >
                {selectingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Select all matching ({pagination.total})
              </Button>
              {selectedCount > 0 ? (
                <Button type="button" variant="ghost" size="sm" onClick={clearSelection}>
                  Clear selection ({selectedCount})
                </Button>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">
              {pagination.from ?? 0}–{pagination.to ?? 0} of {pagination.total} · {selectedCount} selected
            </p>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allPageSelected ? true : somePageSelected ? "indeterminate" : false}
                      onCheckedChange={(v) => togglePage(Boolean(v))}
                      aria-label="Select page"
                    />
                  </TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead className="text-right">Equity</TableHead>
                  <TableHead className="text-right">Suggested</TableHead>
                  {amountMode === "part" ? <TableHead className="w-36 text-right">Override</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={colSpan} className="py-10 text-center text-muted-foreground">
                      <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                      Loading holdings…
                    </TableCell>
                  </TableRow>
                ) : candidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={colSpan} className="py-10 text-center text-muted-foreground">
                      <p className="font-medium text-foreground">No eligible holdings found</p>
                      <p className="mx-auto mt-2 max-w-lg text-sm">
                        Try turning off “Only with equity balance”, clearing search, or lowering min equity /
                        outstanding.
                        {meta
                          ? ` Scanned ${meta.scanned_houses ?? 0} house allotment(s) and ${meta.scanned_lands ?? 0} land subscription(s).`
                          : null}
                      </p>
                      <Button className="mt-3" variant="outline" size="sm" onClick={resetFilters}>
                        Reset filters
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  candidates.map((c) => (
                    <TableRow key={c.row_key}>
                      <TableCell>
                        <Checkbox
                          checked={Boolean(selected[c.row_key])}
                          onCheckedChange={(v) =>
                            setSelected((prev) => {
                              const next = { ...prev }
                              if (v) next[c.row_key] = c
                              else delete next[c.row_key]
                              return next
                            })
                          }
                          aria-label={`Select ${c.member_name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{c.member_name}</div>
                        <div className="text-xs text-muted-foreground">{c.member_number ?? "—"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{c.asset_type}</Badge>
                          <span className="text-sm">{c.asset_label}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{money(c.outstanding)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        <span className={c.equity_balance > 0 ? "font-medium text-foreground" : "text-muted-foreground"}>
                          {money(c.equity_balance)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{money(c.suggested_payable)}</TableCell>
                      {amountMode === "part" ? (
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            className="h-8 text-right"
                            placeholder="—"
                            disabled={!selected[c.row_key]}
                            value={overrides[c.row_key] ?? ""}
                            onChange={(e) =>
                              setOverrides((prev) => ({ ...prev, [c.row_key]: e.target.value }))
                            }
                          />
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.last_page} · {PER_PAGE} per page
            </p>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.last_page}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Amount mode</CardTitle>
          <CardDescription>
            Full wallet pays min(equity, outstanding) per selected row in order. Part uses a shared amount,
            with optional per-row overrides. Same member across multiple rows shares remaining equity in order.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={amountMode}
            onValueChange={(v) => setAmountMode(v as AmountMode)}
            className="grid gap-3 sm:grid-cols-2"
          >
            <Label
              htmlFor="mode-full"
              className="flex cursor-pointer items-start gap-3 rounded-lg border p-4"
            >
              <RadioGroupItem value="full_wallet" id="mode-full" className="mt-1" />
              <div>
                <div className="font-medium">Full equity wallet</div>
                <p className="text-sm text-muted-foreground">
                  Apply available equity up to each holding&apos;s outstanding balance
                </p>
              </div>
            </Label>
            <Label
              htmlFor="mode-part"
              className="flex cursor-pointer items-start gap-3 rounded-lg border p-4"
            >
              <RadioGroupItem value="part" id="mode-part" className="mt-1" />
              <div>
                <div className="font-medium">Part amount</div>
                <p className="text-sm text-muted-foreground">
                  One amount for all selected, or override specific members in the table
                </p>
              </div>
            </Label>
          </RadioGroup>

          {amountMode === "part" ? (
            <div className="max-w-sm space-y-2">
              <Label htmlFor="global-amount">Global part amount (₦)</Label>
              <Input
                id="global-amount"
                type="number"
                min={0}
                step="0.01"
                value={globalAmount}
                onChange={(e) => setGlobalAmount(e.target.value)}
                placeholder="e.g. 50000"
              />
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void handlePreview()} disabled={previewing || selectedCount === 0}>
              {previewing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Preview repayments ({selectedCount})
            </Button>
            <Button
              variant="default"
              disabled={!preview || preview.payable_count === 0 || executing}
              onClick={() => setConfirmOpen(true)}
            >
              Confirm &amp; execute
            </Button>
          </div>
        </CardContent>
      </Card>

      {preview ? (
        <Card>
          <CardHeader>
            <CardTitle>3. Preview</CardTitle>
            <CardDescription>
              {preview.payable_count} payable · {preview.skipped_count} skipped · {preview.member_count}{" "}
              members · total {money(preview.total_payable)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member / Asset</TableHead>
                    <TableHead className="text-right">Requested</TableHead>
                    <TableHead className="text-right">Equity avail.</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    <TableHead className="text-right">Payable</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.rows.map((r) => (
                    <TableRow key={r.row_key}>
                      <TableCell>
                        <div className="text-sm font-medium">{r.member_name ?? r.member_number ?? r.member_id}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.asset_type} · {r.asset_label ?? r.row_key}
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{money(r.requested)}</TableCell>
                      <TableCell className="text-right tabular-nums">{money(r.equity_available)}</TableCell>
                      <TableCell className="text-right tabular-nums">{money(r.outstanding)}</TableCell>
                      <TableCell className="text-right tabular-nums font-medium">{money(r.payable)}</TableCell>
                      <TableCell>
                        {r.status === "payable" ? (
                          <Badge className="bg-green-600 hover:bg-green-600">Payable</Badge>
                        ) : (
                          <Badge variant="secondary">{r.skip_reason ?? "skipped"}</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {executeResult ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Results
            </CardTitle>
            <CardDescription>
              Batch {executeResult.batch_id} · {executeResult.successful} ok · {executeResult.failed} failed ·{" "}
              {executeResult.skipped} skipped · paid {money(executeResult.total_paid)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {executeResult.results.map((r) => (
                    <TableRow key={`${r.row_key}-${r.result}`}>
                      <TableCell>{r.asset_label ?? r.row_key}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {money(r.paid_amount ?? (r.result === "success" ? r.payable : 0))}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            r.result === "success"
                              ? "default"
                              : r.result === "failed"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {r.result}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm bulk equity repayment</DialogTitle>
            <DialogDescription>
              This will debit equity wallets and post house/land repayments for{" "}
              {preview?.payable_count ?? 0} row(s), totaling {money(preview?.total_payable ?? 0)}. This cannot
              be undone from this screen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={executing}>
              Cancel
            </Button>
            <Button onClick={() => void handleExecute()} disabled={executing}>
              {executing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Execute repayments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
