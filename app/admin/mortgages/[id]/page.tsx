"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Loader2,
  Edit,
  Trash2,
  Check,
  X,
  Building2,
  User,
  Home,
  FileText,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { apiFetch, repayMortgage, getMortgageRepaymentSchedule, getMortgageNextPayment, type RepaymentSchedule, type RepayMortgagePayload, type NextPaymentDetails } from "@/lib/api/client"
import { CheckCircle2, Calendar, DollarSign, AlertTriangle } from "lucide-react"

interface MortgageDetail {
  id: string
  member?: {
    id: string
    member_id?: string | null
    staff_id?: string | null
    user?: {
      first_name?: string | null
      last_name?: string | null
      email?: string | null
      phone?: string | null
    } | null
  } | null
  provider?: {
    id: string
    name?: string | null
    contact_name?: string | null
    contact_email?: string | null
  } | null
  property?: {
    id: string
    title?: string | null
    address?: string | null
    city?: string | null
    state?: string | null
  } | null
  loan_amount: number
  interest_rate: number
  tenure_years: number
  monthly_payment: number
  status: string
  schedule_approved?: boolean
  schedule_approved_at?: string | null
  application_date: string
  approved_at?: string | null
  rejected_at?: string | null
  notes?: string | null
}

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  approved: "default",
  active: "default",
  pending: "secondary",
  completed: "outline",
  rejected: "destructive",
}

function formatCurrency(amount?: number | null) {
  const value = Number(amount ?? 0)
  if (!Number.isFinite(value)) return "₦0"
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(value)
}

function formatDate(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function AdminMortgageDetailsPage() {
  const params = useParams<{ id?: string }>()
  const router = useRouter()
  const { toast } = useToast()

  const mortgageId = params?.id ?? ""
  const [mortgage, setMortgage] = useState<MortgageDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [repaymentSchedule, setRepaymentSchedule] = useState<RepaymentSchedule | null>(null)
  const [loadingSchedule, setLoadingSchedule] = useState(false)
  const [repaymentDialogOpen, setRepaymentDialogOpen] = useState(false)
  const [nextPayment, setNextPayment] = useState<NextPaymentDetails | null>(null)
  const [loadingNextPayment, setLoadingNextPayment] = useState(false)
  const [repaymentNotes, setRepaymentNotes] = useState("")
  const [submittingRepayment, setSubmittingRepayment] = useState(false)

  const fetchMortgage = useCallback(async () => {
    if (!mortgageId) return
    setLoading(true)
    try {
      const response = await apiFetch<{ success: boolean; data: MortgageDetail }>(`/admin/mortgages/${mortgageId}`)
      if (response.success) {
        setMortgage(response.data)
      }
    } catch (error: any) {
      console.error("Failed to load mortgage", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to load mortgage details.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [mortgageId, toast])

  useEffect(() => {
    fetchMortgage()
  }, [fetchMortgage])

  const fetchRepaymentSchedule = useCallback(async () => {
    if (!mortgageId || (mortgage?.status !== "approved" && mortgage?.status !== "active")) return
    setLoadingSchedule(true)
    try {
      const response = await getMortgageRepaymentSchedule(mortgageId)
      if (response.success && response.data) {
        setRepaymentSchedule(response.data)
      }
    } catch (error: any) {
      console.error("Failed to load repayment schedule", error)
    } finally {
      setLoadingSchedule(false)
    }
  }, [mortgageId, mortgage?.status])

  useEffect(() => {
    if (mortgage?.status === "approved" || mortgage?.status === "active") {
      fetchRepaymentSchedule()
    }
  }, [mortgage?.status, fetchRepaymentSchedule])

  const fetchNextPayment = useCallback(async () => {
    if (!mortgageId) return
    setLoadingNextPayment(true)
    try {
      const response = await getMortgageNextPayment(mortgageId)
      if (response.success && response.data) {
        setNextPayment(response.data)
      } else {
        toast({
          title: "Unable to calculate payment",
          description: response.message || "Failed to calculate next payment amount.",
          variant: "destructive",
        })
        setRepaymentDialogOpen(false)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to calculate next payment.",
        variant: "destructive",
      })
      setRepaymentDialogOpen(false)
    } finally {
      setLoadingNextPayment(false)
    }
  }, [mortgageId, toast])

  useEffect(() => {
    if (repaymentDialogOpen && mortgageId) {
      fetchNextPayment()
    } else {
      setNextPayment(null)
      setRepaymentNotes("")
    }
  }, [repaymentDialogOpen, mortgageId, fetchNextPayment])

  const handleRepaymentSubmit = async () => {
    if (!mortgageId || !nextPayment) return

    try {
      setSubmittingRepayment(true)
      const payload: RepayMortgagePayload = {
        amount: nextPayment.total_amount,
        principal_paid: nextPayment.principal_paid,
        interest_paid: nextPayment.interest_paid,
        due_date: nextPayment.due_date,
        payment_method: nextPayment.payment_method as "monthly" | "yearly" | "bi-yearly",
        notes: repaymentNotes || undefined,
      }

      const response = await repayMortgage(mortgageId, payload)
      if (response.success) {
        toast({
          title: "Repayment recorded",
          description: "Mortgage repayment has been successfully recorded.",
        })
        setRepaymentDialogOpen(false)
        setNextPayment(null)
        setRepaymentNotes("")
        await fetchMortgage()
        await fetchRepaymentSchedule()
      }
    } catch (error: any) {
      toast({
        title: "Repayment failed",
        description: error?.message || "Failed to record repayment.",
        variant: "destructive",
      })
    } finally {
      setSubmittingRepayment(false)
    }
  }

  const memberDisplay = useMemo(() => {
    if (!mortgage?.member) return "—"
    const first = mortgage.member.user?.first_name ?? ""
    const last = mortgage.member.user?.last_name ?? ""
    const name = `${first} ${last}`.trim() || "Unnamed Member"
    const code = mortgage.member.member_id || mortgage.member.staff_id
    return code ? `${name} • ${code}` : name
  }, [mortgage])

  const handleDelete = async () => {
    if (!mortgageId) return
    const confirmed = window.confirm("Are you sure you want to delete this mortgage record?")
    if (!confirmed) return

    try {
      setProcessing(true)
      await apiFetch(`/admin/mortgages/${mortgageId}`, { method: "DELETE" })
      toast({ title: "Mortgage deleted", description: "The mortgage record has been removed." })
      router.push("/admin/mortgages")
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error?.message || "Unable to delete mortgage.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleStatusAction = async (action: "approve" | "reject") => {
    if (!mortgageId) return
    try {
      setProcessing(true)
      await apiFetch(`/admin/mortgages/${mortgageId}/${action}`, { method: "POST" })
      toast({
        title: `Mortgage ${action === "approve" ? "approved" : "rejected"}`,
        description: `Mortgage has been ${action === "approve" ? "approved" : "rejected"} successfully.`,
      })
      await fetchMortgage()
    } catch (error: any) {
      toast({
        title: `${action === "approve" ? "Approval" : "Rejection"} failed`,
        description: error?.message || `Unable to ${action} mortgage.`,
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const statusVariant = mortgage ? STATUS_VARIANTS[mortgage.status] ?? "secondary" : "secondary"

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/mortgages">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Mortgage Details</h1>
          <p className="text-muted-foreground">
            View and manage the mortgage agreement, repayment schedule, and status.
          </p>
        </div>
        {mortgage && (
          <div className="flex gap-2">
            {mortgage.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusAction("approve")}
                  disabled={processing}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusAction("reject")}
                  disabled={processing}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/mortgages/${mortgage.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={processing}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <Card className="py-16">
          <CardContent className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : mortgage ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Mortgage Summary
              </CardTitle>
              <CardDescription>Snapshot of the mortgage agreement at a glance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={statusVariant} className="mt-1">
                    {mortgage.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Application Date</p>
                  <p className="font-semibold mt-1">{formatDate(mortgage.application_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Loan Amount</p>
                  <p className="font-semibold mt-1">{formatCurrency(mortgage.loan_amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Payment</p>
                  <p className="font-semibold mt-1">{formatCurrency(mortgage.monthly_payment)}</p>
                </div>
              </div>
              
              {(mortgage.status === "approved" || mortgage.status === "active") && (
                <div className={`rounded-lg border p-3 ${
                  mortgage.schedule_approved 
                    ? "border-green-200 bg-green-50" 
                    : "border-amber-200 bg-amber-50"
                }`}>
                  <div className="flex items-start gap-2">
                    {mortgage.schedule_approved ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${
                        mortgage.schedule_approved ? "text-green-900" : "text-amber-900"
                      }`}>
                        Schedule Approval Status
                      </p>
                      {mortgage.schedule_approved ? (
                        <p className="text-xs text-green-700 mt-1">
                          Schedule approved by member on {formatDate(mortgage.schedule_approved_at)}
                        </p>
                      ) : (
                        <p className="text-xs text-amber-700 mt-1">
                          Schedule pending member approval. Repayments cannot be processed until the member approves the schedule.
                        </p>
                      )}
                    </div>
                    {mortgage.schedule_approved ? (
                      <Badge variant="default" className="bg-green-600">
                        Approved
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-300 text-amber-700">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Member Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Member</p>
                <p className="font-semibold">{memberDisplay}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{mortgage.member?.user?.email || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{mortgage.member?.user?.phone || "—"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Mortgage Provider
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Provider</p>
                <p className="font-semibold">{mortgage.provider?.name || "Direct Cooperative"}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Contact Name</p>
                <p className="font-medium">{mortgage.provider?.contact_name || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Email</p>
                <p className="font-medium">{mortgage.provider?.contact_email || "—"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                Property
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Property</p>
                <p className="font-semibold">{mortgage.property?.title || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">
                  {mortgage.property?.address
                    ? `${mortgage.property.address}${mortgage.property.city ? `, ${mortgage.property.city}` : ""}${
                        mortgage.property.state ? `, ${mortgage.property.state}` : ""
                      }`
                    : "—"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Interest Rate</p>
                  <p className="font-semibold mt-1">{mortgage.interest_rate}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tenure</p>
                  <p className="font-semibold mt-1">{mortgage.tenure_years} years</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Approved On</p>
                  <p className="font-semibold mt-1">{formatDate(mortgage.approved_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rejected On</p>
                  <p className="font-semibold mt-1">{formatDate(mortgage.rejected_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {(mortgage.status === "approved" || mortgage.status === "active") && (
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Repayment Management</CardTitle>
                    <CardDescription>Record repayments and view repayment schedule.</CardDescription>
                  </div>
                  <Dialog open={repaymentDialogOpen} onOpenChange={setRepaymentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <DollarSign className="mr-2 h-4 w-4" />
                        Record Repayment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Record Mortgage Repayment</DialogTitle>
                        <DialogDescription>
                          Review the calculated payment amounts and approve to record the repayment.
                        </DialogDescription>
                      </DialogHeader>
                      {loadingNextPayment ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          <span className="ml-2 text-sm text-muted-foreground">Calculating next payment...</span>
                        </div>
                      ) : nextPayment ? (
                        <div className="space-y-4">
                          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                            <h4 className="text-sm font-semibold text-blue-900 mb-3">Payment Details</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-blue-700">Due Date:</span>
                                <span className="font-semibold text-blue-900">{formatDate(nextPayment.due_date)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-blue-700">Principal Amount:</span>
                                <span className="font-semibold text-blue-900">{formatCurrency(nextPayment.principal_paid)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-blue-700">Interest Amount:</span>
                                <span className="font-semibold text-blue-900">{formatCurrency(nextPayment.interest_paid)}</span>
                              </div>
                              <div className="flex justify-between border-t border-blue-200 pt-2">
                                <span className="text-blue-700 font-semibold">Total Payment:</span>
                                <span className="font-bold text-blue-900 text-lg">{formatCurrency(nextPayment.total_amount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-blue-700">Remaining Principal After Payment:</span>
                                <span className="font-semibold text-blue-900">{formatCurrency(nextPayment.remaining_principal)}</span>
                              </div>
                            </div>
                            <div className="mt-3 rounded-md bg-blue-100 p-2">
                              <p className="text-xs text-blue-800">
                                <CheckCircle2 className="inline h-3 w-3 mr-1" />
                                Only the principal amount ({formatCurrency(nextPayment.principal_paid)}) will count toward property progress.
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="repayment-notes">Notes (optional)</Label>
                            <Textarea
                              id="repayment-notes"
                              placeholder="Add any additional notes about this repayment"
                              rows={3}
                              value={repaymentNotes}
                              onChange={(e) => setRepaymentNotes(e.target.value)}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setRepaymentDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleRepaymentSubmit} disabled={submittingRepayment} className="bg-green-600 hover:bg-green-700">
                              {submittingRepayment ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Recording...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Approve & Record Payment
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                          Unable to calculate next payment. Please try again.
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingSchedule ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : repaymentSchedule ? (
                  <>
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold">Repayment Summary</h4>
                          <p className="text-sm text-muted-foreground">
                            {repaymentSchedule.is_fully_repaid ? (
                              <span className="font-semibold text-green-600">Fully Repaid</span>
                            ) : (
                              <>
                                Principal Repaid: {formatCurrency(repaymentSchedule.total_principal_repaid)} /{" "}
                                {formatCurrency(repaymentSchedule.loan_amount ?? repaymentSchedule.principal ?? 0)} • Remaining:{" "}
                                {formatCurrency(repaymentSchedule.remaining_principal)}
                              </>
                            )}
                          </p>
                        </div>
                        <Badge variant={repaymentSchedule.is_fully_repaid ? "default" : "secondary"}>
                          {repaymentSchedule.schedule?.filter((e) => e.status === "paid").length ?? 0} /{" "}
                          {repaymentSchedule.schedule?.length ?? 0} Payments
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Repayment Progress</span>
                          <span className="font-semibold">
                            {repaymentSchedule.schedule && repaymentSchedule.schedule.length > 0
                              ? (
                                  (repaymentSchedule.schedule.filter((e) => e.status === "paid").length /
                                    repaymentSchedule.schedule.length) *
                                  100
                                ).toFixed(1)
                              : 0}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            repaymentSchedule.schedule && repaymentSchedule.schedule.length > 0
                              ? (repaymentSchedule.schedule.filter((e) => e.status === "paid").length /
                                  repaymentSchedule.schedule.length) *
                                100
                              : 0
                          }
                          className="h-2"
                        />
                      </div>
                    </div>
                    {repaymentSchedule.schedule && repaymentSchedule.schedule.length > 0 && (
                      <div className="max-h-96 overflow-y-auto rounded-md border">
                        <div className="sticky top-0 grid grid-cols-6 gap-2 border-b bg-gray-50 px-4 py-3 text-xs font-semibold">
                          <div>Period</div>
                          <div>Due Date</div>
                          <div>Principal</div>
                          <div>Interest</div>
                          <div>Total</div>
                          <div>Status</div>
                        </div>
                        {repaymentSchedule.schedule.map((entry, idx) => (
                          <div
                            key={idx}
                            className={`grid grid-cols-6 gap-2 px-4 py-3 text-sm ${
                              entry.status === "paid" ? "bg-green-50" : entry.status === "overdue" ? "bg-red-50" : ""
                            }`}
                          >
                            <div>{entry.installment ?? entry.month ?? entry.period ?? idx + 1}</div>
                            <div>{formatDate(entry.due_date)}</div>
                            <div>{formatCurrency(entry.principal)}</div>
                            <div>{formatCurrency(entry.interest)}</div>
                            <div className="font-semibold">{formatCurrency(entry.total)}</div>
                            <div>
                              {entry.status === "paid" ? (
                                <Badge variant="default" className="text-xs">
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  Paid
                                </Badge>
                              ) : entry.status === "overdue" ? (
                                <Badge variant="destructive" className="text-xs">
                                  Overdue
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  Pending
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    No repayment schedule available.
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Additional information captured for this mortgage.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border bg-muted/40 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                {mortgage.notes?.trim() ? mortgage.notes : "No additional notes recorded for this mortgage."}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="py-16">
          <CardContent className="text-center text-muted-foreground">
            Unable to find mortgage details. It may have been deleted.
          </CardContent>
        </Card>
      )}
    </div>
  )
}

