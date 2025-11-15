"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePageLoading } from "@/hooks/use-loading"
import {
  getAdminRefundRequests,
  getAdminRefundStats,
  approveRefundRequest,
  rejectRefundRequest,
  type RefundRequest,
  type RefundStats,
} from "@/lib/api/client"
import {
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Filter,
  Receipt,
  DollarSign,
} from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import Link from "next/link"

export default function AdminRefundsPage() {
  const { isLoading, loadData } = usePageLoading()
  const [refunds, setRefunds] = useState<RefundRequest[]>([])
  const [stats, setStats] = useState<RefundStats | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [adminResponse, setAdminResponse] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [processImmediately, setProcessImmediately] = useState(false)
  const [processing, setProcessing] = useState(false)

  const requestTypeLabels: Record<string, string> = {
    refund: "Refund",
    stoppage_of_deduction: "Stoppage of Deduction",
    building_plan: "Building Plan",
    tdp: "TDP",
    change_of_ownership: "Change of Ownership",
    other: "Other",
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-blue-100 text-blue-800",
    rejected: "bg-red-100 text-red-800",
    processing: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
  }

  const loadRefunds = useCallback(async () => {
    try {
      const response = await loadData(() => getAdminRefundRequests({
        status: statusFilter !== "all" ? statusFilter : undefined,
        request_type: typeFilter !== "all" ? typeFilter : undefined,
        search: searchQuery || undefined,
        page: currentPage,
        per_page: 15,
      }))
      if (response) {
        setRefunds(response.refunds)
        setTotalPages(response.pagination.last_page)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load refund requests")
    }
  }, [statusFilter, typeFilter, searchQuery, currentPage, loadData])

  const loadStats = useCallback(async () => {
    try {
      const response = await getAdminRefundStats()
      setStats(response.stats)
    } catch (error: any) {
      console.error("Failed to load stats:", error)
    }
  }, [])

  useEffect(() => {
    loadRefunds()
    loadStats()
  }, [loadRefunds, loadStats])

  const handleApprove = async () => {
    if (!selectedRefund) return

    try {
      setProcessing(true)
      await approveRefundRequest(selectedRefund.id, {
        admin_response: adminResponse,
        process_immediately: processImmediately,
      })
      toast.success("Refund request approved successfully")
      setApproveDialogOpen(false)
      setAdminResponse("")
      setProcessImmediately(false)
      loadRefunds()
      loadStats()
    } catch (error: any) {
      toast.error(error.message || "Failed to approve refund request")
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRefund || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason")
      return
    }

    try {
      setProcessing(true)
      await rejectRefundRequest(selectedRefund.id, rejectionReason)
      toast.success("Refund request rejected successfully")
      setRejectDialogOpen(false)
      setRejectionReason("")
      loadRefunds()
      loadStats()
    } catch (error: any) {
      toast.error(error.message || "Failed to reject refund request")
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Refund Requests</h1>
          <p className="text-muted-foreground mt-1">Manage refund and service requests from members</p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_requests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Refunded</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_refunded)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ticket number, member name, or reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Request Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
                <SelectItem value="stoppage_of_deduction">Stoppage of Deduction</SelectItem>
                <SelectItem value="building_plan">Building Plan</SelectItem>
                <SelectItem value="tdp">TDP</SelectItem>
                <SelectItem value="change_of_ownership">Change of Ownership</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => loadRefunds()} variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Refunds Table */}
      <Card>
        <CardHeader>
          <CardTitle>Refund Requests</CardTitle>
          <CardDescription>Review and manage refund requests from members</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : refunds.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No refund requests found</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket #</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Request Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {refunds.map((refund) => (
                      <TableRow key={refund.id}>
                        <TableCell className="font-mono text-sm">{refund.ticket_number}</TableCell>
                        <TableCell>
                          {refund.member?.user
                            ? `${refund.member.user.first_name} ${refund.member.user.last_name}`
                            : "—"}
                        </TableCell>
                        <TableCell>{requestTypeLabels[refund.request_type] || refund.request_type}</TableCell>
                        <TableCell>
                          {refund.request_type === "refund" && refund.amount > 0
                            ? formatCurrency(refund.amount)
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[refund.status] || ""}>{refund.status}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(refund.requested_at || refund.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedRefund(refund)
                                // Open detail view or dialog
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {refund.status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRefund(refund)
                                    setApproveDialogOpen(true)
                                  }}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRefund(refund)
                                    setRejectDialogOpen(true)
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
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

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Approve Refund Request</DialogTitle>
            <DialogDescription>
              Approve the refund request for {selectedRefund?.ticket_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Admin Response (Optional)</Label>
              <Textarea
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Add a response message for the member..."
                rows={4}
              />
            </div>
            {selectedRefund?.request_type === "refund" && selectedRefund.amount > 0 && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="process-immediately"
                  checked={processImmediately}
                  onCheckedChange={setProcessImmediately}
                />
                <Label htmlFor="process-immediately">Process refund immediately</Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={processing}>
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Refund Request</DialogTitle>
            <DialogDescription>
              Reject the refund request for {selectedRefund?.ticket_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rejection Reason *</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a reason for rejection..."
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReject} disabled={processing || !rejectionReason.trim()} variant="destructive">
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

