"use client"

import { use, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle, Calendar, User, CreditCard, Loader2 } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast as sonnerToast } from "sonner"
import { apiFetch } from "@/lib/api/client"

interface Payment {
  id: string
  amount: number
  payment_date: string
  payment_method?: string
  status: string
  reference?: string
  metadata?: {
    notes?: string
  }
}

interface Contribution {
  id: string
  member?: {
    member_id?: string
    user?: {
      first_name?: string
      last_name?: string
      email?: string
      phone?: string
    }
  }
  amount: number
  type: string
  frequency: string
  status: string
  contribution_date: string
  payment_method?: string
  payments?: Payment[]
  rejection_reason?: string
  approved_at?: string
  rejected_at?: string
  created_at: string
}

export default function ContributionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [contribution, setContribution] = useState<Contribution | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    fetchContribution()
  }, [id])

  const fetchContribution = async () => {
    try {
      setLoading(true)
      const response = await apiFetch<{ success: boolean; data: Contribution }>(
        `/admin/contributions/${id}`
      )

      if (response.success && response.data) {
        setContribution(response.data)
      }
    } catch (error: any) {
      console.error('Error fetching contribution:', error)
      sonnerToast.error("Failed to load contribution", {
        description: error.message || "Please try again later",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    try {
      setProcessing(true)
      const response = await apiFetch<{ success: boolean; message?: string; data?: Contribution }>(
        `/admin/contributions/${id}/approve`,
        { method: 'POST' }
      )

      if (response.success) {
        sonnerToast.success("Contribution Approved", {
          description: response.message || "Contribution has been approved successfully",
        })
    setShowApproveDialog(false)
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
    if (!rejectionReason.trim()) {
      sonnerToast.error("Rejection reason required", {
        description: "Please provide a reason for rejecting this contribution",
      })
      return
    }

    try {
      setProcessing(true)
      const response = await apiFetch<{ success: boolean; message?: string; data?: Contribution }>(
        `/admin/contributions/${id}/reject`,
        {
          method: 'POST',
          body: { rejection_reason: rejectionReason }
        }
      )

      if (response.success) {
        sonnerToast.success("Contribution Rejected", {
          description: response.message || "Contribution has been rejected",
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount)
  }

  const getMemberName = () => {
    if (contribution?.member?.user) {
      return `${contribution.member.user.first_name || ''} ${contribution.member.user.last_name || ''}`.trim() || 'N/A'
    }
    return 'N/A'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!contribution) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/contributions">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Contribution Not Found</h1>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">The contribution you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/contributions">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Contribution Details</h1>
          <p className="text-muted-foreground">{contribution.id.substring(0, 8)}...</p>
        </div>
        <Badge
          variant={
            contribution.status === "approved" || contribution.status === "completed"
              ? "default"
              : contribution.status === "rejected"
                ? "destructive"
                : "secondary"
          }
        >
          {contribution.status}
        </Badge>
      </div>

      {contribution.status === "pending" && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Contribution Pending Verification</h3>
                <p className="text-sm text-muted-foreground">Review payment details and approve or reject</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowApproveDialog(true)} disabled={processing}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button variant="destructive" onClick={() => setShowRejectDialog(true)} disabled={processing}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>Contribution and payment details</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Amount</label>
                  <p className="text-3xl font-bold">{formatCurrency(contribution.amount)}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Contribution Type</label>
                  <p className="font-medium">{contribution.type || contribution.frequency || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Payment Method</label>
                  <p className="font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    {contribution.payment_method || contribution.payments?.[0]?.payment_method || '-'}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Contribution Date</label>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(contribution.contribution_date || contribution.created_at)}
                  </p>
                </div>
                {(contribution.payments && contribution.payments.length > 0 && contribution.payments[0]?.metadata?.notes) && (
                  <div>
                    <label className="text-sm text-muted-foreground">Description</label>
                    <p className="font-medium">{contribution.payments[0].metadata.notes}</p>
                  </div>
                )}
                {contribution.approved_at && (
                <div>
                    <label className="text-sm text-muted-foreground">Approved Date</label>
                    <p className="font-medium">{formatDate(contribution.approved_at)}</p>
                </div>
                )}
                {contribution.rejected_at && (
                <div>
                    <label className="text-sm text-muted-foreground">Rejected Date</label>
                    <p className="font-medium">{formatDate(contribution.rejected_at)}</p>
                </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Member Information</CardTitle>
              <CardDescription>Details about the contributing member</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Full Name</label>
                  <p className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {getMemberName()}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Member ID</label>
                  <p className="font-medium font-mono">{contribution.member?.member_id || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-4">
                {contribution.member?.user?.email && (
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                    <p className="font-medium">{contribution.member.user.email}</p>
                </div>
                )}
                {contribution.member?.user?.phone && (
                <div>
                  <label className="text-sm text-muted-foreground">Phone</label>
                    <p className="font-medium">{contribution.member.user.phone}</p>
                </div>
                )}
              </div>
            </CardContent>
          </Card>

          {contribution.rejection_reason && (
            <Card>
              <CardHeader>
                <CardTitle>Rejection Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{contribution.rejection_reason}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submission Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Date Submitted</label>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(contribution.created_at)}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                <Badge
                  className="mt-1"
                  variant={
                    contribution.status === "approved" || contribution.status === "completed"
                      ? "default"
                      : contribution.status === "rejected"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {contribution.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Contribution</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this contribution of {formatCurrency(contribution.amount)} from{" "}
              {getMemberName()}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve Contribution"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Contribution</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this contribution.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={processing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim() || processing}>
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
