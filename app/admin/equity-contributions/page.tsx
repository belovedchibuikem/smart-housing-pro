"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, CheckCircle, XCircle, Loader2, Download } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast as sonnerToast } from "sonner"
import { apiFetch } from "@/lib/api/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface EquityContribution {
  id: string
  member?: {
    member_number?: string
    user?: {
      first_name?: string
      last_name?: string
    }
  }
  plan?: {
    name?: string
  }
  amount: number
  payment_method: string
  status: string
  payment_reference?: string
  notes?: string
  rejection_reason?: string
  approved_at?: string
  created_at: string
}

interface Pagination {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export default function AdminEquityContributionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all")
  const [contributions, setContributions] = useState<EquityContribution[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [selectedContribution, setSelectedContribution] = useState<EquityContribution | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [stats, setStats] = useState({
    totalThisMonth: 0,
    pending: 0,
    approved: 0,
    totalAllTime: 0,
  })
  const router = useRouter()

  const fetchContributions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (paymentMethodFilter !== 'all') params.append('payment_method', paymentMethodFilter)
      params.append('per_page', '15')

      const response = await apiFetch<{ success: boolean; data: EquityContribution[]; pagination: Pagination }>(
        `/admin/equity-contributions?${params.toString()}`
      )

      if (response.success) {
        setContributions(response.data || [])
        setPagination(response.pagination || null)
      }
    } catch (error: any) {
      console.error('Error fetching equity contributions:', error)
      sonnerToast.error("Failed to load equity contributions", {
        description: error.message || "Please try again later",
      })
    } finally {
      setLoading(false)
    }
  }

  const normalizeAmount = (value: unknown): number => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  const fetchStats = async () => {
    try {
      const allResponse = await apiFetch<{ success: boolean; data: EquityContribution[] }>('/admin/equity-contributions?per_page=1000')
      if (allResponse.success && allResponse.data) {
        const now = new Date()
        const thisMonth = allResponse.data.filter((c: EquityContribution) => {
          const date = new Date(c.created_at)
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
        })

        const totalThisMonth = thisMonth.reduce(
          (sum: number, contribution: EquityContribution) => sum + normalizeAmount(contribution.amount),
          0,
        )
        const pending = allResponse.data.filter((c: EquityContribution) => c.status === 'pending').length
        const approved = allResponse.data.filter((c: EquityContribution) => c.status === 'approved').length
        const totalAllTime = allResponse.data.reduce(
          (sum: number, contribution: EquityContribution) => sum + normalizeAmount(contribution.amount),
          0,
        )

        setStats({ totalThisMonth, pending, approved, totalAllTime })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    fetchContributions()
    fetchStats()
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchContributions()
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery, statusFilter, paymentMethodFilter])

  const handleApprove = async (id: string) => {
    try {
      setProcessing(id)
      const response = await apiFetch<{ success: boolean; message?: string }>(
        `/admin/equity-contributions/${id}/approve`,
        { method: 'POST' }
      )

      if (response.success) {
        sonnerToast.success("Contribution Approved", {
          description: response.message || "Equity contribution has been approved and added to wallet",
        })
        fetchContributions()
        fetchStats()
      }
    } catch (error: any) {
      console.error('Error approving contribution:', error)
      sonnerToast.error("Failed to approve contribution", {
        description: error.message || "Please try again later",
      })
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async () => {
    if (!selectedContribution || !rejectionReason.trim()) {
      sonnerToast.error("Rejection reason is required")
      return
    }

    try {
      setProcessing(selectedContribution.id)
      const response = await apiFetch<{ success: boolean; message?: string }>(
        `/admin/equity-contributions/${selectedContribution.id}/reject`,
        {
          method: 'POST',
          body: { rejection_reason: rejectionReason }
        }
      )

      if (response.success) {
        sonnerToast.success("Contribution Rejected", {
          description: response.message || "Equity contribution has been rejected",
        })
        setShowRejectDialog(false)
        setSelectedContribution(null)
        setRejectionReason("")
        fetchContributions()
        fetchStats()
      }
    } catch (error: any) {
      console.error('Error rejecting contribution:', error)
      sonnerToast.error("Failed to reject contribution", {
        description: error.message || "Please try again later",
      })
    } finally {
      setProcessing(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      approved: "default",
      pending: "secondary",
      rejected: "destructive",
      failed: "destructive",
    }

    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const currencyFormatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Equity Contributions</h1>
          <p className="text-muted-foreground mt-1">Manage equity contributions for property deposits</p>
        </div>
        <Link href="/admin/bulk-upload/equity-contributions">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total This Month</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums break-words">
              {currencyFormatter.format(stats.totalThisMonth || 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Approval</CardDescription>
            <CardTitle className="text-2xl">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-2xl">{stats.approved}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total All Time</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums break-words">
              {currencyFormatter.format(stats.totalAllTime || 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by member name or number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="paystack">Paystack</SelectItem>
                <SelectItem value="remita">Remita</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contributions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No equity contributions found
                  </TableCell>
                </TableRow>
              ) : (
                contributions.map((contribution) => (
                  <TableRow key={contribution.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {contribution.member?.user?.first_name} {contribution.member?.user?.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {contribution.member?.member_number}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{contribution.plan?.name || "N/A"}</TableCell>
                    <TableCell className="font-semibold tabular-nums">
                      {currencyFormatter.format(normalizeAmount(contribution.amount))}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {contribution.payment_method?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {contribution.payment_reference || "N/A"}
                    </TableCell>
                    <TableCell>{getStatusBadge(contribution.status)}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(contribution.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/equity-contributions/${contribution.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {contribution.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(contribution.id)}
                              disabled={processing === contribution.id}
                            >
                              {processing === contribution.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedContribution(contribution)
                                setShowRejectDialog(true)
                              }}
                              disabled={processing === contribution.id}
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
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

          {pagination && pagination.total > pagination.per_page && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                {pagination.total} contributions
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const params = new URLSearchParams(window.location.search)
                    params.set('page', String(pagination.current_page - 1))
                    window.location.search = params.toString()
                  }}
                  disabled={pagination.current_page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const params = new URLSearchParams(window.location.search)
                    params.set('page', String(pagination.current_page + 1))
                    window.location.search = params.toString()
                  }}
                  disabled={pagination.current_page === pagination.last_page}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Equity Contribution</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this contribution
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedContribution && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm">
                  <div className="font-medium">Member: {selectedContribution.member?.user?.first_name} {selectedContribution.member?.user?.last_name}</div>
                  <div className="text-muted-foreground">Amount: ₦{parseFloat(selectedContribution.amount.toString()).toLocaleString()}</div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="rejection_reason">Rejection Reason *</Label>
              <Textarea
                id="rejection_reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRejectDialog(false)
              setSelectedContribution(null)
              setRejectionReason("")
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing !== null || !rejectionReason.trim()}>
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Contribution"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

