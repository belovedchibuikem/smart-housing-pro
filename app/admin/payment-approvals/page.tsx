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
  Download, 
  RefreshCw,
  CreditCard,
  Building2,
  DollarSign,
  Wallet,
  Calendar,
  User,
  Banknote,
  Users,
  Phone,
  FileText,
  Image as ImageIcon,
  Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { toast as sonnerToast } from "sonner"
import { apiFetch } from "@/lib/api/client"

const paymentMethodOptions = [
  { label: "All Methods", value: "all" },
  { label: "Paystack", value: "paystack" },
  { label: "Remita", value: "remita" },
  { label: "Stripe", value: "stripe" },
  { label: "Manual", value: "manual" },
  { label: "Bank Transfer", value: "bank_transfer" },
]

const statusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Failed", value: "failed" },
]

const approvalStatusOptions = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
]

const perPageOptions = [10, 20, 50]

interface PaymentTransaction {
  id: string
  reference: string
  user_id: string
  user_name: string
  user_email: string
  amount: number
  currency: string
  status: string
  payment_method: string
  payment_type?: string
  approval_status: string
  bank_reference?: string
  bank_name?: string
  account_number?: string
  account_name?: string
  payment_date?: string
  payment_evidence?: string[]
  payer_name?: string
  payer_phone?: string
  account_details?: string
  approval_notes?: string
  rejection_reason?: string
  description: string
  created_at: string
  user?: {
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
  success: boolean
  payments: PaymentTransaction[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

interface PaymentLogEntry {
  id: string
  reference: string
  user_id: string
  user_name: string
  user_email: string
  amount: number
  currency: string
  payment_method: string
  payment_type?: string | null
  status: string
  approval_status: string
  approval_notes?: string | null
  rejection_reason?: string | null
  approved_by?: string | null
  approver_name?: string | null
  approver_email?: string | null
  approved_at?: string | null
  payment_date?: string | null
  description: string
  created_at: string
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
    search: "",
    payment_method: "",
    status: "",
    approval_status: "",
    date_from: "",
    date_to: "",
    per_page: perPageOptions[0],
  })
  const [logsFilters, setLogsFilters] = useState({
    search: "",
    payment_method: "",
    status: "",
    approval_status: "",
    date_from: "",
    date_to: "",
    per_page: perPageOptions[0],
  })
  const [reconciliationFilters, setReconciliationFilters] = useState({
    start_date: "",
    end_date: "",
  })
  const [reconciliationData, setReconciliationData] = useState<ReconciliationData | null>(null)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState<"pending" | "logs" | "reconciliation">("pending")
  const [paymentLogs, setPaymentLogs] = useState<PaymentLogEntry[]>([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [logsPagination, setLogsPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: perPageOptions[0],
    total: 0,
  })
  const [pendingPagination, setPendingPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: perPageOptions[0],
    total: 0,
  })

  useEffect(() => {
    loadPendingApprovals()
    loadReconciliationData()
  }, [])

  const loadPendingApprovals = async (page = pendingPagination.current_page, perPage = filters.per_page) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("per_page", String(perPage))
      if (filters.search.trim()) params.set("search", filters.search.trim())
      if (filters.payment_method) params.set("payment_method", filters.payment_method)
      if (filters.status) params.set("status", filters.status)
      if (filters.approval_status) params.set("approval_status", filters.approval_status)
      if (filters.date_from) params.set("date_from", filters.date_from)
      if (filters.date_to) params.set("date_to", filters.date_to)

      const response = await apiFetch<PaymentApprovalsResponse>(`/admin/payment-approvals?${params.toString()}`)
      setPayments(response.payments || [])
      if (response.pagination) {
        setPendingPagination({
          current_page: response.pagination.current_page,
          last_page: response.pagination.last_page,
          per_page: response.pagination.per_page,
          total: response.pagination.total,
        })
        setFilters((prev) => ({ ...prev, per_page: response.pagination.per_page }))
      }
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
      const params = new URLSearchParams()
      if (reconciliationFilters.start_date) params.set("start_date", reconciliationFilters.start_date)
      if (reconciliationFilters.end_date) params.set("end_date", reconciliationFilters.end_date)

      const response = await apiFetch<{ reconciliation_data: ReconciliationData }>(
        `/admin/payment-approvals/reconciliation/data${params.toString() ? `?${params.toString()}` : ""}`,
      )
      setReconciliationData(response.reconciliation_data)
    } catch (error) {
      console.error("Error loading reconciliation data:", error)
    }
  }

  const loadPaymentLogs = async (page = logsPagination.current_page, perPage = logsFilters.per_page) => {
    try {
      setLogsLoading(true)
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("per_page", String(perPage))
      if (logsFilters.search.trim()) params.set("search", logsFilters.search.trim())
      if (logsFilters.payment_method) params.set("payment_method", logsFilters.payment_method)
      if (logsFilters.status) params.set("status", logsFilters.status)
      if (logsFilters.approval_status) params.set("approval_status", logsFilters.approval_status)
      if (logsFilters.date_from) params.set("date_from", logsFilters.date_from)
      if (logsFilters.date_to) params.set("date_to", logsFilters.date_to)

      const response = await apiFetch<{
        success: boolean
        payments: PaymentLogEntry[]
        pagination: {
          current_page: number
          last_page: number
          per_page: number
          total: number
        }
      }>(`/admin/payment-approvals/logs/payments?${params.toString()}`)

      setPaymentLogs(response.payments || [])
      if (response.pagination) {
        setLogsPagination({
          current_page: response.pagination.current_page,
          last_page: response.pagination.last_page,
          per_page: response.pagination.per_page,
          total: response.pagination.total,
        })
        setLogsFilters((prev) => ({ ...prev, per_page: response.pagination.per_page }))
      }
    } catch (error) {
      console.error("Error loading payment logs:", error)
      toast({
        title: "Error",
        description: "Failed to load payment logs",
        variant: "destructive",
      })
    } finally {
      setLogsLoading(false)
    }
  }

  const handleTabChange = (value: string) => {
    const tab = value as "pending" | "logs" | "reconciliation"
    setActiveTab(tab)

    if (tab === "logs") {
      loadPaymentLogs()
    } else if (tab === "reconciliation") {
      loadReconciliationData()
    }
  }

  const approvePayment = async (paymentId: string) => {
    if (!paymentId) return
    
    setIsProcessing(true)
    try {
      const response = await apiFetch<{ success: boolean; message: string }>(`/admin/payment-approvals/${paymentId}/approve`, {
        method: "POST",
        body: { approval_notes: approvalNotes }
      })

      toast({
        title: "Success",
        description: response.message || "Payment approved successfully",
      })
      sonnerToast.success(response.message || "Payment approved successfully")

      setSelectedPayment(null)
      setApprovalNotes("")
      setShowApproveDialog(false)
      loadPendingApprovals()
      loadReconciliationData()
      if (activeTab === "logs") {
        loadPaymentLogs()
      }
    } catch (error: any) {
      console.error("Error approving payment:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to approve payment",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const rejectPayment = async (paymentId: string) => {
    if (!paymentId || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      })
      return
    }
    
    setIsProcessing(true)
    try {
      const response = await apiFetch<{ success: boolean; message: string }>(`/admin/payment-approvals/${paymentId}/reject`, {
        method: "POST",
        body: { rejection_reason: rejectionReason }
      })

      toast({
        title: "Success",
        description: response.message || "Payment rejected successfully",
      })

      setSelectedPayment(null)
      setRejectionReason("")
      setShowRejectDialog(false)
      loadPendingApprovals()
      loadReconciliationData()
      if (activeTab === "logs") {
        loadPaymentLogs()
      }
    } catch (error: any) {
      console.error("Error rejecting payment:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to reject payment",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
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

  const quickAmounts = [5000, 10000, 25000, 50000, 100000]

  const parseAccountDetails = (details?: string | Record<string, any>): Record<string, any> | null => {
    if (!details) return null
    if (typeof details === "object") return details
    try {
      return JSON.parse(details)
    } catch (error) {
      console.warn("Failed to parse account details", error)
      return null
    }
  }

  const handlePendingFilterChange = (field: keyof typeof filters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const applyPendingFilters = () => {
    setPendingPagination((prev) => ({ ...prev, current_page: 1, per_page: Number(filters.per_page) }))
    loadPendingApprovals(1, Number(filters.per_page))
  }

  const resetPendingFilters = () => {
    const reset = {
      search: "",
      payment_method: "",
      status: "",
      approval_status: "",
      date_from: "",
      date_to: "",
      per_page: perPageOptions[0],
    }
    setFilters(reset)
    setPendingPagination({ current_page: 1, last_page: 1, per_page: perPageOptions[0], total: 0 })
    loadPendingApprovals(1, perPageOptions[0])
  }

  const handleLogsFilterChange = (field: keyof typeof logsFilters, value: string | number) => {
    setLogsFilters((prev) => ({ ...prev, [field]: value }))
  }

  const applyLogsFilters = () => {
    setLogsPagination((prev) => ({ ...prev, current_page: 1, per_page: Number(logsFilters.per_page) }))
    loadPaymentLogs(1, Number(logsFilters.per_page))
  }

  const resetLogsFilters = () => {
    const reset = {
      search: "",
      payment_method: "",
      status: "",
      approval_status: "",
      date_from: "",
      date_to: "",
      per_page: perPageOptions[0],
    }
    setLogsFilters(reset)
    setLogsPagination({ current_page: 1, last_page: 1, per_page: perPageOptions[0], total: 0 })
    loadPaymentLogs(1, perPageOptions[0])
  }

  const applyReconciliationFilters = () => {
    loadReconciliationData()
  }

  const resetReconciliationFilters = () => {
    setReconciliationFilters({ start_date: "", end_date: "" })
    loadReconciliationData()
  }

  const handlePendingPageChange = (direction: "prev" | "next") => {
    const nextPage = direction === "prev" ? pendingPagination.current_page - 1 : pendingPagination.current_page + 1
    if (nextPage < 1 || nextPage > pendingPagination.last_page) return
    loadPendingApprovals(nextPage, filters.per_page)
  }

  const handleLogsPageChange = (direction: "prev" | "next") => {
    const nextPage = direction === "prev" ? logsPagination.current_page - 1 : logsPagination.current_page + 1
    if (nextPage < 1 || nextPage > logsPagination.last_page) return
    loadPaymentLogs(nextPage, logsFilters.per_page)
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

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
          <TabsTrigger value="logs">Payment Logs</TabsTrigger>
          <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Pending Payment Approvals</h2>
              <Button onClick={() => loadPendingApprovals()} variant="outline" size="sm" disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Filter and refine pending payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="pending-search">Search</Label>
                    <Input
                      id="pending-search"
                      placeholder="Reference, member name, email"
                      value={filters.search}
                      onChange={(event) => handlePendingFilterChange("search", event.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Payment Method</Label>
                  <Select
                    value={filters.payment_method || "all"}
                    onValueChange={(value) =>
                      handlePendingFilterChange("payment_method", value === "all" ? "" : value)
                    }
                  >
                      <SelectTrigger>
                        <SelectValue placeholder="All methods" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethodOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                  <Select
                    value={filters.status || "all"}
                    onValueChange={(value) => handlePendingFilterChange("status", value === "all" ? "" : value)}
                  >
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Approval Status</Label>
                  <Select
                    value={filters.approval_status || "all"}
                    onValueChange={(value) =>
                      handlePendingFilterChange("approval_status", value === "all" ? "" : value)
                    }
                  >
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        {approvalStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Date From</Label>
                    <Input
                      type="date"
                      value={filters.date_from}
                      onChange={(event) => handlePendingFilterChange("date_from", event.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Date To</Label>
                    <Input
                      type="date"
                      value={filters.date_to}
                      onChange={(event) => handlePendingFilterChange("date_to", event.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Per Page</Label>
                    <Select
                      value={String(filters.per_page)}
                      onValueChange={(value) => handlePendingFilterChange("per_page", Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {perPageOptions.map((size) => (
                          <SelectItem key={size} value={String(size)}>
                            {size} per page
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 justify-end">
                  <Button variant="outline" onClick={resetPendingFilters} disabled={loading}>
                    Reset
                  </Button>
                  <Button onClick={applyPendingFilters} disabled={loading}>
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
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
                          {payment.user_name || payment.user?.name} ({payment.user_email || payment.user?.email})
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {payment.description}
                        </p>
                        {payment.payment_type && (
                          <Badge variant="outline" className="mt-1">
                            {payment.payment_type.replace('_', ' ')}
                          </Badge>
                        )}
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
                      <p className="text-sm">{payment.user_name || payment.user?.name}</p>
                    </div>
                  </div>

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
                        <DialogContent className="max-h-[90vh] w-full max-w-4xl overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Payment Details</DialogTitle>
                            <DialogDescription>
                              Review payment details before approval
                            </DialogDescription>
                          </DialogHeader>
                          {selectedPayment && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                  <Label>Reference</Label>
                                  <p className="text-sm break-all">{selectedPayment.reference}</p>
                                </div>
                                <div>
                                  <Label>Amount</Label>
                                  <p className="text-sm font-semibold">
                                    {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                                  </p>
                                </div>
                                <div>
                                  <Label>Member</Label>
                                  <p className="text-sm">{selectedPayment.user_name || selectedPayment.user?.name}</p>
                                </div>
                                <div>
                                  <Label>Payment Method</Label>
                                  <p className="text-sm">{selectedPayment.payment_method}</p>
                                </div>
                              </div>

                              {(selectedPayment.payment_method === 'bank_transfer' || selectedPayment.payment_method === 'manual') && (
                                <div className="p-4 bg-muted rounded-lg space-y-4">
                                  <h4 className="font-medium mb-2">Payment Details</h4>
                                  {(selectedPayment.payer_name || selectedPayment.payer_phone) && (
                                    <div className="grid grid-cols-2 gap-4">
                                      {selectedPayment.payer_name && (
                                        <div>
                                          <Label className="text-sm flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Payer Name
                                          </Label>
                                          <p className="text-sm">{selectedPayment.payer_name}</p>
                                        </div>
                                      )}
                                      {selectedPayment.payer_phone && (
                                        <div>
                                          <Label className="text-sm flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            Payer Phone
                                          </Label>
                                          <p className="text-sm">{selectedPayment.payer_phone}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {(() => {
                                    const details = parseAccountDetails(selectedPayment.account_details)
                                    if (!details) return null

                                    return (
                                      <div>
                                        <Label className="text-sm flex items-center gap-2">
                                          <FileText className="h-4 w-4" />
                                          Destination Account
                                        </Label>
                                        <div className="mt-2 grid gap-2 rounded-md border bg-muted/50 p-3 text-sm">
                                          {details.bank_name && (
                                            <div className="flex items-center justify-between">
                                              <span className="text-muted-foreground">Bank</span>
                                              <span className="font-medium">{details.bank_name}</span>
                                            </div>
                                          )}
                                          {details.account_name && (
                                            <div className="flex items-center justify-between">
                                              <span className="text-muted-foreground">Account Name</span>
                                              <span className="font-medium">{details.account_name}</span>
                                            </div>
                                          )}
                                          {details.account_number && (
                                            <div className="flex items-center justify-between">
                                              <span className="text-muted-foreground">Account Number</span>
                                              <span className="font-medium">{details.account_number}</span>
                                            </div>
                                          )}
                                          {details.is_primary && (
                                            <Badge variant="outline" className="w-fit">
                                              Primary account
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })()}
                                  <div className="grid grid-cols-2 gap-4">
                                    {selectedPayment.bank_name && (
                                      <div>
                                        <Label className="text-sm">Bank Name</Label>
                                        <p className="text-sm">{selectedPayment.bank_name}</p>
                                      </div>
                                    )}
                                    {selectedPayment.account_number && (
                                      <div>
                                        <Label className="text-sm">Account Number</Label>
                                        <p className="text-sm">{selectedPayment.account_number}</p>
                                      </div>
                                    )}
                                    {selectedPayment.account_name && (
                                      <div>
                                        <Label className="text-sm">Account Name</Label>
                                        <p className="text-sm">{selectedPayment.account_name}</p>
                                      </div>
                                    )}
                                    {selectedPayment.payment_date && (
                                      <div>
                                        <Label className="text-sm">Payment Date</Label>
                                        <p className="text-sm">
                                          {new Date(selectedPayment.payment_date).toLocaleDateString()}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  {selectedPayment.payment_evidence && selectedPayment.payment_evidence.length > 0 && (
                                    <div>
                                      <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <ImageIcon className="h-4 w-4" />
                                        Payment Evidence ({selectedPayment.payment_evidence.length} {selectedPayment.payment_evidence.length === 1 ? 'file' : 'files'})
                                      </Label>
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {selectedPayment.payment_evidence.map((evidence, index) => (
                                          <div
                                            key={index}
                                            className="group relative aspect-video overflow-hidden rounded border-2 border-gray-200 bg-white transition-colors hover:border-primary"
                                          >
                                            <img
                                              src={evidence}
                                              alt={`Payment evidence ${index + 1}`}
                                              className="h-full w-full object-cover"
                                              onError={(event) => {
                                                const target = event.target as HTMLImageElement
                                                target.style.display = "none"
                                              }}
                                            />
                                            <a
                                              href={evidence}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="absolute inset-0"
                                              aria-label={`Open payment evidence ${index + 1}`}
                                            >
                                              <span className="sr-only">Open evidence</span>
                                            </a>
                                            <a
                                              href={evidence}
                                              download
                                              className="absolute right-2 top-2 rounded-full bg-white p-2 opacity-0 shadow-md transition-opacity hover:bg-gray-50 group-hover:opacity-100"
                                              aria-label="Download evidence"
                                            >
                                              <Download className="h-4 w-4 text-gray-600" />
                                            </a>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="space-y-2">
                                <div className="space-y-2">
                                  <Label htmlFor="approval-notes">Approval Notes (Optional)</Label>
                                  <Textarea
                                    id="approval-notes"
                                    placeholder="Add any notes about this approval..."
                                    value={approvalNotes}
                                    onChange={(e) => setApprovalNotes(e.target.value)}
                                    rows={2}
                                  />
                                </div>
                                <div className="flex space-x-2">
                                  <Button 
                                    onClick={() => approvePayment(selectedPayment.id)}
                                    className="flex-1"
                                    disabled={isProcessing}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {isProcessing ? "Approving..." : "Approve Payment"}
                                  </Button>
                                  <Button 
                                    variant="outline"
                                    onClick={() => {
                                      setShowRejectDialog(true)
                                      setShowApproveDialog(false)
                                    }}
                                    className="flex-1"
                                    disabled={isProcessing}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject Payment
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {/* Reject Dialog */}
                      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Reject Payment</DialogTitle>
                            <DialogDescription>
                              Please provide a reason for rejecting this payment. This reason will be sent to the member.
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
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowRejectDialog(false)
                                setRejectionReason("")
                              }}
                              disabled={isProcessing}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => selectedPayment && rejectPayment(selectedPayment.id)}
                              disabled={isProcessing || !rejectionReason.trim()}
                              className="flex-1"
                            >
                              {isProcessing ? "Rejecting..." : "Reject Payment"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          {pendingPagination.total > 0 && (
            <div className="flex items-center justify-between border rounded-lg px-4 py-3 text-sm text-muted-foreground">
              <span>
                Page {pendingPagination.current_page} of {pendingPagination.last_page} • {pendingPagination.total} records
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePendingPageChange("prev")}
                  disabled={pendingPagination.current_page <= 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePendingPageChange("next")}
                  disabled={pendingPagination.current_page >= pendingPagination.last_page || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Payment Logs</h2>
            <Button onClick={() => loadPaymentLogs()} variant="outline" size="sm" disabled={logsLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Search and filter payment history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="logs-search">Search</Label>
                  <Input
                    id="logs-search"
                    placeholder="Reference, member name, email"
                    value={logsFilters.search}
                    onChange={(event) => handleLogsFilterChange("search", event.target.value)}
                  />
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <Select
                    value={logsFilters.payment_method || "all"}
                    onValueChange={(value) =>
                      handleLogsFilterChange("payment_method", value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All methods" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethodOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={logsFilters.status || "all"}
                    onValueChange={(value) => handleLogsFilterChange("status", value === "all" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Approval Status</Label>
                  <Select
                    value={logsFilters.approval_status || "all"}
                    onValueChange={(value) =>
                      handleLogsFilterChange("approval_status", value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      {approvalStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date From</Label>
                  <Input
                    type="date"
                    value={logsFilters.date_from}
                    onChange={(event) => handleLogsFilterChange("date_from", event.target.value)}
                  />
                </div>
                <div>
                  <Label>Date To</Label>
                  <Input
                    type="date"
                    value={logsFilters.date_to}
                    onChange={(event) => handleLogsFilterChange("date_to", event.target.value)}
                  />
                </div>
                <div>
                  <Label>Per Page</Label>
                  <Select
                    value={String(logsFilters.per_page)}
                    onValueChange={(value) => handleLogsFilterChange("per_page", Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {perPageOptions.map((size) => (
                        <SelectItem key={`logs-per-${size}`} value={String(size)}>
                          {size} per page
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 justify-end">
                <Button variant="outline" onClick={resetLogsFilters} disabled={logsLoading}>
                  Reset
                </Button>
                <Button onClick={applyLogsFilters} disabled={logsLoading}>
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {logsLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-10">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading payment logs...
                </div>
              </CardContent>
            </Card>
          ) : paymentLogs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <FileText className="h-10 w-10 text-muted-foreground mb-3" />
                <h3 className="text-lg font-semibold mb-1">No Payment Logs</h3>
                <p className="text-muted-foreground">Approved and rejected payments will appear here once processed.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {paymentLogs.map((log) => (
                <Card key={log.id} className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        {getPaymentMethodIcon(log.payment_method)}
                        <div>
                          <h3 className="font-semibold">Payment #{log.reference}</h3>
                          <p className="text-sm text-muted-foreground">
                            {log.user_name} ({log.user_email})
                          </p>
                          {log.description && (
                            <p className="text-sm text-muted-foreground">{log.description}</p>
                          )}
                          {log.payment_type && (
                            <Badge variant="outline" className="mt-1">
                              {log.payment_type.replace("_", " ")}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-xs uppercase text-muted-foreground">Amount</Label>
                          <p className="font-medium">{formatCurrency(log.amount, log.currency)}</p>
                        </div>
                        <div>
                          <Label className="text-xs uppercase text-muted-foreground">Processed On</Label>
                          <p>{log.approved_at ? new Date(log.approved_at).toLocaleString() : new Date(log.created_at).toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-xs uppercase text-muted-foreground">Processed By</Label>
                          <p>{log.approver_name || "System"}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label className="text-xs uppercase text-muted-foreground">Status</Label>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(log.status)}
                            {getApprovalStatusBadge(log.approval_status)}
                          </div>
                        </div>
                      </div>

                      {log.approval_notes && (
                        <div className="text-sm">
                          <Label className="text-xs uppercase text-muted-foreground">Approval Notes</Label>
                          <p>{log.approval_notes}</p>
                        </div>
                      )}

                      {log.rejection_reason && (
                        <div className="text-sm">
                          <Label className="text-xs uppercase text-muted-foreground">Rejection Reason</Label>
                          <p>{log.rejection_reason}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mt-1" />
                      <div>
                        <p>Requested: {new Date(log.created_at).toLocaleString()}</p>
                        {log.payment_date && <p>Paid: {new Date(log.payment_date).toLocaleDateString()}</p>}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {logsPagination.total > 0 && (
                <div className="flex items-center justify-between border rounded-lg px-4 py-3 text-sm text-muted-foreground">
                  <span>
                    Page {logsPagination.current_page} of {logsPagination.last_page} • {logsPagination.total} records
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLogsPageChange("prev")}
                      disabled={logsPagination.current_page <= 1 || logsLoading}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLogsPageChange("next")}
                      disabled={logsPagination.current_page >= logsPagination.last_page || logsLoading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reconciliation" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Reconciliation</h2>
            <Button onClick={loadReconciliationData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Limit reconciliation metrics by date range</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={reconciliationFilters.start_date}
                  onChange={(event) => setReconciliationFilters((prev) => ({ ...prev, start_date: event.target.value }))}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={reconciliationFilters.end_date}
                  onChange={(event) => setReconciliationFilters((prev) => ({ ...prev, end_date: event.target.value }))}
                />
              </div>
              <div className="md:col-span-2 flex items-end justify-end gap-3">
                <Button variant="outline" onClick={resetReconciliationFilters}>
                  Reset
                </Button>
                <Button onClick={applyReconciliationFilters}>Apply Filters</Button>
              </div>
            </CardContent>
          </Card>

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
