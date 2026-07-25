"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { AlertCircle, Loader2, RefreshCw, Search, Undo2 } from "lucide-react"
import { useBulkUploadPermission } from "@/lib/admin/bulk-upload-permissions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Pagination } from "@/components/ui/pagination"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"
import { formatNairaAmount } from "@/lib/utils/currency"

type ModuleFilter =
  | "all"
  | "contribution"
  | "equity_contribution"
  | "house_repayment"
  | "land_repayment"
  | "wallet_transfer"
  | "refund"
  | "loan"
  | "loan_repayment"
  | "mortgage"
  | "mortgage_repayment"
  | "internal_mortgage_plan"
  | "internal_mortgage_repayment"

type SearchRow = {
  module: string
  target_id: string
  member_id?: string | null
  member_number?: string | null
  member_name?: string | null
  amount: number
  reference?: string | null
  status?: string | null
  source?: string | null
  asset_label?: string | null
  from_account?: string | null
  to_account?: string | null
  is_reversed: boolean
  occurred_at?: string | null
}

type BatchRow = {
  id: string
  module: string
  source: string
  original_filename?: string | null
  success_count: number
  failed_count: number
  skipped_count: number
  status: string
  created_at: string
  applied_count?: number
  reversed_count?: number
}

type PreviewData = {
  reversible: SearchRow[]
  blocked: Array<{
    module: string
    target_id: string
    reason: string
    dependents?: Array<Record<string, unknown>>
    row?: SearchRow | null
  }>
}

function money(n: number | undefined | null) {
  return formatNairaAmount(n ?? 0, { compact: false })
}

export default function FinancialRollbacksPage() {
  const canRollback = useBulkUploadPermission("rollbacks")
  const { toast } = useToast()

  const [module, setModule] = useState<ModuleFilter>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [member, setMember] = useState("")
  const [reference, setReference] = useState("")
  const [batchId, setBatchId] = useState("")
  const [status, setStatus] = useState<string>("applied")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<SearchRow[]>([])
  const [meta, setMeta] = useState({ page: 1, per_page: 50, total: 0, last_page: 1 })
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [batches, setBatches] = useState<BatchRow[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [rollbackBatchId, setRollbackBatchId] = useState<string | null>(null)

  const selectedItems = useMemo(
    () =>
      rows
        .filter((r) => selected[`${r.module}:${r.target_id}`] && !r.is_reversed)
        .map((r) => ({ module: r.module, target_id: r.target_id })),
    [rows, selected]
  )

  const loadSearch = useCallback(async () => {
    if (!canRollback) return
    setLoading(true)
    try {
      const qs = new URLSearchParams({
        module,
        page: String(page),
        per_page: "50",
      })
      if (status && status !== "all_statuses") qs.set("status", status)
      if (dateFrom) qs.set("date_from", dateFrom)
      if (dateTo) qs.set("date_to", dateTo)
      if (member.trim()) qs.set("member", member.trim())
      if (reference.trim()) qs.set("reference", reference.trim())
      if (batchId.trim()) qs.set("batch_id", batchId.trim())

      const res = await apiFetch<{ success: boolean; data: SearchRow[]; meta: typeof meta }>(
        `/admin/financial-rollbacks/search?${qs.toString()}`
      )
      setRows(res.data ?? [])
      setMeta(res.meta ?? { page: 1, per_page: 50, total: 0, last_page: 1 })
      setSelected({})
    } catch (e: any) {
      toast({
        title: "Search failed",
        description: e?.message || "Could not load reversible transactions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [canRollback, module, page, status, dateFrom, dateTo, member, reference, batchId, toast])

  const loadBatches = useCallback(async () => {
    if (!canRollback) return
    try {
      const res = await apiFetch<{ success: boolean; data: BatchRow[] }>(
        `/admin/financial-rollbacks/batches?per_page=10`
      )
      setBatches(res.data ?? [])
    } catch {
      // non-blocking
    }
  }, [canRollback])

  useEffect(() => {
    void loadSearch()
  }, [loadSearch])

  useEffect(() => {
    void loadBatches()
  }, [loadBatches])

  const openPreviewForSelection = async () => {
    if (selectedItems.length === 0) {
      toast({ title: "Select at least one transaction", variant: "destructive" })
      return
    }
    setRollbackBatchId(null)
    setPreviewing(true)
    try {
      const res = await apiFetch<{ success: boolean; data: PreviewData }>(
        "/admin/financial-rollbacks/preview",
        { method: "POST", body: { items: selectedItems } }
      )
      // apiFetch already returns the JSON payload; normalize preview shape.
      const previewData = (res?.data ?? res) as PreviewData
      setPreview({
        reversible: previewData?.reversible ?? [],
        blocked: previewData?.blocked ?? [],
      })
      setConfirmOpen(true)
    } catch (e: any) {
      toast({
        title: "Preview failed",
        description: e?.message || "Could not preview rollback",
        variant: "destructive",
      })
    } finally {
      setPreviewing(false)
    }
  }

  const openPreviewForBatch = async (id: string) => {
    setRollbackBatchId(id)
    setPreviewing(true)
    try {
      const res = await apiFetch<{ success: boolean; data: PreviewData }>(
        "/admin/financial-rollbacks/preview",
        { method: "POST", body: { batch_id: id } }
      )
      const previewData = (res?.data ?? res) as PreviewData
      setPreview({
        reversible: previewData?.reversible ?? [],
        blocked: previewData?.blocked ?? [],
      })
      setConfirmOpen(true)
    } catch (e: any) {
      toast({
        title: "Preview failed",
        description: e?.message || "Could not preview batch rollback",
        variant: "destructive",
      })
    } finally {
      setPreviewing(false)
    }
  }

  const executeRollback = async () => {
    if (reason.trim().length < 3) {
      toast({ title: "Reason required", description: "Enter at least 3 characters.", variant: "destructive" })
      return
    }
    setExecuting(true)
    try {
      const body = rollbackBatchId
        ? { batch_id: rollbackBatchId, reason: reason.trim() }
        : { items: selectedItems, reason: reason.trim() }

      const res = await apiFetch<{ success: boolean; message: string; data: any }>(
        "/admin/financial-rollbacks/execute",
        { method: "POST", body }
      )

      toast({
        title: res.success ? "Rollback complete" : "Rollback blocked",
        description: res.message,
        variant: res.success ? "default" : "destructive",
      })
      setConfirmOpen(false)
      setReason("")
      setPreview(null)
      await loadSearch()
      await loadBatches()
    } catch (e: any) {
      toast({
        title: "Rollback failed",
        description: e?.message || "Could not execute rollback",
        variant: "destructive",
      })
    } finally {
      setExecuting(false)
    }
  }

  const toggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = {}
    if (checked) {
      for (const r of rows) {
        if (!r.is_reversed) next[`${r.module}:${r.target_id}`] = true
      }
    }
    setSelected(next)
  }

  if (!canRollback) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You need the <strong>rollback_financial_transactions</strong> permission to use this page.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Financial Rollbacks</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Search by date, member, payment reference, or upload batch. Downstream spends block reverse until
          dependents are rolled back first.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent upload batches</CardTitle>
          <CardDescription>One-click rollback for tagged bulk uploads</CardDescription>
        </CardHeader>
        <CardContent>
          {batches.length === 0 ? (
            <p className="text-sm text-muted-foreground">No financial upload batches yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Success</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.module}</TableCell>
                    <TableCell className="max-w-[180px] truncate">{b.original_filename || "—"}</TableCell>
                    <TableCell>{b.success_count}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{b.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{b.created_at?.slice(0, 10)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setBatchId(b.id)
                          setPage(1)
                        }}
                      >
                        Filter
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={b.status === "rolled_back" || previewing}
                        onClick={() => openPreviewForBatch(b.id)}
                      >
                        <Undo2 className="h-3.5 w-3.5 mr-1" />
                        Rollback
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Search payments &amp; repayments</CardTitle>
          <CardDescription>Works without a batch number — use date range and member search</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label>Module</Label>
              <Select value={module} onValueChange={(v) => { setModule(v as ModuleFilter); setPage(1) }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="contribution">Contribution</SelectItem>
                  <SelectItem value="equity_contribution">Equity contribution</SelectItem>
                  <SelectItem value="house_repayment">House repayment</SelectItem>
                  <SelectItem value="land_repayment">Land repayment</SelectItem>
                  <SelectItem value="wallet_transfer">Wallet transfer</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="loan">Loan</SelectItem>
                  <SelectItem value="loan_repayment">Loan repayment</SelectItem>
                  <SelectItem value="mortgage">Mortgage</SelectItem>
                  <SelectItem value="mortgage_repayment">Mortgage repayment</SelectItem>
                  <SelectItem value="internal_mortgage_plan">Internal mortgage plan</SelectItem>
                  <SelectItem value="internal_mortgage_repayment">Internal mortgage repayment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date from</Label>
              <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }} />
            </div>
            <div className="space-y-1.5">
              <Label>Date to</Label>
              <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">Applied (reversible)</SelectItem>
                  <SelectItem value="already_reversed">Already reversed</SelectItem>
                  <SelectItem value="all_statuses">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Member</Label>
              <Input
                placeholder="Member number, staff ID, IPPIS, FRSC, name, email…"
                value={member}
                onChange={(e) => setMember(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Payment reference</Label>
              <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Reference" />
            </div>
            <div className="space-y-1.5">
              <Label>Batch ID</Label>
              <Input value={batchId} onChange={(e) => setBatchId(e.target.value)} placeholder="Optional UUID" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => { setPage(1); void loadSearch() }} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Search
            </Button>
            <Button variant="outline" onClick={() => void loadSearch()} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="destructive"
              disabled={selectedItems.length === 0 || previewing}
              onClick={() => void openPreviewForSelection()}
            >
              <Undo2 className="h-4 w-4 mr-2" />
              Rollback selected ({selectedItems.length})
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={
                      rows.filter((r) => !r.is_reversed).length > 0 &&
                      rows.filter((r) => !r.is_reversed).every((r) => selected[`${r.module}:${r.target_id}`])
                    }
                    onCheckedChange={(c) => toggleAll(Boolean(c))}
                  />
                </TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {loading ? "Loading…" : "No matching transactions"}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => {
                  const key = `${r.module}:${r.target_id}`
                  return (
                    <TableRow key={key}>
                      <TableCell>
                        <Checkbox
                          disabled={r.is_reversed}
                          checked={Boolean(selected[key])}
                          onCheckedChange={(c) =>
                            setSelected((prev) => ({ ...prev, [key]: Boolean(c) }))
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">{r.module}</TableCell>
                      <TableCell>
                        <div className="text-sm">{r.member_name || "—"}</div>
                        <div className="text-xs text-muted-foreground">{r.member_number}</div>
                      </TableCell>
                      <TableCell>{money(r.amount)}</TableCell>
                      <TableCell className="max-w-[160px] truncate text-xs">{r.reference || r.target_id}</TableCell>
                      <TableCell className="text-sm">{r.occurred_at?.slice(0, 10) || "—"}</TableCell>
                      <TableCell>
                        {r.is_reversed ? (
                          <Badge variant="secondary">reversed</Badge>
                        ) : (
                          <Badge>applied</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          {meta.last_page > 1 && (
            <Pagination
              currentPage={meta.page}
              totalPages={meta.last_page}
              onPageChange={setPage}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Confirm rollback</DialogTitle>
            <DialogDescription>
              Compensating ledger rows will be appended. Wallet balance and totals (total contributed / total used)
              are updated together. Blocked rows must have dependents reversed first.
            </DialogDescription>
          </DialogHeader>

          {preview && (
            <div className="space-y-3 text-sm">
              <div>
                <strong>{preview.reversible?.length ?? 0}</strong> reversible ·{" "}
                <strong>{preview.blocked?.length ?? 0}</strong> blocked
              </div>
              {(preview.reversible?.length ?? 0) === 0 && (preview.blocked?.length ?? 0) === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Nothing to reverse. Select rows in the search table, or open Rollback on a batch that still has
                    applied items. Historical uploads from before batch tracking must be selected from search.
                  </AlertDescription>
                </Alert>
              )}
              {(preview.blocked?.length ?? 0) > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {(preview.blocked ?? []).slice(0, 5).map((b) => (
                      <div key={`${b.module}:${b.target_id}`}>
                        {b.module} {b.target_id.slice(0, 8)}… — {b.reason}
                      </div>
                    ))}
                    {(preview.blocked?.length ?? 0) > 5 && (
                      <div>…and {(preview.blocked?.length ?? 0) - 5} more</div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="rollback-reason">Reason</Label>
                <Textarea
                  id="rollback-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why is this being rolled back?"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={executing}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void executeRollback()}
              disabled={executing || !preview || (preview.reversible?.length ?? 0) === 0}
            >
              {executing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Undo2 className="h-4 w-4 mr-2" />}
              Execute rollback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
