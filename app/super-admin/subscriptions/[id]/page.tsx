"use client"

import { use, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle, Calendar, Building2, CreditCard, Loader2, Package, User } from "lucide-react"
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

interface SubscriptionPayment {
  id?: string
  reference?: string
  amount?: number
  currency?: string
  status?: string
  payment_gateway?: string
  approval_status?: string
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  metadata?: any
  created_at?: string
}

interface Subscription {
  id: string
  business_name: string
  business_id: string
  package: string
  package_id?: string
  status: string
  current_period_start?: string
  current_period_end?: string
  amount: number
  next_billing_date?: string
  payment_reference?: string
  payment_method?: string
  payment_status?: string
  payment?: SubscriptionPayment
  created_at: string
  updated_at: string
}

export default function SubscriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [approvalNotes, setApprovalNotes] = useState("")

  useEffect(() => {
    fetchSubscription()
  }, [id])

  const fetchSubscription = async () => {
    try {
      setLoading(true)
      const response = await apiFetch<{ success: boolean; subscription: Subscription }>(
        `/super-admin/subscriptions/${id}`
      )

      if (response.success && response.subscription) {
        setSubscription(response.subscription)
      }
    } catch (error: any) {
      console.error('Error fetching subscription:', error)
      sonnerToast.error("Failed to load subscription", {
        description: error.message || "Please try again later",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    try {
      setProcessing(true)
      const response = await apiFetch<{ success: boolean; message?: string; subscription?: Subscription }>(
        `/super-admin/subscriptions/${id}/approve-payment`,
        {
          method: 'POST',
          body: approvalNotes ? { approval_notes: approvalNotes } : {}
        }
      )

      if (response.success) {
        sonnerToast.success("Payment Approved", {
          description: response.message || "Payment has been approved and subscription activated successfully",
        })
        setShowApproveDialog(false)
        setApprovalNotes("")
        fetchSubscription()
      }
    } catch (error: any) {
      console.error('Error approving payment:', error)
      sonnerToast.error("Failed to approve payment", {
        description: error.message || "Please try again later",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      sonnerToast.error("Rejection reason required", {
        description: "Please provide a reason for rejecting this payment",
      })
      return
    }

    try {
      setProcessing(true)
      const response = await apiFetch<{ success: boolean; message?: string; subscription?: Subscription }>(
        `/super-admin/subscriptions/${id}/reject-payment`,
        {
          method: 'POST',
          body: { rejection_reason: rejectionReason }
        }
      )

      if (response.success) {
        sonnerToast.success("Payment Rejected", {
          description: response.message || "Payment has been rejected",
        })
        setShowRejectDialog(false)
        setRejectionReason("")
        fetchSubscription()
      }
    } catch (error: any) {
      console.error('Error rejecting payment:', error)
      sonnerToast.error("Failed to reject payment", {
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
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600">Active</Badge>
      case "trial":
        return <Badge className="bg-orange-600">Trial</Badge>
      case "past_due":
        return <Badge className="bg-red-600">Past Due</Badge>
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const canApproveReject = () => {
    if (!subscription) return false
    
    // Check if payment method is manual
    const isManualPayment = subscription.payment_method === 'manual' || 
                           subscription.payment?.payment_gateway === 'manual'
    
    if (!isManualPayment) return false
    
    // Check payment status if payment object exists
    if (subscription.payment) {
      const payment = subscription.payment
      // Don't show if already approved or rejected
      if (payment.approval_status === 'approved' || payment.approval_status === 'rejected') {
        return false
      }
      // Show if pending approval
      if (payment.approval_status === 'pending' || 
          payment.status === 'pending' || 
          payment.status === 'processing') {
        return true
      }
    }
    
    // If no payment object but payment_method is manual and subscription is in trial/past_due
    // This handles cases where payment hasn't been fully processed yet
    if (subscription.payment_method === 'manual' && 
        (subscription.status === 'trial' || subscription.status === 'past_due')) {
      return true
    }
    
    return false
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/super-admin/subscriptions">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Subscription Not Found</h1>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">The subscription you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/super-admin/subscriptions">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Subscription Details</h1>
          <p className="text-muted-foreground">{subscription.business_name}</p>
        </div>
        {getStatusBadge(subscription.status)}
      </div>

      {canApproveReject() && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Payment Pending Approval</h3>
                <p className="text-sm text-muted-foreground">Review payment details and approve or reject</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowApproveDialog(true)} disabled={processing}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Payment
                </Button>
                <Button variant="destructive" onClick={() => setShowRejectDialog(true)} disabled={processing}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Payment
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
              <CardTitle>Subscription Information</CardTitle>
              <CardDescription>Subscription and billing details</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Amount</label>
                  <p className="text-3xl font-bold">{formatCurrency(subscription.amount)}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Package</label>
                  <p className="font-medium flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    {subscription.package}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(subscription.status)}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Current Period</label>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Next Billing Date</label>
                  <p className="font-medium">
                    {subscription.next_billing_date ? formatDate(subscription.next_billing_date) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Created At</label>
                  <p className="font-medium">{formatDate(subscription.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {(subscription.payment || subscription.payment_method === 'manual') && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>Payment details and status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Payment Reference</label>
                      <p className="font-medium font-mono">{subscription.payment?.reference || subscription.payment_reference || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Payment Method</label>
                      <p className="font-medium flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        {subscription.payment?.payment_gateway || subscription.payment_method || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Payment Status</label>
                      <div className="mt-1">
                        <Badge
                          variant={
                            subscription.payment?.status === 'completed' ? 'default' :
                            subscription.payment?.status === 'failed' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {subscription.payment?.status || subscription.payment_status || 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {subscription.payment?.approval_status && (
                      <div>
                        <label className="text-sm text-muted-foreground">Approval Status</label>
                        <div className="mt-1">
                          <Badge
                            variant={
                              subscription.payment.approval_status === 'approved' ? 'default' :
                              subscription.payment.approval_status === 'rejected' ? 'destructive' :
                              'secondary'
                            }
                          >
                            {subscription.payment.approval_status}
                          </Badge>
                        </div>
                      </div>
                    )}
                    {subscription.payment?.approved_at && (
                      <div>
                        <label className="text-sm text-muted-foreground">Approved At</label>
                        <p className="font-medium">{formatDate(subscription.payment.approved_at)}</p>
                      </div>
                    )}
                    {subscription.payment?.rejection_reason && (
                      <div>
                        <label className="text-sm text-muted-foreground">Rejection Reason</label>
                        <p className="font-medium text-sm text-muted-foreground">{subscription.payment.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Show approve/reject buttons in payment section if manual payment */}
                {canApproveReject() && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Manual Payment Requires Approval</p>
                        <p className="text-sm text-muted-foreground">Review the payment details and approve or reject this subscription payment</p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => setShowApproveDialog(true)} disabled={processing}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Payment
                        </Button>
                        <Button variant="destructive" onClick={() => setShowRejectDialog(true)} disabled={processing}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Payment
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Details about the subscribing business</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Business Name</label>
                  <p className="font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {subscription.business_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Business ID</label>
                  <p className="font-medium font-mono">{subscription.business_id}</p>
                </div>
              </div>
              <div className="space-y-4">
                <Button variant="outline" asChild>
                  <Link href={`/super-admin/businesses/${subscription.business_id}`}>
                    <Building2 className="h-4 w-4 mr-2" />
                    View Business Details
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/super-admin/businesses/${subscription.business_id}`}>
                  View Business
                </Link>
              </Button>
              {subscription.status === 'active' && (
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/super-admin/subscriptions/${id}/cancel`}>
                    Cancel Subscription
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this payment of {formatCurrency(subscription?.amount || 0)} for{" "}
              {subscription?.business_name}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Approval Notes (Optional)</label>
            <Textarea
              placeholder="Enter any notes about this approval..."
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              rows={3}
            />
          </div>
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
                "Approve Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this payment.</DialogDescription>
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
                "Reject Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

