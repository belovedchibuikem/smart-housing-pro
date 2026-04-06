"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, CheckCircle, AlertCircle, XCircle, Calendar, CreditCard, User } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { apiFetch, approveMemberSubscription, rejectMemberSubscription } from "@/lib/api/client"
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
  const { isLoading, data, error, loadData } = usePageLoading<MemberSubscriptionsResponse>()

  const reloadList = useCallback(() => {
    const params = new URLSearchParams()
    params.append("type", "list")
    if (searchQuery) params.append("search", searchQuery)
    if (statusFilter !== "all") params.append("status", statusFilter)
    if (paymentStatusFilter !== "all") params.append("payment_status", paymentStatusFilter)
    return loadData(async () => apiFetch<MemberSubscriptionsResponse>(`/super-admin/member-subscriptions?${params.toString()}`))
  }, [loadData, searchQuery, statusFilter, paymentStatusFilter])

  // Debounced search
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (query: string) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          loadData(async () => {
            const params = new URLSearchParams()
            if (query) params.append('search', query)
            if (statusFilter !== 'all') params.append('status', statusFilter)
            if (paymentStatusFilter !== 'all') params.append('payment_status', paymentStatusFilter)
            
            const response = await apiFetch<MemberSubscriptionsResponse>(`/super-admin/member-subscriptions?type=list&${params.toString()}`)
            return response
          })
        }, 300)
      }
    })(),
    [loadData, statusFilter, paymentStatusFilter]
  )

  useEffect(() => {
    debouncedSearch(searchQuery)
  }, [searchQuery, debouncedSearch])

  useEffect(() => {
    loadData(async () => {
      const params = new URLSearchParams()
      params.append('type', 'list')
      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (paymentStatusFilter !== 'all') params.append('payment_status', paymentStatusFilter)
      
      const response = await apiFetch<MemberSubscriptionsResponse>(`/super-admin/member-subscriptions?${params.toString()}`)
      return response
    })
  }, [loadData, statusFilter, paymentStatusFilter])

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (isLoading || !data) return null

  const subscriptions = data?.subscriptions || []
  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (statusFilter !== 'all' && sub.status !== statusFilter) return false
    if (paymentStatusFilter !== 'all' && sub.payment_status !== paymentStatusFilter) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        sub.member_name?.toLowerCase().includes(query) ||
        sub.member_email?.toLowerCase().includes(query) ||
        sub.business_name?.toLowerCase().includes(query) ||
        sub.package_name?.toLowerCase().includes(query) ||
        sub.payment_reference?.toLowerCase().includes(query)
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
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
              placeholder="Search by member name, email, business, package..."
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
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Payment Status</option>
            <option value="completed">Completed</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </Card>

      {/* Subscriptions List */}
      <div className="space-y-4">
        {filteredSubscriptions.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No member subscriptions found.</p>
          </Card>
        ) : (
          filteredSubscriptions.map((subscription) => (
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
      {data?.pagination && data.pagination.total > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Showing {((data.pagination.current_page - 1) * data.pagination.per_page) + 1} to{" "}
            {Math.min(data.pagination.current_page * data.pagination.per_page, data.pagination.total)} of{" "}
            {data.pagination.total} subscriptions
          </p>
        </div>
      )}

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



