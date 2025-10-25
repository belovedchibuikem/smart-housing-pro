"use client"

import { Textarea } from "@/components/ui/textarea"

import { Label } from "@/components/ui/label"

import { useState, useEffect, useCallback } from "react"
import { apiFetch } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Globe, CheckCircle, XCircle, Clock, Search, Eye, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface DomainRequest {
  id: string
  tenant_id: string
  business_name: string
  full_domain: string
  status: "pending" | "verifying" | "verified" | "active" | "failed" | "rejected"
  verification_token: string
  dns_records: Array<{ type: string; name: string; value: string }>
  requested_at: string
  admin_notes?: string
}

interface DomainRequestsResponse {
  requests: DomainRequest[]
  stats: {
    total: number
    pending: number
    verified: number
    active: number
  }
}

export default function DomainRequestsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState<DomainRequest | null>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const { isLoading, data, error, loadData } = usePageLoading<DomainRequestsResponse>()

  const debouncedSearch = useCallback(() => {
    const timeoutId = setTimeout(() => {
      loadData(async () => {
        const params = new URLSearchParams()
        if (searchQuery) params.append('search', searchQuery)
        if (statusFilter !== 'all') params.append('status', statusFilter)
        
        const response = await apiFetch<DomainRequestsResponse>(`/super-admin/domain-requests?${params.toString()}`)
        return response
      })
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, statusFilter, loadData])

  useEffect(() => {
    debouncedSearch()
  }, [debouncedSearch])

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (isLoading || !data) return null // Let the skeleton loader handle the display

  const requests = data?.requests || []
  const stats = data?.stats

  const handleReview = (request: DomainRequest, action: "approve" | "reject") => {
    setSelectedRequest(request)
    setReviewAction(action)
    setAdminNotes("")
    setShowReviewDialog(true)
  }

  const handleSubmitReview = async () => {
    if (!selectedRequest || !reviewAction) return

    try {
      await apiFetch(`/super-admin/domain-requests/${selectedRequest.id}/review`, {
        method: 'POST',
        body: {
          action: reviewAction,
          admin_notes: adminNotes
        }
      })

      toast({
        title: "Success",
        description: `Domain request ${reviewAction === "approve" ? "approved" : "rejected"} successfully`,
      })

      setShowReviewDialog(false)
      // Reload data
      loadData(async () => {
        const params = new URLSearchParams()
        if (searchQuery) params.append('search', searchQuery)
        if (statusFilter !== 'all') params.append('status', statusFilter)
        
        const response = await apiFetch<DomainRequestsResponse>(`/super-admin/domain-requests?${params.toString()}`)
        return response
      })
    } catch (error) {
      console.error("Error reviewing domain request:", error)
      toast({
        title: "Error",
        description: "Failed to process domain request",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      pending: { variant: "secondary", icon: Clock, label: "Pending" },
      verifying: { variant: "default", icon: Clock, label: "Verifying" },
      verified: { variant: "default", icon: CheckCircle, label: "Verified" },
      active: { variant: "default", icon: CheckCircle, label: "Active" },
      failed: { variant: "destructive", icon: XCircle, label: "Failed" },
      rejected: { variant: "destructive", icon: XCircle, label: "Rejected" },
    }

    const config = variants[status] || variants.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Domain Requests</h1>
        <p className="text-muted-foreground mt-2">Review and manage custom domain requests from businesses</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <p className="text-2xl font-bold mt-1">{stats?.total || 0}</p>
            </div>
            <Globe className="h-8 w-8 text-primary" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
              <p className="text-2xl font-bold mt-1">{stats?.pending || 0}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Verified</p>
              <p className="text-2xl font-bold mt-1">{stats?.verified || 0}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold mt-1">{stats?.active || 0}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by business name or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verifying">Verifying</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Domain Requests</CardTitle>
          <CardDescription>Review and approve custom domain requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No domain requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <Link
                          href={`/super-admin/businesses/${request.tenant_id}`}
                          className="font-medium hover:underline"
                        >
                          {request.business_name}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{request.full_domain}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>{new Date(request.requested_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/super-admin/domain-requests/${request.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </Button>
                          {request.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 bg-transparent"
                                onClick={() => handleReview(request, "approve")}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive bg-transparent"
                                onClick={() => handleReview(request, "reject")}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Reject
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
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{reviewAction === "approve" ? "Approve" : "Reject"} Domain Request</DialogTitle>
            <DialogDescription>
              {reviewAction === "approve"
                ? "Approve this custom domain request to allow the business to use it."
                : "Reject this custom domain request. The business will be notified."}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm font-medium">Business</p>
                <p className="text-sm text-muted-foreground">{selectedRequest.business_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Domain</p>
                <p className="text-sm text-muted-foreground font-mono">{selectedRequest.full_domain}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-notes">Admin Notes (Optional)</Label>
                <Textarea
                  id="admin-notes"
                  placeholder="Add notes about this decision..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReview} variant={reviewAction === "approve" ? "default" : "destructive"}>
              {reviewAction === "approve" ? "Approve Request" : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
