"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Users, DollarSign, Calendar, CheckCircle, XCircle, Package, Settings, AlertCircle, Phone, User, FileText, Image as ImageIcon, Download } from "lucide-react"
import Link from "next/link"
import { useEffect, use, useState } from "react"
import { apiFetch, approveMemberSubscription, rejectMemberSubscription } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"
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

interface MemberSubscriptionPackage {
  id: string
  name: string
  slug: string
  description: string
  price: number
  billing_cycle: string
  trial_days: number
  is_active: boolean
  is_featured: boolean
  limits?: {
    max_members: number
    max_properties: number
    max_loan_products: number
    max_contribution_plans: number
    max_investment_plans: number
    max_mortgage_plans: number
    storage_gb: number
    max_admins: number
    has_role_management: boolean
  }
  subscribers?: number
  created_at: string
  updated_at: string
}

interface MemberSubscription {
  id: string
  package_id: string
  package_name: string
  business_id: string
  business_name: string
  member_id: string
  status: string
  payment_status: string
  payment_method: string
  payment_reference: string
  amount_paid: number
  start_date: string
  end_date: string
  notes?: string
  rejection_reason?: string
  payer_name?: string
  payer_phone?: string
  account_details?: string
  payment_evidence?: string[]
  created_at: string
  updated_at: string
}

export default function MemberSubscriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { isLoading, data, error, loadData } = usePageLoading<{ package?: MemberSubscriptionPackage; subscription?: MemberSubscription }>()
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const refreshData = () => {
    loadData(async () => {
      const response = await apiFetch<{ package?: MemberSubscriptionPackage; subscription?: MemberSubscription }>(`/super-admin/member-subscriptions/${resolvedParams.id}`)
      return response
    })
  }

  useEffect(() => {
    refreshData()
  }, [loadData, resolvedParams.id])


  const handleReject = async () => {
    const currentSubscription = data?.subscription
    if (!currentSubscription || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason")
      return
    }
    
    setIsProcessing(true)
    try {
      await rejectMemberSubscription(currentSubscription.id, rejectionReason)
      toast.success("Subscription rejected successfully")
      setShowRejectDialog(false)
      setRejectionReason("")
      refreshData()
    } catch (error: any) {
      toast.error(error?.message || "Failed to reject subscription")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleApproveClick = async () => {
    const currentSubscription = data?.subscription
    if (!currentSubscription) return
    
    setIsProcessing(true)
    try {
      await approveMemberSubscription(currentSubscription.id)
      toast.success("Subscription approved successfully")
      refreshData()
    } catch (error: any) {
      toast.error(error?.message || "Failed to approve subscription")
    } finally {
      setIsProcessing(false)
    }
  }

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (isLoading || !data) return null // Let the skeleton loader handle the display

  const packageData = data?.package
  const subscriptionData = data?.subscription

  // If we have subscription data, show subscription view
  if (subscriptionData) {
    const canApproveReject = subscriptionData.payment_method === 'manual' && subscriptionData.payment_status === 'pending'
    return (
      <>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/super-admin/member-subscriptions/list">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Member Subscription Details</h1>
              <Badge variant={subscriptionData.status === 'active' ? "default" : "secondary"}>
                {subscriptionData.status}
              </Badge>
              <Badge variant={subscriptionData.payment_status === 'completed' || subscriptionData.payment_status === 'approved' ? "default" : "destructive"}>
                {subscriptionData.payment_status}
              </Badge>
            </div>
            <p className="text-muted-foreground">Subscription ID: {subscriptionData.id}</p>
          </div>
        </div>

        {/* Subscription Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Package</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscriptionData.package_name}</div>
              <p className="text-xs text-muted-foreground">Package ID: {subscriptionData.package_id}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{subscriptionData.amount_paid.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground capitalize">{subscriptionData.payment_method}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Business</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscriptionData.business_name}</div>
              <p className="text-xs text-muted-foreground">Business ID: {subscriptionData.business_id}</p>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Details */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Information</CardTitle>
              <CardDescription>Subscription details and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Subscription ID</label>
                  <p className="text-sm font-mono">{subscriptionData.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Member ID</label>
                  <p className="text-sm font-mono">{subscriptionData.member_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="flex items-center gap-2">
                    {subscriptionData.status === 'active' ? (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        Active
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <XCircle className="h-4 w-4" />
                        {subscriptionData.status}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Status</label>
                  <p className="text-sm capitalize">{subscriptionData.payment_status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                  <p className="text-sm capitalize">{subscriptionData.payment_method}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Reference</label>
                  <p className="text-sm font-mono">{subscriptionData.payment_reference || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Period</CardTitle>
              <CardDescription>Start and end dates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{new Date(subscriptionData.start_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">End Date</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{new Date(subscriptionData.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created At</label>
                  <p className="text-sm">{new Date(subscriptionData.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                  <p className="text-sm">{new Date(subscriptionData.updated_at).toLocaleString()}</p>
                </div>
                {subscriptionData.notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Notes</label>
                    <p className="text-sm">{subscriptionData.notes}</p>
                  </div>
                )}
                {subscriptionData.rejection_reason && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Rejection Reason</label>
                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{subscriptionData.rejection_reason}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Details - Show for manual payments */}
        {subscriptionData.payment_method === 'manual' && (subscriptionData.payer_name || subscriptionData.payer_phone || subscriptionData.account_details || subscriptionData.payment_evidence) && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Manual payment information and evidence</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {subscriptionData.payer_name && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Payer Name
                    </label>
                    <p className="text-sm font-medium mt-1">{subscriptionData.payer_name}</p>
                  </div>
                )}
                {subscriptionData.payer_phone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Payer Phone
                    </label>
                    <p className="text-sm font-medium mt-1">{subscriptionData.payer_phone}</p>
                  </div>
                )}
              </div>
              {subscriptionData.account_details && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Account Details
                  </label>
                  <p className="text-sm mt-1 bg-gray-50 p-3 rounded whitespace-pre-wrap">{subscriptionData.account_details}</p>
                </div>
              )}
              {subscriptionData.payment_evidence && subscriptionData.payment_evidence.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-3">
                    <ImageIcon className="h-4 w-4" />
                    Payment Evidence ({subscriptionData.payment_evidence.length} {subscriptionData.payment_evidence.length === 1 ? 'file' : 'files'})
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {subscriptionData.payment_evidence.map((evidence, index) => (
                      <div key={index} className="relative group">
                        <a
                          href={evidence}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary transition-colors"
                        >
                          <img
                            src={evidence}
                            alt={`Payment evidence ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback for non-image files
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          {/* Fallback for non-image files */}
                          <div className="hidden w-full h-full items-center justify-center bg-gray-100">
                            <div className="text-center p-4">
                              <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                              <p className="text-xs text-gray-500">View File</p>
                            </div>
                          </div>
                        </a>
                        <a
                          href={evidence}
                          download
                          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
                        >
                          <Download className="h-4 w-4 text-gray-600" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Approval Actions - Only show for pending manual payments */}
        {canApproveReject && (
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Payment Approval Required
              </CardTitle>
              <CardDescription>
                This subscription requires manual approval. Review the payment details and approve or reject the subscription.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button 
                  onClick={handleApproveClick}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Payment
                </Button>
                <Button 
                  onClick={() => setShowRejectDialog(true)}
                  disabled={isProcessing}
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Subscription Payment</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this subscription payment. This reason will be sent to the member.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason *</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false)
                setRejectionReason("")
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing || !rejectionReason.trim()}
            >
              {isProcessing ? "Rejecting..." : "Reject Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </>
    )
  }

  // If we have package data, show package view (original behavior)
  if (!packageData) return null

  const limits = packageData.limits || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/super-admin/member-subscriptions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{packageData.name}</h1>
            {packageData.is_featured && (
              <Badge className="bg-primary text-primary-foreground">Featured</Badge>
            )}
            <Badge variant={packageData.is_active ? "default" : "secondary"}>
              {packageData.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-muted-foreground">{packageData.description}</p>
        </div>
        <Button asChild>
          <Link href={`/super-admin/member-subscriptions/${resolvedParams.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Package
          </Link>
        </Button>
      </div>

      {/* Package Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{(packageData.price || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground capitalize">{packageData.billing_cycle}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(packageData.subscribers || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active subscribers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Trial Period</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{packageData.trial_days || 0}</div>
            <p className="text-xs text-muted-foreground">Days free trial</p>
          </CardContent>
        </Card>
      </div>

      {/* Package Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Package Information</CardTitle>
            <CardDescription>Basic package details and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Package Name</label>
                <p className="text-sm">{packageData.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Slug</label>
                <p className="text-sm font-mono">{packageData.slug}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm">{packageData.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Billing Cycle</label>
                <p className="text-sm capitalize">{packageData.billing_cycle}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="flex items-center gap-2">
                  {packageData.is_active ? (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      Active
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <XCircle className="h-4 w-4" />
                      Inactive
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Package Limits</CardTitle>
            <CardDescription>Resource limits and restrictions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex justify-between">
                <span className="text-sm">Max Members</span>
                <span className="text-sm font-medium">{limits.max_members === -1 ? 'Unlimited' : limits.max_members?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Max Properties</span>
                <span className="text-sm font-medium">{limits.max_properties === -1 ? 'Unlimited' : limits.max_properties?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Max Loan Products</span>
                <span className="text-sm font-medium">{limits.max_loan_products === -1 ? 'Unlimited' : limits.max_loan_products?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Max Contribution Plans</span>
                <span className="text-sm font-medium">{limits.max_contribution_plans === -1 ? 'Unlimited' : limits.max_contribution_plans?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Max Investment Plans</span>
                <span className="text-sm font-medium">{limits.max_investment_plans === -1 ? 'Unlimited' : limits.max_investment_plans?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Max Mortgage Plans</span>
                <span className="text-sm font-medium">{limits.max_mortgage_plans === -1 ? 'Unlimited' : limits.max_mortgage_plans?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Storage</span>
                <span className="text-sm font-medium">{limits.storage_gb === -1 ? 'Unlimited' : `${limits.storage_gb} GB`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Max Admins</span>
                <span className="text-sm font-medium">{limits.max_admins === -1 ? 'Unlimited' : limits.max_admins?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Role Management</span>
                <span className="text-sm font-medium">
                  {limits.has_role_management ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Enabled
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <XCircle className="h-4 w-4" />
                      Disabled
                    </div>
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Information */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Information</CardTitle>
          <CardDescription>Package revenue and subscriber metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold">₦{((packageData.price || 0) * (packageData.subscribers || 0)).toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">₦{(packageData.price || 0).toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Per Subscriber</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{(packageData.subscribers || 0).toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Active Subscribers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Package Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Package Actions</CardTitle>
          <CardDescription>Manage this subscription package</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button asChild>
              <Link href={`/super-admin/member-subscriptions/${resolvedParams.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Package
              </Link>
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Package Settings
            </Button>
            <Button variant="outline">
              <Package className="h-4 w-4 mr-2" />
              View Subscribers
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
