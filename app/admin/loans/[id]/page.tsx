"use client"

import { use, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, CheckCircle, XCircle, FileText, Download, Calendar, User, Loader2, ExternalLink } from "lucide-react"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast as sonnerToast } from "sonner"
import { apiFetch } from "@/lib/api/client"
import { resolveStorageUrl } from "@/lib/api/config"
import { useTenantPermissions } from "@/components/admin/can-permission"
import { getWorkflowSettings } from "@/lib/api/office"

interface Loan {
  id: string
  member?: {
    member_id?: string
    member_number?: string
    user?: {
      first_name?: string
      last_name?: string
      email?: string
      phone?: string
    }
  }
  product?: {
    id?: string
    name?: string
    interest_rate?: number | string
  }
  amount: number | string
  interest_rate: number | string
  duration_months: number
  type: string
  purpose?: string
  status: string
  application_date: string
  approved_at?: string
  rejected_at?: string
  rejection_reason?: string
  monthly_payment?: number | string | null
  total_amount?: number | string | null
  interest_amount?: number | string | null
  processing_fee?: number | string | null
  net_pay?: number | string | null
  pay_slip?: {
    path?: string
    mime?: string
    url?: string
  } | string | null
  application_metadata?: {
    net_pay?: number | string
    employment_status?: string
    guarantor_name?: string
    guarantor_phone?: string
    guarantor_relationship?: string
    guarantor_address?: string
    pay_slip?: {
      path?: string
      mime?: string
      url?: string
    } | string | null
  } | null
  repayments?: Array<{
    id: string
    amount: number
    payment_date: string
    status: string
    notes?: string
    reference?: string
    payment_method?: string
  }>
  created_at: string
}

const toNumber = (value: unknown): number => {
  if (value === null || value === undefined || value === "") return 0
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

export default function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { can } = useTenantPermissions()
  const [loan, setLoan] = useState<Loan | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showDisburseDialog, setShowDisburseDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [loanWorkflowEnabled, setLoanWorkflowEnabled] = useState(false)
  const [showPayslipDialog, setShowPayslipDialog] = useState(false)

  useEffect(() => {
    fetchLoan()
    void getWorkflowSettings()
      .then((res) => {
        const loanSetting = (res.data || []).find((r: any) => r.process_key === "loan")
        setLoanWorkflowEnabled(!!loanSetting?.enabled)
      })
      .catch(() => setLoanWorkflowEnabled(false))
  }, [id])

  const fetchLoan = async () => {
    try {
      setLoading(true)
      const response = await apiFetch<{ success: boolean; data: Loan }>(
        `/admin/loans/${id}`
      )

      if (response.success && response.data) {
        setLoan(response.data)
      }
    } catch (error: any) {
      console.error('Error fetching loan:', error)
      sonnerToast.error("Failed to load loan", {
        description: error.message || "Please try again later",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    try {
      setProcessing(true)
      const response = await apiFetch<{
        success: boolean
        message?: string
        data?: Loan & { href?: string; workflow_instance_id?: string }
      }>(`/admin/loans/${id}/approve`, { method: 'POST' })

      if (response.success) {
        const href = (response.data as any)?.href
        if (href || (response.data as any)?.workflow_instance_id) {
          sonnerToast.success("Sent to Digital Office", {
            description: response.message || "Complete review/approval in Digital Office",
            action: href
              ? {
                  label: "Open",
                  onClick: () => {
                    window.location.href = href
                  },
                }
              : undefined,
          })
        } else {
          sonnerToast.success("Loan Approved", {
            description: response.message || "Loan has been approved successfully",
          })
        }
        setShowApproveDialog(false)
        fetchLoan()
      }
    } catch (error: any) {
      console.error('Error approving loan:', error)
      const href = error?.data?.href
      if (error?.status === 409 || href) {
        sonnerToast.message(error.message || "Use Digital Office", {
          action: {
            label: "Open",
            onClick: () => {
              window.location.href = href || "/admin/office/workflow/queue"
            },
          },
        })
      } else {
        sonnerToast.error("Failed to approve loan", {
          description: error.message || "Please try again later",
        })
      }
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      sonnerToast.error("Rejection reason required", {
        description: "Please provide a reason for rejecting this loan",
      })
      return
    }

    try {
      setProcessing(true)
      const response = await apiFetch<{ success: boolean; message?: string; data?: Loan }>(
        `/admin/loans/${id}/reject`,
        {
          method: 'POST',
          body: { rejection_reason: rejectionReason }
        }
      )

      if (response.success) {
        sonnerToast.success("Loan Rejected", {
          description: response.message || "Loan has been rejected",
        })
    setShowRejectDialog(false)
        setRejectionReason("")
        fetchLoan()
      }
    } catch (error: any) {
      console.error('Error rejecting loan:', error)
      sonnerToast.error("Failed to reject loan", {
        description: error.message || "Please try again later",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleDisburse = async () => {
    try {
      setProcessing(true)
      const response = await apiFetch<{ success: boolean; message?: string; data?: Loan }>(
        `/admin/loans/${id}/disburse`,
        { method: 'POST' }
      )

      if (response.success) {
        sonnerToast.success("Loan Disbursed", {
          description: response.message || "Loan has been disbursed successfully",
        })
    setShowDisburseDialog(false)
        fetchLoan()
      }
    } catch (error: any) {
      console.error('Error disbursing loan:', error)
      sonnerToast.error("Failed to disburse loan", {
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
    if (loan?.member?.user) {
      return `${loan.member.user.first_name || ''} ${loan.member.user.last_name || ''}`.trim() || 'N/A'
    }
    return 'N/A'
  }

  const getNetPay = () => {
    const raw = loan?.net_pay ?? loan?.application_metadata?.net_pay
    return toNumber(raw)
  }

  const getPaySlip = () => {
    const slip = loan?.pay_slip ?? loan?.application_metadata?.pay_slip
    if (!slip) return null
    if (typeof slip === "string") {
      return { url: slip, mime: "" }
    }
    return slip
  }

  const getPaySlipUrl = () => {
    const slip = getPaySlip()
    if (!slip) return ""
    return resolveStorageUrl(slip.url || slip.path || "")
  }

  // Prefer values persisted at application time; fall back to flat tenure interest
  // (principal × rate once, then ÷ months). Always coerce decimals — Laravel sends strings.
  const getLoanAmount = () => toNumber(loan?.amount)
  const getInterestRate = () => {
    const rate = toNumber(loan?.interest_rate)
    if (rate > 0) return rate
    return toNumber(loan?.product?.interest_rate)
  }
  const getTenureMonths = () => Math.max(0, Number(loan?.duration_months ?? 0))

  const calculateTotalRepayment = () => {
    if (!loan) return 0
    const stored = toNumber(loan.total_amount)
    if (stored > 0) return stored
    const amount = getLoanAmount()
    if (!amount) return 0
    return amount + amount * (getInterestRate() / 100)
  }

  const calculateMonthlyPayment = () => {
    if (!loan) return 0
    const stored = toNumber(loan.monthly_payment)
    if (stored > 0) return stored
    const months = getTenureMonths()
    if (!months) return 0
    return calculateTotalRepayment() / months
  }

  const generateRepaymentSchedule = () => {
    if (!loan || !loan.duration_months) return []
    const monthlyPayment = calculateMonthlyPayment()
    const schedule = []
    const startDate = new Date(loan.application_date || loan.created_at)

    for (let i = 0; i < loan.duration_months; i++) {
      const dueDate = new Date(startDate)
      dueDate.setMonth(dueDate.getMonth() + i + 1)
      
      schedule.push({
        month: i + 1,
        dueDate: dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        amount: monthlyPayment,
        status: loan.repayments && loan.repayments[i] ? loan.repayments[i].status : 'pending',
      })
    }

    return schedule
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!loan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/loans">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Loan Not Found</h1>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">The loan you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/loans">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Loan Application</h1>
          <p className="text-muted-foreground">{loan.id.substring(0, 8)}...</p>
        </div>
        <Badge
          variant={
            loan.status === "approved" || loan.status === "active"
              ? "default"
              : loan.status === "rejected"
                ? "destructive"
                  : "secondary"
          }
        >
          {loan.status}
        </Badge>
      </div>

      {loan.status === "pending" && (can("approve_loans") || can("reject_loans")) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  {loanWorkflowEnabled
                    ? "Pending — Digital Office workflow"
                    : "Loan Application Pending Review"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {loanWorkflowEnabled
                    ? "Send this loan into Digital Office for review / recommendation / approval"
                    : "Review application details and approve or reject"}
                </p>
              </div>
              <div className="flex gap-2">
                {can("approve_loans") && (
                  <Button onClick={() => setShowApproveDialog(true)} disabled={processing}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {loanWorkflowEnabled ? "Send to Digital Office" : "Approve Loan"}
                  </Button>
                )}
                {can("reject_loans") && (
                  loanWorkflowEnabled ? (
                    <Button variant="outline" asChild>
                      <Link href="/admin/office/workflow/queue">Open workflow queue</Link>
                    </Button>
                  ) : (
                    <Button variant="destructive" onClick={() => setShowRejectDialog(true)} disabled={processing}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Loan
                    </Button>
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loan.status === "approved" && can("disburse_loans|approve_loans") && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Loan Approved - Ready for Disbursement</h3>
                <p className="text-sm text-muted-foreground">Disburse funds to the applicant's account</p>
              </div>
              <Button onClick={() => setShowDisburseDialog(true)} disabled={processing}>
                Disburse Loan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Loan Details</TabsTrigger>
          <TabsTrigger value="applicant">Applicant Info</TabsTrigger>
          <TabsTrigger value="schedule">Repayment Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Loan Information</CardTitle>
              <CardDescription>Application details and terms</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Loan Amount</label>
                  <p className="text-2xl font-bold">{formatCurrency(getLoanAmount())}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Tenure</label>
                  <p className="font-medium">{loan.duration_months} months</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Interest Rate</label>
                  <p className="font-medium">{getInterestRate().toFixed(2)}% (Simple Interest)</p>
                </div>
                {loan.purpose && (
                <div>
                  <label className="text-sm text-muted-foreground">Purpose</label>
                  <p className="font-medium">{loan.purpose}</p>
                </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Monthly Repayment</label>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(calculateMonthlyPayment())}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Total Repayment</label>
                  <p className="font-medium">{formatCurrency(calculateTotalRepayment())}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Interest Amount</label>
                  <p className="font-medium">
                    {formatCurrency(
                      toNumber(loan.interest_amount) ||
                        Math.max(0, calculateTotalRepayment() - getLoanAmount())
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Loan Type</label>
                  <p className="font-medium">{loan.type || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Net Pay</label>
                  <p className="text-2xl font-bold">
                    {getNetPay() > 0 ? formatCurrency(getNetPay()) : "—"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Payslip</label>
                  {getPaySlipUrl() ? (
                    <div className="mt-1 flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setShowPayslipDialog(true)}>
                        <FileText className="mr-2 h-4 w-4" />
                        View payslip
                      </Button>
                      <Button type="button" variant="ghost" size="sm" asChild>
                        <a href={getPaySlipUrl()} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No payslip attached</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
              <CardDescription>Key dates and milestones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Application Date</p>
                  <p className="text-sm text-muted-foreground">{formatDate(loan.application_date || loan.created_at)}</p>
                </div>
              </div>
              {loan.approved_at && (
                <div className="flex items-center gap-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Approved Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(loan.approved_at)}</p>
                  </div>
                </div>
              )}
              {loan.rejected_at && (
                <div className="flex items-center gap-4">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium">Rejected Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(loan.rejected_at)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applicant" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Applicant Information</CardTitle>
              <CardDescription>Member details</CardDescription>
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
                  <p className="font-medium font-mono">{loan.member?.member_number || loan.member?.member_id || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Net Pay</label>
                  <p className="text-xl font-bold">
                    {getNetPay() > 0 ? formatCurrency(getNetPay()) : "—"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {loan.member?.user?.email && (
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                    <p className="font-medium">{loan.member.user.email}</p>
                </div>
                )}
                {loan.member?.user?.phone && (
                <div>
                  <label className="text-sm text-muted-foreground">Phone</label>
                    <p className="font-medium">{loan.member.user.phone}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-muted-foreground">Payslip</label>
                  {getPaySlipUrl() ? (
                    <Button type="button" variant="outline" size="sm" className="mt-1" onClick={() => setShowPayslipDialog(true)}>
                      <FileText className="mr-2 h-4 w-4" />
                      View payslip
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground">No payslip attached</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Repayment Schedule</CardTitle>
              <CardDescription>Monthly repayment plan</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generateRepaymentSchedule().slice(0, 12).map((payment) => {
                    // Find matching repayment from loan.repayments if available
                    const repayment = loan.repayments?.find((r: any) => 
                      r.payment_date && formatDate(r.payment_date) === payment.dueDate
                    )
                    return (
                    <TableRow key={payment.month}>
                      <TableCell>Month {payment.month}</TableCell>
                      <TableCell>{payment.dueDate}</TableCell>
                      <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={payment.status === "paid" ? "default" : "secondary"}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {repayment?.notes || '—'}
                      </TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {loanWorkflowEnabled ? "Send to Digital Office" : "Approve Loan Application"}
            </DialogTitle>
            <DialogDescription>
              {loanWorkflowEnabled
                ? `This will place the loan (${formatCurrency(loan.amount)}) into the Digital Office workflow for review / recommendation / approval.`
                : `Are you sure you want to approve this loan application for ${formatCurrency(loan.amount)}?`}
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
                "Approve Loan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Loan Application</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this loan application.</DialogDescription>
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
                "Reject Loan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDisburseDialog} onOpenChange={setShowDisburseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disburse Loan</DialogTitle>
            <DialogDescription>
              Confirm disbursement of {formatCurrency(loan.amount)} to {getMemberName()}'s account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisburseDialog(false)} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={handleDisburse} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Disbursing...
                </>
              ) : (
                "Confirm Disbursement"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showPayslipDialog} onOpenChange={setShowPayslipDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Member Payslip</DialogTitle>
            <DialogDescription>
              Payslip attached with this loan application
              {getNetPay() > 0 ? ` · Net pay: ${formatCurrency(getNetPay())}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-[320px] rounded-md border bg-muted/30 p-2">
            {(() => {
              const url = getPaySlipUrl()
              const mime = (getPaySlip()?.mime || "").toLowerCase()
              if (!url) {
                return <p className="p-4 text-sm text-muted-foreground">Payslip file is unavailable.</p>
              }
              if (mime.includes("pdf") || url.toLowerCase().endsWith(".pdf")) {
                return (
                  <iframe title="Payslip" src={url} className="h-[70vh] w-full rounded-md bg-white" />
                )
              }
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt="Payslip" className="mx-auto max-h-[70vh] w-auto max-w-full object-contain" />
              )
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" asChild>
              <a href={getPaySlipUrl()} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                Download / Open
              </a>
            </Button>
            <Button onClick={() => setShowPayslipDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
