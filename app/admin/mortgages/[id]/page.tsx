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
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"

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
            <CardContent className="grid gap-4 md:grid-cols-4">
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

