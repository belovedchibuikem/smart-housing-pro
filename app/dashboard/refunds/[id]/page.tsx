"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getUserRefundRequest, type RefundRequest } from "@/lib/api/client"
import { ArrowLeft, Loader2, Receipt, Calendar, User, FileText, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function RefundDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [refund, setRefund] = useState<RefundRequest | null>(null)
  const [loading, setLoading] = useState(true)

  const requestTypeLabels: Record<string, string> = {
    refund: "Refund Request",
    stoppage_of_deduction: "Stoppage of Deduction",
    building_plan: "Building Plan Request",
    tdp: "TDP Request",
    change_of_ownership: "Change of Ownership",
    other: "Other Request",
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-blue-100 text-blue-800",
    rejected: "bg-red-100 text-red-800",
    processing: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
  }

  useEffect(() => {
    const loadRefund = async () => {
      try {
        setLoading(true)
        const response = await getUserRefundRequest(params.id as string)
        setRefund(response.refund)
      } catch (error: any) {
        toast.error(error.message || "Failed to load refund request")
        router.push("/dashboard/refunds")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadRefund()
    }
  }, [params.id, router])

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!refund) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/refunds">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Refund Request Details</h1>
          <p className="text-muted-foreground mt-1">View details of your refund request</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Request Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Request Information</CardTitle>
                <Badge className={statusColors[refund.status] || ""}>{refund.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ticket Number</p>
                  <p className="text-lg font-mono">{refund.ticket_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Request Type</p>
                  <p className="text-lg">{requestTypeLabels[refund.request_type] || refund.request_type}</p>
                </div>
                {refund.request_type === "refund" && refund.amount > 0 && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Amount</p>
                      <p className="text-lg font-semibold">{formatCurrency(refund.amount)}</p>
                    </div>
                    {refund.source && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Source</p>
                        <p className="text-lg capitalize">{refund.source.replace("_", " ")}</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Reason</p>
                <p className="text-base">{refund.reason}</p>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Message</p>
                <p className="text-base whitespace-pre-wrap">{refund.message || "—"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Admin Response */}
          {(refund.admin_response || refund.rejection_reason) && (
            <Card>
              <CardHeader>
                <CardTitle>{refund.rejection_reason ? "Rejection Details" : "Admin Response"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base whitespace-pre-wrap">
                  {refund.rejection_reason || refund.admin_response}
                </p>
                {refund.rejected_by && (
                  <p className="text-sm text-muted-foreground mt-4">
                    Rejected on {formatDate(refund.rejected_at)}
                  </p>
                )}
                {refund.approved_by && (
                  <p className="text-sm text-muted-foreground mt-4">
                    Approved on {formatDate(refund.approved_at)}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Requested</p>
                <p className="text-sm">{formatDate(refund.requested_at || refund.created_at)}</p>
              </div>
              {refund.approved_at && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-sm">{formatDate(refund.approved_at)}</p>
                </div>
              )}
              {refund.rejected_at && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                  <p className="text-sm">{formatDate(refund.rejected_at)}</p>
                </div>
              )}
              {refund.processed_at && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Processed</p>
                  <p className="text-sm">{formatDate(refund.processed_at)}</p>
                </div>
              )}
              {refund.completed_at && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-sm">{formatDate(refund.completed_at)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {refund.reference && (
            <Card>
              <CardHeader>
                <CardTitle>Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-mono">{refund.reference}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

