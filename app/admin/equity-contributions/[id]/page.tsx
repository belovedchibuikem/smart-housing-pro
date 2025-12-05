"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"
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
      email?: string
    }
  }
  plan?: {
    name?: string
    description?: string
  }
  amount: number
  payment_method: string
  status: string
  payment_reference?: string
  transaction_id?: string
  notes?: string
  rejection_reason?: string
  approved_by?: string
  approved_at?: string
  rejected_at?: string
  paid_at?: string
  created_at: string
}

export default function EquityContributionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [contribution, setContribution] = useState<EquityContribution | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    fetchContribution()
  }, [params.id])

  const fetchContribution = async () => {
    try {
      setLoading(true)
      const response = await apiFetch<{ success: boolean; data: EquityContribution }>(
        `/admin/equity-contributions/${params.id}`
      )

      if (response.success) {
        setContribution(response.data)
      }
    } catch (error: any) {
      console.error('Error fetching equity contribution:', error)
      sonnerToast.error("Failed to load contribution", {
        description: error.message || "Please try again later",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!contribution) return

    try {
      setProcessing(true)
      const response = await apiFetch<{ success: boolean; message?: string }>(
        `/admin/equity-contributions/${contribution.id}/approve`,
        { method: 'POST' }
      )

      if (response.success) {
        sonnerToast.success("Contribution Approved", {
          description: response.message || "Equity contribution has been approved and added to wallet",
        })
        fetchContribution()
      }
    } catch (error: any) {
      console.error('Error approving contribution:', error)
      sonnerToast.error("Failed to approve contribution", {
        description: error.message || "Please try again later",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!contribution || !rejectionReason.trim()) {
      sonnerToast.error("Rejection reason is required")
      return
    }

    try {
      setProcessing(true)
      const response = await apiFetch<{ success: boolean; message?: string }>(
        `/admin/equity-contributions/${contribution.id}/reject`,
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
        setRejectionReason("")
        fetchContribution()
      }
    } catch (error: any) {
      console.error('Error rejecting contribution:', error)
      sonnerToast.error("Failed to reject contribution", {
        description: error.message || "Please try again later",
      })
    } finally {
      setProcessing(false)
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

  if (!contribution) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Contribution not found</p>
        <Link href="/admin/equity-contributions">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contributions
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/equity-contributions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Equity Contribution Details</h1>
            <p className="text-muted-foreground mt-1">View and manage equity contribution</p>
          </div>
        </div>
        {contribution.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(true)}
              disabled={processing}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contribution Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <div className="mt-1">{getStatusBadge(contribution.status)}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Amount</Label>
              <div className="mt-1 text-2xl font-bold">
                ₦{parseFloat(contribution.amount.toString()).toLocaleString()}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Payment Method</Label>
              <div className="mt-1 capitalize">
                {contribution.payment_method?.replace('_', ' ')}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Payment Reference</Label>
              <div className="mt-1 font-mono text-sm">
                {contribution.payment_reference || "N/A"}
              </div>
            </div>
            {contribution.transaction_id && (
              <div>
                <Label className="text-muted-foreground">Transaction ID</Label>
                <div className="mt-1 font-mono text-sm">
                  {contribution.transaction_id}
                </div>
              </div>
            )}
            {contribution.plan && (
              <div>
                <Label className="text-muted-foreground">Equity Plan</Label>
                <div className="mt-1">
                  <div className="font-medium">{contribution.plan.name}</div>
                  {contribution.plan.description && (
                    <div className="text-sm text-muted-foreground">{contribution.plan.description}</div>
                  )}
                </div>
              </div>
            )}
            {contribution.notes && (
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <div className="mt-1 font-medium">{contribution.notes}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Member Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Member Name</Label>
              <div className="mt-1 font-medium">
                {contribution.member?.user?.first_name} {contribution.member?.user?.last_name}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Member Number</Label>
              <div className="mt-1 font-mono">
                {contribution.member?.member_number}
              </div>
            </div>
            {contribution.member?.user?.email && (
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <div className="mt-1">
                  {contribution.member.user.email}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Submitted</Label>
              <div className="mt-1">
                {new Date(contribution.created_at).toLocaleString()}
              </div>
            </div>
            {contribution.approved_at && (
              <div>
                <Label className="text-muted-foreground">Approved At</Label>
                <div className="mt-1">
                  {new Date(contribution.approved_at).toLocaleString()}
                </div>
              </div>
            )}
            {contribution.paid_at && (
              <div>
                <Label className="text-muted-foreground">Paid At</Label>
                <div className="mt-1">
                  {new Date(contribution.paid_at).toLocaleString()}
                </div>
              </div>
            )}
            {contribution.rejected_at && (
              <div>
                <Label className="text-muted-foreground">Rejected At</Label>
                <div className="mt-1">
                  {new Date(contribution.rejected_at).toLocaleString()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {(contribution.notes || contribution.rejection_reason) && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contribution.notes && (
                <div>
                  <Label className="text-muted-foreground">Member Notes</Label>
                  <div className="mt-1 p-3 bg-muted rounded-lg">
                    {contribution.notes}
                  </div>
                </div>
              )}
              {contribution.rejection_reason && (
                <div>
                  <Label className="text-muted-foreground text-destructive">Rejection Reason</Label>
                  <div className="mt-1 p-3 bg-destructive/10 rounded-lg text-destructive">
                    {contribution.rejection_reason}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

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
            {contribution && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm">
                  <div className="font-medium">Member: {contribution.member?.user?.first_name} {contribution.member?.user?.last_name}</div>
                  <div className="text-muted-foreground">Amount: ₦{parseFloat(contribution.amount.toString()).toLocaleString()}</div>
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
              setRejectionReason("")
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing || !rejectionReason.trim()}>
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

