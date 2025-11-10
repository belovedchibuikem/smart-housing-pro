"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Wallet, Calendar, Receipt, CheckCircle, Clock, XCircle } from "lucide-react"
import Link from "next/link"
import { apiFetch } from "@/lib/api/client"
import { toast as sonnerToast } from "sonner"

interface EquityContribution {
  id: string
  plan?: {
    name?: string
    description?: string
  }
  amount: number
  payment_method: string
  status: string
  payment_reference?: string
  transaction_id?: string
  notes?: string
  rejection_reason?: string
  approved_at?: string
  rejected_at?: string
  paid_at?: string
  created_at: string
}

export default function EquityContributionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [contribution, setContribution] = useState<EquityContribution | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContribution()
  }, [params.id])

  const fetchContribution = async () => {
    try {
      setLoading(true)
      const response = await apiFetch<{ success: boolean; data: EquityContribution }>(
        `/user/equity-contributions/${params.id}`
      )

      if (response.success) {
        setContribution(response.data)
      }
    } catch (error: any) {
      console.error('Error fetching equity contribution:', error)
      sonnerToast.error("Failed to load contribution", {
        description: error.message || "Please try again later",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      approved: "default",
      pending: "secondary",
      rejected: "destructive",
      failed: "destructive",
    }

    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-orange-600" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!contribution) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Contribution not found</p>
        <Link href="/dashboard/equity-contributions">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contributions
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/equity-contributions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Equity Contribution Details</h1>
          <p className="text-muted-foreground mt-1">View your equity contribution information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contribution Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-muted-foreground">Status</span>
                {getStatusIcon(contribution.status)}
              </div>
              {getStatusBadge(contribution.status)}
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Amount</span>
              <div className="mt-1 text-2xl font-bold">
                ₦{parseFloat(contribution.amount.toString()).toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Payment Method</span>
              <div className="mt-1 capitalize">
                {contribution.payment_method?.replace('_', ' ')}
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Payment Reference</span>
              <div className="mt-1 font-mono text-sm">
                {contribution.payment_reference || "N/A"}
              </div>
            </div>
            {contribution.transaction_id && (
              <div>
                <span className="text-sm text-muted-foreground">Transaction ID</span>
                <div className="mt-1 font-mono text-sm">
                  {contribution.transaction_id}
                </div>
              </div>
            )}
            {contribution.plan && (
              <div>
                <span className="text-sm text-muted-foreground">Equity Plan</span>
                <div className="mt-1">
                  <div className="font-medium">{contribution.plan.name}</div>
                  {contribution.plan.description && (
                    <div className="text-sm text-muted-foreground">{contribution.plan.description}</div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Submitted</span>
              </div>
              <div className="ml-6">
                {new Date(contribution.created_at).toLocaleString()}
              </div>
            </div>
            {contribution.approved_at && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">Approved</span>
                </div>
                <div className="ml-6">
                  {new Date(contribution.approved_at).toLocaleString()}
                </div>
              </div>
            )}
            {contribution.paid_at && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Receipt className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-muted-foreground">Paid</span>
                </div>
                <div className="ml-6">
                  {new Date(contribution.paid_at).toLocaleString()}
                </div>
              </div>
            )}
            {contribution.rejected_at && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-muted-foreground">Rejected</span>
                </div>
                <div className="ml-6">
                  {new Date(contribution.rejected_at).toLocaleString()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {(contribution.notes || contribution.rejection_reason) && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contribution.notes && (
                <div>
                  <span className="text-sm text-muted-foreground">Your Notes</span>
                  <div className="mt-1 p-3 bg-muted rounded-lg">
                    {contribution.notes}
                  </div>
                </div>
              )}
              {contribution.rejection_reason && (
                <div>
                  <span className="text-sm text-muted-foreground text-destructive">Rejection Reason</span>
                  <div className="mt-1 p-3 bg-destructive/10 rounded-lg text-destructive">
                    {contribution.rejection_reason}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {contribution.status === 'approved' && (
          <Card className="md:col-span-2 bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">Contribution Approved</p>
                  <p className="text-sm text-green-700 mt-1">
                    This contribution has been added to your equity wallet and is available for property deposits.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

