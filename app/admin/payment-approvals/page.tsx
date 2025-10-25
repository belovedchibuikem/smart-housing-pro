"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Filter, 
  Download, 
  RefreshCw,
  AlertTriangle,
  CreditCard,
  Building2,
  DollarSign,
  Wallet,
  Calendar,
  User,
  Banknote,
  Users
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"

interface PaymentTransaction {
  id: string
  reference: string
  amount: number
  currency: string
  status: string
  payment_method: string
  approval_status: string
  bank_reference?: string
  bank_name?: string
  account_number?: string
  account_name?: string
  payment_date?: string
  payment_evidence?: string[]
  approval_notes?: string
  rejection_reason?: string
  description: string
  created_at: string
  user: {
    id: string
    name: string
    email: string
  }
  approver?: {
    id: string
    name: string
    email: string
  }
}

interface PaymentApprovalsResponse {
  payments: {
    data: PaymentTransaction[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

interface ReconciliationData {
  summary: {
    total_payments: number
    total_amount: number
    completed_payments: number
    completed_amount: number
    pending_approvals: number
    pending_amount: number
  }
  by_payment_method: Array<{
    payment_method: string
    count: number
    total_amount: number
  }>
  by_status: Array<{
    status: string
    count: number
    total_amount: number
  }>
  by_approval_status: Array<{
    approval_status: string
    count: number
    total_amount: number
  }>
}

export default function TenantPaymentApprovalsPage() {
  const { toast } = useToast()
  const [payments, setPayments] = useState<PaymentTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<PaymentTransaction | null>(null)
  const [approvalNotes, setApprovalNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [filters, setFilters] = useState({
    payment_method: "",
    status: "",
    approval_status: "",
    date_from: "",
    date_to: ""
  })
  const [reconciliationData, setReconciliationData] = useState<ReconciliationData | null>(null)

  useEffect(() => {
    loadPendingApprovals()
    loadReconciliationData()
  }, [])

  const loadPendingApprovals = async () => {
    try {
      setLoading(true)
      const response = await apiFetch<PaymentApprovalsResponse>("/admin/payment-approvals")
      setPayments(response.payments.data)
    } catch (error) {
      console.error("Error loading pending approvals:", error)
      toast({
        title: "Error",
        description: "Failed to load pending approvals",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadReconciliationData = async () => {
    try {
      const response = await apiFetch<{ reconciliation_data: ReconciliationData }>("/admin/payment-approvals/reconciliation/data")
      setReconciliationData(response.reconciliation_data)
    } catch (error) {
      console.error("Error loading reconciliation data:", error)
    }
  }

  const approvePayment = async (paymentId: string) => {
    try {
      await apiFetch(`/admin/payment-approvals/${paymentId}/approve`, {
        method: "POST",
        body: { approval_notes: approvalNotes }
      })

      toast({
        title: "Success",
        description: "Payment approved successfully",
      })

      setSelectedPayment(null)
      setApprovalNotes("")
      loadPendingApprovals()
    } catch (error) {
      console.error("Error approving payment:", error)
      toast({
        title: "Error",
        description: "Failed to approve payment",
        variant: "destructive",
      })
    }
  }

  const rejectPayment = async (paymentId: string) => {
    try {
      await apiFetch(`/admin/payment-approvals/${paymentId}/reject`, {
        method: "POST",
        body: { rejection_reason: rejectionReason }
      })

      toast({
        title: "Success",
        description: "Payment rejected successfully",
      })

      setSelectedPayment(null)
      setRejectionReason("")
      loadPendingApprovals()
    } catch (error) {
      console.error("Error rejecting payment:", error)
      toast({
        title: "Error",
        description: "Failed to reject payment",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      completed: "default",
      failed: "destructive",
      processing: "outline"
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  const getApprovalStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      auto_approved: "outline"
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'paystack':
        return <CreditCard className="h-4 w-4" />
      case 'remita':
        return <Building2 className="h-4 w-4" />
      case 'stripe':
        return <DollarSign className="h-4 w-4" />
      case 'bank_transfer':
      case 'manual':
        return <Wallet className="h-4 w-4" />
      default:
        return <Banknote className="h-4 w-4" />
    }
  }

  const formatCurrency = (amount: number, currency: string = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Payment Approvals</h1>
          <p className="text-muted-foreground mt-2">Review and approve member payments</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading payment approvals...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Approvals</h1>
        <p className="text-muted-foreground mt-2">Review and approve member payments</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
          <TabsTrigger value="logs">Payment Logs</TabsTrigger>
          <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Pending Payment Approvals</h2>
            <Button onClick={loadPendingApprovals} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {payments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Approvals</h3>
                <p className="text-muted-foreground text-center">
                  All member payments have been processed. Great job!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {payments.map((payment) => (
                <Card key={payment.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getPaymentMethodIcon(payment.payment_method)}
                      <div>
                        <h3 className="font-semibold">Payment #{payment.reference}</h3>
                        <p className="text-sm text-muted-foreground">
                          {payment.user.name} ({payment.user.email})
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {payment.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(payment.status)}
                      {getApprovalStatusBadge(payment.approval_status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label className="text-sm font-medium">Amount</Label>
                      <p className="text-lg font-semibold">
                        {formatCurrency(payment.amount, payment.currency)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Payment Method</Label>
                      <p className="text-sm">{payment.payment_method.replace('_', ' ').toUpperCase()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Member</Label>
                      <p className="text-sm">{payment.user.name}</p>
                    </div>
                  </div>

                  {payment.payment_method === 'bank_transfer' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-muted rounded-lg">
                      <div>
                        <Label className="text-sm font-medium">Bank Name</Label>
                        <p className="text-sm">{payment.bank_name || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Account Number</Label>
                        <p className="text-sm">{payment.account_number || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Account Name</Label>
                        <p className="text-sm">{payment.account_name || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Payment Date</Label>
                        <p className="text-sm">
                          {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(payment.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedPayment(payment)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Payment Details</DialogTitle>
                            <DialogDescription>
                              Review payment details before approval
                            </DialogDescription>
                          </DialogHeader>
                          {selectedPayment && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Reference</Label>
                                  <p className="text-sm">{selectedPayment.reference}</p>
                                </div>
                                <div>
                                  <Label>Amount</Label>
                                  <p className="text-sm font-semibold">
                                    {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                                  </p>
                                </div>
                                <div>
                                  <Label>Member</Label>
                                  <p className="text-sm">{selectedPayment.user.name}</p>
                                </div>
                                <div>
                                  <Label>Payment Method</Label>
                                  <p className="text-sm">{selectedPayment.payment_method}</p>
                                </div>
                              </div>

                              {selectedPayment.payment_method === 'bank_transfer' && (
                                <div className="p-4 bg-muted rounded-lg">
                                  <h4 className="font-medium mb-2">Bank Transfer Details</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm">Bank Name</Label>
                                      <p className="text-sm">{selectedPayment.bank_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm">Account Number</Label>
                                      <p className="text-sm">{selectedPayment.account_number || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm">Account Name</Label>
                                      <p className="text-sm">{selectedPayment.account_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm">Payment Date</Label>
                                      <p className="text-sm">
                                        {selectedPayment.payment_date ? 
                                          new Date(selectedPayment.payment_date).toLocaleDateString() : 'N/A'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="flex space-x-2">
                                <Button 
                                  onClick={() => approvePayment(selectedPayment.id)}
                                  className="flex-1"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve Payment
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  onClick={() => rejectPayment(selectedPayment.id)}
                                  className="flex-1"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject Payment
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Logs</CardTitle>
              <CardDescription>View all member payment transactions and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Payment logs will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconciliation" className="space-y-4">
          {reconciliationData && (
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reconciliation Summary</CardTitle>
                  <CardDescription>Member payment reconciliation overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{reconciliationData.summary.total_payments}</p>
                      <p className="text-sm text-muted-foreground">Total Payments</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{reconciliationData.summary.completed_payments}</p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{reconciliationData.summary.pending_approvals}</p>
                      <p className="text-sm text-muted-foreground">Pending Approval</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>By Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {reconciliationData.by_payment_method.map((method, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{method.payment_method}</span>
                          <div className="text-right">
                            <p className="text-sm font-medium">{method.count} payments</p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(method.total_amount)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>By Approval Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {reconciliationData.by_approval_status.map((status, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{status.approval_status}</span>
                          <div className="text-right">
                            <p className="text-sm font-medium">{status.count} payments</p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(status.total_amount)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
