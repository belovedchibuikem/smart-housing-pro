"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  CheckCircle,
  XCircle,
  Calendar,
  CreditCard,
  User,
  Loader2,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useLayoutEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
  apiFetch,
  approveMemberSubscription,
  rejectMemberSubscription,
  bulkApproveSuperAdminMemberSubscriptions,
  bulkRejectSuperAdminMemberSubscriptions,
  getSuperAdminPendingBadges,
} from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface MemberSubscription {
  id: string
  business_name?: string
  business_id: string
  member_id: string
  member_name?: string
  member_number?: string
  member_email?: string
  package_name: string
  package_id: string
  status: string
  payment_status: string
  payment_method: string
  start_date: string
  end_date: string
  amount_paid: number
  payment_reference?: string
  bulk_batch_id?: string | null
  is_bulk_member_subscription_line?: boolean
  created_at: string
  updated_at: string
}

interface MemberSubscriptionsResponse {
  success?: boolean
  subscriptions: MemberSubscription[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateString
  }
}

function getStatusBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    expired: "secondary",
    cancelled: "destructive",
    past_due: "destructive",
  }
  return variants[status] || "secondary"
}

function getPaymentStatusBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    completed: "default",
    approved: "default",
    pending: "secondary",
    rejected: "destructive",
  }
  return variants[status] || "secondary"
}

export default function MemberSubscriptionsListPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all")
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [bulkBatchIdFilter, setBulkBatchIdFilter] = useState("")
  const [bulkBusy, setBulkBusy] = useState(false)
  const [confirmBulkApproveOpen, setConfirmBulkApproveOpen] = useState(false)
  const [confirmBulkRejectOpen, setConfirmBulkRejectOpen] = useState(false)
  const [bulkRejectReason, setBulkRejectReason] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [pendingPaymentBadge, setPendingPaymentBadge] = useState(0)
  const { isLoading, data, error, loadData } = usePageLoading<MemberSubscriptionsResponse>()

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await getSuperAdminPendingBadges()
        if (!cancelled && res?.success && res.counts) {
          setPendingPaymentBadge(res.counts.member_subscription_payments_pending ?? 0)
        }
      } catch {
        if (!cancelled) setPendingPaymentBadge(0)
      }
    }
    load()
    const t = setInterval(load, 120000)
    return () => {
      cancelled = true
      clearInterval(t)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  useLayoutEffect(() => {
    setPage(1)
  }, [debouncedSearchQuery, statusFilter, paymentStatusFilter, bulkBatchIdFilter, perPage])

  const loadSubscriptions = useCallback(async () => {
    const params = new URLSearchParams()
    params.set("type", "list")
    params.set("page", String(page))
    params.set("per_page", String(perPage))
    if (debouncedSearchQuery.trim()) params.set("search", debouncedSearchQuery.trim())
    if (statusFilter !== "all") params.set("status", statusFilter)
    if (paymentStatusFilter !== "all") params.set("payment_status", paymentStatusFilter)
    if (bulkBatchIdFilter.trim()) params.set("bulk_batch_id", bulkBatchIdFilter.trim())
    return apiFetch<MemberSubscriptionsResponse>(`/super-admin/member-subscriptions?${params.toString()}`)
  }, [page, perPage, debouncedSearchQuery, statusFilter, paymentStatusFilter, bulkBatchIdFilter])

  useEffect(() => {
    loadData(loadSubscriptions)
  }, [loadData, loadSubscriptions])

  const buildBulkFilters = useCallback(() => {
    const filters: { search?: string; status?: string; bulk_batch_id?: string } = {}
    if (debouncedSearchQuery.trim()) filters.search = debouncedSearchQuery.trim()
    if (statusFilter !== "all") filters.status = statusFilter
    if (bulkBatchIdFilter.trim()) filters.bulk_batch_id = bulkBatchIdFilter.trim()
    return Object.keys(filters).length ? filters : undefined
  }, [debouncedSearchQuery, statusFilter, bulkBatchIdFilter])

  const reloadList = useCallback(() => {
    return loadData(loadSubscriptions)
  }, [loadData, loadSubscriptions])

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!data && isLoading) {
    return (
      <div className="flex justify-center items-center py-24 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Loading subscriptions…
      </div>
    )
  }
  if (!data) return null

  const subscriptions = data.subscriptions || []

  return (
    <div className={cn("space-y-6 relative", isLoading && "opacity-75")}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Member Subscriptions</h1>
          <p className="text-muted-foreground">Manage and monitor all member subscriptions</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Package, payment ref, batch ID, payer name/phone, business name, member UUID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div
              className="inline-flex h-9 items-center rounded-lg bg-muted p-1 text-muted-foreground shrink-0"
              role="tablist"
              aria-label="Payment status quick filter"
            >
              <button
                type="button"
                role="tab"
                aria-selected={paymentStatusFilter === "all"}
                className={cn(
                  "inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium transition-all",
                  paymentStatusFilter === "all"
                    ? "bg-background text-foreground shadow"
                    : "hover:text-foreground",
                )}
                onClick={() => setPaymentStatusFilter("all")}
              >
                All payments
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={paymentStatusFilter === "pending"}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-md px-3 py-1 text-sm font-medium transition-all",
                  paymentStatusFilter === "pending"
                    ? "bg-background text-foreground shadow"
                    : "hover:text-foreground",
                )}
                onClick={() => setPaymentStatusFilter("pending")}
              >
                Pending
                {pendingPaymentBadge > 0 ? (
                  <Badge variant="destructive" className="h-5 min-w-[1.25rem] px-1 text-[10px] tabular-nums">
                    {pendingPaymentBadge > 99 ? "99+" : pendingPaymentBadge}
                  </Badge>
                ) : null}
              </button>
            </div>
            <select
              value={["all", "pending"].includes(paymentStatusFilter) ? "" : paymentStatusFilter}
              onChange={(e) => {
                const v = e.target.value
                if (v) setPaymentStatusFilter(v)
              }}
              className="px-4 py-2 border rounded-lg min-w-[180px]"
              aria-label="Other payment statuses"
            >
              <option value="">Other status…</option>
              <option value="completed">Completed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <Input
            placeholder="Bulk batch ID (optional)"
            value={bulkBatchIdFilter}
            onChange={(e) => setBulkBatchIdFilter(e.target.value)}
            className="md:max-w-[220px]"
            title="Limit list and bulk actions to one bulk import batch"
          />
        </div>
        {paymentStatusFilter === "pending" && (
          <div className="mt-4 pt-4 border-t flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
            <p className="text-sm text-muted-foreground flex items-start gap-2">
              <Layers className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                <strong>Bulk payment review:</strong> approve or reject every subscription with{" "}
                <strong>pending payment</strong> that matches the filters above (search, subscription status, batch ID).
                This uses the server-side total — currently{" "}
                <strong>{(data?.pagination?.total ?? 0).toLocaleString()}</strong> — not just the rows on this page.
              </span>
            </p>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Button
                type="button"
                className="bg-green-600 hover:bg-green-700"
                disabled={bulkBusy}
                onClick={() => setConfirmBulkApproveOpen(true)}
              >
                {bulkBusy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Approve all matching
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={bulkBusy}
                onClick={() => {
                  setBulkRejectReason("")
                  setConfirmBulkRejectOpen(true)
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject all matching
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Subscriptions List */}
      <div className="space-y-4">
        {subscriptions.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No member subscriptions found.</p>
          </Card>
        ) : (
          subscriptions.map((subscription) => (
            <Card key={subscription.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {subscription.member_name || subscription.member_email || 'Unknown Member'}
                        </h3>
                        {subscription.member_number && (
                          <p className="text-sm text-muted-foreground">Member #: {subscription.member_number}</p>
                        )}
                      </div>
                      <Badge variant={getStatusBadge(subscription.status)}>{subscription.status}</Badge>
                      <Badge variant={getPaymentStatusBadge(subscription.payment_status)}>
                        {subscription.payment_status}
                      </Badge>
                      {subscription.is_bulk_member_subscription_line && (
                        <Badge variant="outline">Bulk batch</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Package</p>
                        <p className="font-medium">{subscription.package_name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-medium flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />₦{Number(subscription.amount_paid).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Period</p>
                        <p className="font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(subscription.start_date)} - {formatDate(subscription.end_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Payment Method</p>
                        <p className="font-medium capitalize">{subscription.payment_method}</p>
                      </div>
                    </div>
                    {subscription.business_name && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        Business: {subscription.business_name}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  {subscription.payment_status === "pending" && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        disabled={actionLoadingId === subscription.id}
                        onClick={async () => {
                          setActionLoadingId(subscription.id)
                          try {
                            await approveMemberSubscription(subscription.id)
                            toast.success("Payment approved")
                            await reloadList()
                          } catch (e: unknown) {
                            toast.error(e instanceof Error ? e.message : "Approve failed")
                          } finally {
                            setActionLoadingId(null)
                          }
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={actionLoadingId === subscription.id}
                        onClick={() => {
                          setRejectId(subscription.id)
                          setRejectionReason("")
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  <Link href={`/super-admin/member-subscriptions/${subscription.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {data.pagination && data.pagination.total > 0 && (
        <Card className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground whitespace-nowrap">Per page</span>
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="border rounded-md px-2 py-1.5 bg-background"
              >
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <p className="text-sm text-muted-foreground text-center lg:flex-1">
              Showing {((data.pagination.current_page - 1) * data.pagination.per_page) + 1}–
              {Math.min(data.pagination.current_page * data.pagination.per_page, data.pagination.total)} of{" "}
              {data.pagination.total.toLocaleString()} subscriptions
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={data.pagination.current_page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm tabular-nums text-muted-foreground px-2 min-w-[8rem] text-center">
                Page {data.pagination.current_page} of {data.pagination.last_page}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={data.pagination.current_page >= data.pagination.last_page || isLoading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      <AlertDialog open={confirmBulkApproveOpen} onOpenChange={setConfirmBulkApproveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve all matching pending payments?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span>
                Subscriptions that match your current filters will be marked approved and activated (up to the platform
                limit per request). Platform transactions linked by payment reference will be completed.
              </span>
              {data?.pagination?.total != null && (
                <span className="block font-medium text-foreground">
                  Estimated rows: {data.pagination.total.toLocaleString()} (pending + filters)
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkBusy}>Cancel</AlertDialogCancel>
            <Button
              className="bg-green-600 hover:bg-green-700"
              disabled={bulkBusy}
              onClick={async () => {
                setBulkBusy(true)
                try {
                  const filters = buildBulkFilters()
                  const res = await bulkApproveSuperAdminMemberSubscriptions(
                    filters && Object.keys(filters).length > 0 ? { filters } : {}
                  )
                  toast.success(res.message || `Approved ${res.approved_count ?? 0} subscription(s)`)
                  setConfirmBulkApproveOpen(false)
                  await reloadList()
                } catch (e: unknown) {
                  toast.error(e instanceof Error ? e.message : "Bulk approve failed")
                } finally {
                  setBulkBusy(false)
                }
              }}
            >
              {bulkBusy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm approve all
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmBulkRejectOpen} onOpenChange={setConfirmBulkRejectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject all matching pending payments?</AlertDialogTitle>
            <AlertDialogDescription>
              Matching subscriptions will be rejected and cancelled. This applies to every pending row that matches your
              filters, not only this page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="bulk-reject-reason">Reason (required)</Label>
            <Textarea
              id="bulk-reject-reason"
              value={bulkRejectReason}
              onChange={(e) => setBulkRejectReason(e.target.value)}
              placeholder="Reason for rejection…"
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkBusy}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={bulkBusy || !bulkRejectReason.trim()}
              onClick={async () => {
                if (!bulkRejectReason.trim()) return
                setBulkBusy(true)
                try {
                  const filters = buildBulkFilters()
                  const res = await bulkRejectSuperAdminMemberSubscriptions({
                    rejection_reason: bulkRejectReason.trim(),
                    ...(filters && Object.keys(filters).length > 0 ? { filters } : {}),
                  })
                  toast.success(res.message || `Rejected ${res.rejected_count ?? 0} subscription(s)`)
                  setConfirmBulkRejectOpen(false)
                  setBulkRejectReason("")
                  await reloadList()
                } catch (e: unknown) {
                  toast.error(e instanceof Error ? e.message : "Bulk reject failed")
                } finally {
                  setBulkBusy(false)
                }
              }}
            >
              {bulkBusy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm reject all
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={rejectId !== null} onOpenChange={(open) => !open && setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject payment</DialogTitle>
            <DialogDescription>Provide a reason. The subscription will be cancelled.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Reason</Label>
            <Textarea
              id="reject-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection…"
              rows={4}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectId || !rejectionReason.trim() || actionLoadingId !== null}
              onClick={async () => {
                if (!rejectId || !rejectionReason.trim()) return
                setActionLoadingId(rejectId)
                try {
                  await rejectMemberSubscription(rejectId, rejectionReason.trim())
                  toast.success("Payment rejected")
                  setRejectId(null)
                  setRejectionReason("")
                  await reloadList()
                } catch (e: unknown) {
                  toast.error(e instanceof Error ? e.message : "Reject failed")
                } finally {
                  setActionLoadingId(null)
                }
              }}
            >
              Reject payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}



