"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Calendar, CheckCircle, Loader2, TrendingUp, User, XCircle } from "lucide-react"
import { toast as sonnerToast } from "sonner"
import {
  getFinancialInvestment,
  approveFinancialInvestment,
  rejectFinancialInvestment,
  deleteFinancialInvestment,
  type FinancialInvestment,
} from "@/lib/api/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

function formatCurrency(amount: number | string | undefined): string {
  const n = typeof amount === "string" ? parseFloat(amount) : Number(amount)
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0,
  )
}

function formatDate(dateString?: string | null): string {
  if (!dateString) return "—"
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return dateString
  }
}

function formatTypeLabel(type: string | undefined): string {
  if (!type) return "—"
  return type.replace(/_/g, " ")
}

export default function AdminInvestmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [investment, setInvestment] = useState<FinancialInvestment | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  const load = async () => {
    try {
      setLoading(true)
      const res = await getFinancialInvestment(id)
      setInvestment(res.investment)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again later"
      sonnerToast.error("Failed to load investment", { description: message })
      setInvestment(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const handleApprove = async () => {
    try {
      setProcessing(true)
      const response = await approveFinancialInvestment(id)
      if (response.success) {
        sonnerToast.success("Investment approved", { description: response.message })
        setShowApproveDialog(false)
        load()
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again later"
      sonnerToast.error("Failed to approve", { description: message })
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      sonnerToast.error("Reason required", { description: "Please explain why this investment is rejected." })
      return
    }
    try {
      setProcessing(true)
      const response = await rejectFinancialInvestment(id, rejectionReason.trim())
      if (response.success) {
        sonnerToast.success("Investment rejected", { description: response.message })
        setShowRejectDialog(false)
        setRejectionReason("")
        load()
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again later"
      sonnerToast.error("Failed to reject", { description: message })
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Delete this pending investment permanently?")) return
    try {
      setProcessing(true)
      const response = await deleteFinancialInvestment(id)
      if (response.success) {
        sonnerToast.success("Investment deleted", { description: response.message })
        window.location.href = "/admin/investments"
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again later"
      sonnerToast.error("Failed to delete", { description: message })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!investment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/investments">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Investment not found</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">This record may have been removed or you may not have access.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const memberId = investment.member?.id

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link href="/admin/investments">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold truncate">Investment</h1>
          <p className="text-muted-foreground font-mono text-sm break-all">{investment.id}</p>
        </div>
        <Badge
          variant={
            investment.status === "active" || investment.status === "completed"
              ? "default"
              : investment.status === "rejected"
                ? "destructive"
                : "secondary"
          }
        >
          {investment.status}
        </Badge>
      </div>

      {investment.status === "pending" && (
        <Card className="border-amber-200 bg-amber-50/80 dark:bg-amber-950/20 dark:border-amber-900">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold">Pending review</h3>
                <p className="text-sm text-muted-foreground">Approve, reject, or delete this application</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setShowApproveDialog(true)} disabled={processing}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button variant="destructive" onClick={() => setShowRejectDialog(true)} disabled={processing}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button variant="outline" onClick={handleDelete} disabled={processing}>
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Investment details
              </CardTitle>
              <CardDescription>Amount, term, and expected return</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-3xl font-bold">{formatCurrency(investment.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{formatTypeLabel(investment.type)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{investment.duration_months} months</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Expected rate</p>
                  <p className="font-medium">
                    {investment.expected_return_rate != null ? `${investment.expected_return_rate}% p.a.` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expected return (calc.)</p>
                  <p className="font-medium">{formatCurrency(investment.expected_return)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total returns posted</p>
                  <p className="font-medium">{formatCurrency(investment.total_return)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Investment date
                  </p>
                  <p className="font-medium">{formatDate(investment.investment_date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {investment.rejection_reason && (
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-destructive text-base">Rejection</CardTitle>
                <CardDescription>{formatDate(investment.rejected_at)}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{investment.rejection_reason}</p>
              </CardContent>
            </Card>
          )}

          {investment.returns && investment.returns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Return history</CardTitle>
                <CardDescription>Recorded payouts on this investment</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investment.returns.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{formatDate(r.return_date)}</TableCell>
                        <TableCell className="capitalize">{r.type}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(r.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Member
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{investment.member?.full_name || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Member number</p>
                <p className="font-medium">{investment.member?.member_number || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium break-all">{investment.member?.user?.email || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{investment.member?.user?.phone || "—"}</p>
              </div>
              {memberId && (
                <Button variant="outline" className="w-full mt-2" asChild>
                  <Link href={`/admin/members/${memberId}`}>Open member profile</Link>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(investment.created_at)}</span>
              </div>
              {investment.approved_at && (
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Approved</span>
                  <span>{formatDate(investment.approved_at)}</span>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Updated</span>
                <span>{formatDate(investment.updated_at)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve investment</DialogTitle>
            <DialogDescription>
              This marks the investment as active and notifies the member. Ensure amounts and terms are correct.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={processing}>
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject investment</DialogTitle>
            <DialogDescription>The member will see this reason in their notification.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Reason for rejection..."
            rows={4}
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={processing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing}>
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject investment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
