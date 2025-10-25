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
  Banknote
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"

interface PaymentTransaction {
  id: string
  reference: string
  type: string
  amount: number
  currency: string
  status: string
  payment_gateway: string
  approval_status: string
  bank_reference?: string
  bank_name?: string
  account_number?: string
  account_name?: string
  payment_date?: string
  payment_evidence?: string[]
  approval_notes?: string
  rejection_reason?: string
  created_at: string
  tenant: {
    id: string
    name: string
    domain: string
  }
  approver?: {
    id: string
    name: string
    email: string
  }
}

interface PaymentApprovalsResponse {
  transactions: {
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
    total_transactions: number
    total_amount: number
    completed_transactions: number
    completed_amount: number
    pending_approvals: number
    pending_amount: number
  }
  by_gateway: Array<{
    payment_gateway: string
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

export default function PaymentApprovalsPage() {
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null)
  const [approvalNotes, setApprovalNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [filters, setFilters] = useState({
    gateway: "",
    type: "",
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
      const response = await apiFetch<PaymentApprovalsResponse>("/super-admin/payment-approvals")
      setTransactions(response.transactions.data)
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
      const response = await apiFetch<{ reconciliation_data: ReconciliationData }>("/super-admin/payment-approvals/reconciliation/data")
      setReconciliationData(response.reconciliation_data)
    } catch (error) {
      console.error("Error loading reconciliation data:", error)
    }
  }

  const approvePayment = async (transactionId: string) => {
    try {
      await apiFetch(`/super-admin/payment-approvals/${transactionId}/approve`, {
        method: "POST",
        body: { approval_notes: approvalNotes }
      })

      toast({
        title: "Success",
        description: "Payment approved successfully",
      })

      setSelectedTransaction(null)
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

  const rejectPayment = async (transactionId: string) => {
    try {
      await apiFetch(`/super-admin/payment-approvals/${transactionId}/reject`, {
        method: "POST",
        body: { rejection_reason: rejectionReason }
      })

      toast({
        title: "Success",
        description: "Payment rejected successfully",
      })

      setSelectedTransaction(null)
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

  const getGatewayIcon = (gateway: string) => {
    switch (gateway.toLowerCase()) {
      case 'paystack':
        return <CreditCard className="h-4 w-4" />
      case 'remita':
        return <Building2 className="h-4 w-4" />
      case 'stripe':
        return <DollarSign className="h-4 w-4" />
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
          <p className="text-muted-foreground mt-2">Review and approve pending payments</p>
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
        <p className="text-muted-foreground mt-2">Review and approve pending payments</p>
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

          {transactions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Approvals</h3>
                <p className="text-muted-foreground text-center">
                  All payments have been processed. Great job!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {transactions.map((transaction) => (
                <Card key={transaction.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getGatewayIcon(transaction.payment_gateway)}
                      <div>
                        <h3 className="font-semibold">Transaction #{transaction.reference}</h3>
                        <p className="text-sm text-muted-foreground">
                          {transaction.tenant.name} ({transaction.tenant.domain})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(transaction.status)}
                      {getApprovalStatusBadge(transaction.approval_status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label className="text-sm font-medium">Amount</Label>
                      <p className="text-lg font-semibold">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Type</Label>
                      <p className="text-sm">{transaction.type.replace('_', ' ').toUpperCase()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Payment Gateway</Label>
                      <p className="text-sm">{transaction.payment_gateway.toUpperCase()}</p>
                    </div>
                  </div>

                  {transaction.isManualPayment && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-muted rounded-lg">
                      <div>
                        <Label className="text-sm font-medium">Bank Name</Label>
                        <p className="text-sm">{transaction.bank_name || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Account Number</Label>
                        <p className="text-sm">{transaction.account_number || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Account Name</Label>
                        <p className="text-sm">{transaction.account_name || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Payment Date</Label>
                        <p className="text-sm">
                          {transaction.payment_date ? new Date(transaction.payment_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedTransaction(transaction)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Transaction Details</DialogTitle>
                            <DialogDescription>
                              Review payment details before approval
                            </DialogDescription>
                          </DialogHeader>
                          {selectedTransaction && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Reference</Label>
                                  <p className="text-sm">{selectedTransaction.reference}</p>
                                </div>
                                <div>
                                  <Label>Amount</Label>
                                  <p className="text-sm font-semibold">
                                    {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
                                  </p>
                                </div>
                                <div>
                                  <Label>Tenant</Label>
                                  <p className="text-sm">{selectedTransaction.tenant.name}</p>
                                </div>
                                <div>
                                  <Label>Gateway</Label>
                                  <p className="text-sm">{selectedTransaction.payment_gateway}</p>
                                </div>
                              </div>

                              {selectedTransaction.isManualPayment && (
                                <div className="p-4 bg-muted rounded-lg">
                                  <h4 className="font-medium mb-2">Bank Transfer Details</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm">Bank Name</Label>
                                      <p className="text-sm">{selectedTransaction.bank_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm">Account Number</Label>
                                      <p className="text-sm">{selectedTransaction.account_number || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm">Account Name</Label>
                                      <p className="text-sm">{selectedTransaction.account_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm">Payment Date</Label>
                                      <p className="text-sm">
                                        {selectedTransaction.payment_date ? 
                                          new Date(selectedTransaction.payment_date).toLocaleDateString() : 'N/A'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="flex space-x-2">
                                <Button 
                                  onClick={() => approvePayment(selectedTransaction.id)}
                                  className="flex-1"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve Payment
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  onClick={() => rejectPayment(selectedTransaction.id)}
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
              <CardDescription>View all payment transactions and their status</CardDescription>
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
                  <CardDescription>Payment reconciliation overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{reconciliationData.summary.total_transactions}</p>
                      <p className="text-sm text-muted-foreground">Total Transactions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{reconciliationData.summary.completed_transactions}</p>
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
                    <CardTitle>By Payment Gateway</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {reconciliationData.by_gateway.map((gateway, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{gateway.payment_gateway}</span>
                          <div className="text-right">
                            <p className="text-sm font-medium">{gateway.count} transactions</p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(gateway.total_amount)}
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
                            <p className="text-sm font-medium">{status.count} transactions</p>
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
