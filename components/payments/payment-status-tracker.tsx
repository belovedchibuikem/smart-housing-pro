"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Search,
  RefreshCw,
  Eye,
  Download,
  Calendar,
  Banknote,
  User,
  Building2
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
  approval_notes?: string
  rejection_reason?: string
  created_at: string
  approved_at?: string
  approver?: {
    name: string
    email: string
  }
}

export function PaymentStatusTracker() {
  const { toast } = useToast()
  const [reference, setReference] = useState("")
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const searchTransaction = async () => {
    if (!reference.trim()) {
      toast({
        title: "Error",
        description: "Please enter a payment reference",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      setError("")
      
      // In a real implementation, you would call an API endpoint to search for transactions
      // For now, we'll simulate the search
      const response = await apiFetch(`/super-admin/payment-approvals/${reference}`)
      setTransaction(response.transaction)
      
    } catch (error) {
      console.error('Error searching transaction:', error)
      setError("Transaction not found. Please check your reference number.")
      setTransaction(null)
    } finally {
      setLoading(false)
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

  const getStatusIcon = (status: string, approvalStatus: string) => {
    if (approvalStatus === 'approved' && status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    } else if (approvalStatus === 'rejected') {
      return <XCircle className="h-5 w-5 text-red-500" />
    } else if (approvalStatus === 'pending') {
      return <Clock className="h-5 w-5 text-orange-500" />
    } else {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    }
  }

  const formatCurrency = (amount: number, currency: string = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Payment Status Tracker
          </CardTitle>
          <CardDescription>
            Enter your payment reference to check the status of your payment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter payment reference (e.g., MAN_ABC123)"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="flex-1"
            />
            <Button onClick={searchTransaction} disabled={loading}>
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {transaction && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(transaction.status, transaction.approval_status)}
                  Payment #{transaction.reference}
                </CardTitle>
                <CardDescription>
                  Submitted on {new Date(transaction.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(transaction.status)}
                {getApprovalStatusBadge(transaction.approval_status)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Payment Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Amount:</span>
                      <span className="font-medium">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <span className="text-sm">{transaction.type.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Gateway:</span>
                      <span className="text-sm">{transaction.payment_gateway.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {transaction.isManualPayment && (
                  <div>
                    <h4 className="font-medium mb-2">Bank Transfer Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Bank Reference:</span>
                        <span className="text-sm">{transaction.bank_reference}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Bank Name:</span>
                        <span className="text-sm">{transaction.bank_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Account Number:</span>
                        <span className="text-sm">{transaction.account_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Account Name:</span>
                        <span className="text-sm">{transaction.account_name}</span>
                      </div>
                      {transaction.payment_date && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Payment Date:</span>
                          <span className="text-sm">
                            {new Date(transaction.payment_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Approval Details</h4>
                  <div className="space-y-2">
                    {transaction.approval_status === 'approved' && transaction.approved_at && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Approved:</span>
                        <span className="text-sm">
                          {new Date(transaction.approved_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {transaction.approver && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Approved by:</span>
                        <span className="text-sm">{transaction.approver.name}</span>
                      </div>
                    )}
                    {transaction.approval_notes && (
                      <div>
                        <span className="text-sm text-muted-foreground">Approval Notes:</span>
                        <p className="text-sm mt-1 p-2 bg-muted rounded">{transaction.approval_notes}</p>
                      </div>
                    )}
                    {transaction.rejection_reason && (
                      <div>
                        <span className="text-sm text-muted-foreground">Rejection Reason:</span>
                        <p className="text-sm mt-1 p-2 bg-red-50 text-red-700 rounded">
                          {transaction.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Status Timeline</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Payment submitted</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(transaction.created_at).toLocaleString()}
                  </span>
                </div>
                
                {transaction.approval_status === 'approved' && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Payment approved</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {transaction.approved_at ? new Date(transaction.approved_at).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                )}
                
                {transaction.approval_status === 'rejected' && (
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Payment rejected</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {transaction.approved_at ? new Date(transaction.approved_at).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                )}
                
                {transaction.approval_status === 'pending' && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Awaiting approval</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
