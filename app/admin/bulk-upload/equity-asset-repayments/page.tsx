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

function money(n: number | undefined | null) {
  return formatNairaAmount(n ?? 0, { compact: false })
}

export default function BulkEquityAssetRepaymentsPage() {
  const canUpload = useBulkUploadPermission("equity-asset-repayments")
  const { toast } = useToast()

  const [search, setSearch] = useState("")
  const [assetType, setAssetType] = useState<AssetTypeFilter>("all")
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [amountMode, setAmountMode] = useState<AmountMode>("full_wallet")
  const [globalAmount, setGlobalAmount] = useState("")
  const [overrides, setOverrides] = useState<Record<string, string>>({})
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [executeResult, setExecuteResult] = useState<ExecuteData | null>(null)

  const loadCandidates = useCallback(async () => {
    setLoading(true)
    setPreview(null)
    setExecuteResult(null)
    try {
      const qs = new URLSearchParams()
      if (search.trim()) qs.set("search", search.trim())
      if (assetType !== "all") qs.set("asset_type", assetType)
      const res = await apiFetch<{
        success?: boolean
        data?: { candidates?: Candidate[] }
        candidates?: Candidate[]
      }>(`/admin/bulk/equity-asset-repayments/candidates?${qs.toString()}`)
      const list = res.data?.candidates ?? res.candidates ?? []
      setCandidates(Array.isArray(list) ? list : [])
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Failed to load holdings",
        description: e instanceof Error ? e.message : "Unknown error",
      })
      setCandidates([])
    } finally {
      setLoading(false)
    }
  }, [search, assetType, toast])

  useEffect(() => {
    const t = setTimeout(() => {
      void loadCandidates()
    }, 300)
    return () => clearTimeout(t)
  }, [loadCandidates])

  const selectedRows = useMemo(
    () => candidates.filter((c) => selected[c.row_key]),
    [candidates, selected],
  )

  const allVisibleSelected =
    candidates.length > 0 && candidates.every((c) => selected[c.row_key])

  const toggleAll = (checked: boolean) => {
    if (!checked) {
      setSelected({})
      return
    }
    const next: Record<string, boolean> = {}
    candidates.forEach((c) => {
      next[c.row_key] = true
    })
    setSelected(next)
  }

  const buildPayload = () => {
    const overrideList = Object.entries(overrides)
      .filter(([key, val]) => selected[key] && val.trim() !== "" && Number(val) > 0)
      .map(([row_key, amount]) => ({ row_key, amount: Number(amount) }))

    return {
      amount_mode: amountMode,
      amount: amountMode === "part" && globalAmount.trim() ? Number(globalAmount) : null,
      rows: selectedRows.map((r) => ({
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
    if (selectedRows.length === 0) {
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
      await loadCandidates()
      setSelected({})
      setPreview(null)
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bulk Equity → House/Land Repayment</h1>
        <p className="mt-2 text-muted-foreground">
          Apply members&apos; equity wallet balances to house and land outstanding balances in one batch.
          Choose full wallet or a part amount (global and/or per member).
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>1. Select holdings</CardTitle>
            <CardDescription>Active house allocations and land subscriptions with outstanding balances</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => void loadCandidates()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search member, property, land…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <RadioGroup
              value={assetType}
              onValueChange={(v) => setAssetType(v as AssetTypeFilter)}
              className="flex flex-row flex-wrap items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="all" id="asset-all" />
                <Label htmlFor="asset-all">All</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="house" id="asset-house" />
                <Label htmlFor="asset-house">Houses</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="land" id="asset-land" />
                <Label htmlFor="asset-land">Lands</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allVisibleSelected}
                      onCheckedChange={(v) => toggleAll(Boolean(v))}
                      aria-label="Select all"
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
                    <TableCell colSpan={amountMode === "part" ? 7 : 6} className="py-10 text-center text-muted-foreground">
                      <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                      Loading holdings…
                    </TableCell>
                  </TableRow>
                ) : candidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={amountMode === "part" ? 7 : 6} className="py-10 text-center text-muted-foreground">
                      No eligible holdings found
                    </TableCell>
                  </TableRow>
                ) : (
                  candidates.map((c) => (
                    <TableRow key={c.row_key}>
                      <TableCell>
                        <Checkbox
                          checked={Boolean(selected[c.row_key])}
                          onCheckedChange={(v) =>
                            setSelected((prev) => ({ ...prev, [c.row_key]: Boolean(v) }))
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
                      <TableCell className="text-right tabular-nums">{money(c.equity_balance)}</TableCell>
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
          <p className="text-sm text-muted-foreground">
            {selectedRows.length} selected of {candidates.length} shown
          </p>
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
            <Button onClick={() => void handlePreview()} disabled={previewing || selectedRows.length === 0}>
              {previewing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Preview repayments
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
