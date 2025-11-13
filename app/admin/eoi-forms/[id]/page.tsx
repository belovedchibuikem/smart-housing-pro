"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, Download, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { apiFetch, approveEoiForm, rejectEoiForm, getApiBaseUrl, getAuthToken, getTenantSlug } from "@/lib/api/client"

interface EoiFormDetail {
  id: string
  member: {
    user: {
      first_name: string
      last_name: string
      email?: string
      phone?: string
    }
    staff_id?: string
    member_id?: string
    rank?: string
  }
  property: {
    title?: string
    address?: string
    price?: number
    location?: string
  }
  interest_type: string
  status: string
  message?: string
  created_at: string
  approved_at?: string
  rejected_at?: string
  rejection_reason?: string
  funding_option?: string
  preferred_payment_methods?: string[] | null
  mortgage_preferences?: {
    provider?: { name?: string }
    loan_amount?: number
    tenure_years?: number
    interest_rate?: number
    monthly_payment?: number
    status?: string
  } | null
  property_snapshot?: Record<string, any> | null
  applicant_snapshot?: Record<string, any> | null
  next_of_kin_snapshot?: Record<string, any> | null
  net_salary?: number | null
  has_existing_loan?: boolean
  existing_loan_types?: string[] | null
  signature_url?: string | null
  signed_at?: string | null
}

export default function EoiFormDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [eoiForm, setEoiForm] = useState<EoiFormDetail | null>(null)
  const [id, setId] = useState<string>("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    params.then((p) => {
      setId(p.id)
      fetchEOIForm(p.id)
    })
  }, [params])

  const fetchEOIForm = async (formId: string) => {
    try {
      setLoading(true)
      const response = await apiFetch<{ success: boolean; data: EoiFormDetail }>(
        `/admin/eoi-forms/${formId}`
      )
      if (response.success) {
        setEoiForm(response.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch EOI form",
        variant: "destructive",
      })
      router.push("/admin/eoi-forms")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!id) return
    try {
      const baseUrl = getApiBaseUrl()
      const headers: Record<string, string> = {
        Accept: "application/pdf",
      }
      const token = getAuthToken()
      if (token) headers["Authorization"] = `Bearer ${token}`
      if (typeof window !== "undefined") {
        headers["X-Forwarded-Host"] = window.location.host
        const tenantSlug = getTenantSlug()
        if (tenantSlug) headers["X-Tenant-Slug"] = tenantSlug
      }

      const response = await fetch(`${baseUrl}/admin/eoi-forms/${id}/download`, {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        throw new Error("Unable to download EOI form")
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = downloadUrl
      const disposition = response.headers.get("Content-Disposition")
      const filenameMatch = disposition?.match(/filename="?([^"]+)"?/)
      anchor.download = filenameMatch?.[1] ?? `eoi-form-${id}.pdf`
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      window.URL.revokeObjectURL(downloadUrl)

      toast({
        title: "Success",
        description: "EOI form downloaded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download EOI form",
        variant: "destructive",
      })
    }
  }

  const handleApprove = async () => {
    if (!id) return
    try {
      setProcessing(true)
      const response = await approveEoiForm(id)
      if (response.success) {
        toast({
          title: "EOI Approved",
          description: response.message || "The submission has been approved.",
        })
        fetchEOIForm(id)
      }
    } catch (error: any) {
      toast({
        title: "Approval failed",
        description: error?.message || "Unable to approve this EOI submission.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!id) return
    const reason = window.prompt("Provide a reason for rejection")
    if (!reason) return

    try {
      setProcessing(true)
      const response = await rejectEoiForm(id, reason)
      if (response.success) {
        toast({
          title: "EOI Rejected",
          description: response.message || "The submission has been rejected.",
        })
        fetchEOIForm(id)
      }
    } catch (error: any) {
      toast({
        title: "Rejection failed",
        description: error?.message || "Unable to reject this EOI submission.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!eoiForm) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">EOI form not found</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/admin/eoi-forms">Back to EOI Forms</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/eoi-forms">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">EOI Form Details</h1>
          <p className="text-muted-foreground mt-1">View expression of interest form details</p>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        {(eoiForm.status === "pending" || eoiForm.status === "under_review") && (
          <>
            <Button onClick={handleApprove} disabled={processing}>
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Approve
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing}>
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
              Reject
            </Button>
          </>
        )}
        <Button variant="outline" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Member Information</CardTitle>
            <CardDescription>Submitted on {new Date(eoiForm.created_at).toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="font-medium">
                {eoiForm.member?.user?.first_name} {eoiForm.member?.user?.last_name}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Member ID</div>
              <div className="font-medium">
                {eoiForm.member?.member_id || eoiForm.member?.staff_id || '—'}
              </div>
            </div>
            {eoiForm.member?.rank && (
              <div>
                <div className="text-sm text-muted-foreground">Rank</div>
                <div className="font-medium">{eoiForm.member.rank}</div>
              </div>
            )}
            {eoiForm.applicant_snapshot?.command && (
              <div>
                <div className="text-sm text-muted-foreground">Command</div>
                <div className="font-medium">{eoiForm.applicant_snapshot.command}</div>
              </div>
            )}
            {eoiForm.member?.user?.email && (
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-medium">{eoiForm.member.user.email}</div>
              </div>
            )}
            {eoiForm.member?.user?.phone && (
              <div>
                <div className="text-sm text-muted-foreground">Phone</div>
                <div className="font-medium">{eoiForm.member.user.phone}</div>
              </div>
            )}
            {typeof eoiForm.net_salary === "number" && (
              <div>
                <div className="text-sm text-muted-foreground">Net Salary</div>
                <div className="font-medium">₦{eoiForm.net_salary.toLocaleString()}</div>
              </div>
            )}
            <div>
              <div className="text-sm text-muted-foreground">Existing Loan</div>
              <div className="font-medium">
                {eoiForm.has_existing_loan ? "Yes" : "No"}
                {eoiForm.has_existing_loan && eoiForm.existing_loan_types?.length ? (
                  <span className="block text-xs text-muted-foreground">
                    {eoiForm.existing_loan_types.join(", ")}
                  </span>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Information</CardTitle>
            <CardDescription>Funding option: {eoiForm.funding_option || "N/A"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Property</div>
              <div className="font-medium">
                {eoiForm.property?.title || eoiForm.property?.address || '—'}
              </div>
            </div>
            {eoiForm.property?.price && (
              <div>
                <div className="text-sm text-muted-foreground">Price</div>
                <div className="font-medium">₦{(eoiForm.property.price / 1000000).toFixed(1)}M</div>
              </div>
            )}
            {eoiForm.property_snapshot?.size && (
              <div>
                <div className="text-sm text-muted-foreground">Size</div>
                <div className="font-medium">{eoiForm.property_snapshot.size} sqm</div>
              </div>
            )}
            <div>
              <div className="text-sm text-muted-foreground">Interest Type</div>
              <div className="font-medium">{eoiForm.interest_type || '—'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <Badge
                variant={
                  eoiForm.status === "approved"
                    ? "default"
                    : eoiForm.status === "pending" || eoiForm.status === "under_review"
                      ? "secondary"
                      : "outline"
                }
              >
                {eoiForm.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {eoiForm.message && (
        <Card>
          <CardHeader>
            <CardTitle>Message</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{eoiForm.message}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          {eoiForm.rejection_reason && (
            <CardDescription>Rejection reason: {eoiForm.rejection_reason}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Submitted</div>
            <div className="font-medium">
              {new Date(eoiForm.created_at).toLocaleString()}
            </div>
          </div>
          {eoiForm.approved_at && (
            <div>
              <div className="text-sm text-muted-foreground">Approved</div>
              <div className="font-medium">
                {new Date(eoiForm.approved_at).toLocaleString()}
              </div>
            </div>
          )}
          {eoiForm.rejected_at && (
            <div>
              <div className="text-sm text-muted-foreground">Rejected</div>
              <div className="font-medium">
                {new Date(eoiForm.rejected_at).toLocaleString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {eoiForm.mortgage_preferences && (
        <Card>
          <CardHeader>
            <CardTitle>Mortgage Preference</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Provider</div>
              <div className="font-medium">
                {eoiForm.mortgage_preferences?.provider?.name || "—"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Loan Amount</div>
              <div className="font-medium">
                {eoiForm.mortgage_preferences?.loan_amount
                  ? `₦${Number(eoiForm.mortgage_preferences.loan_amount).toLocaleString()}`
                  : "—"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Monthly Payment</div>
              <div className="font-medium">
                {eoiForm.mortgage_preferences?.monthly_payment
                  ? `₦${Number(eoiForm.mortgage_preferences.monthly_payment).toLocaleString()}`
                  : "—"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tenure</div>
              <div className="font-medium">
                {eoiForm.mortgage_preferences?.tenure_years
                  ? `${eoiForm.mortgage_preferences.tenure_years} years`
                  : "—"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Interest Rate</div>
              <div className="font-medium">
                {eoiForm.mortgage_preferences?.interest_rate
                  ? `${eoiForm.mortgage_preferences.interest_rate}%`
                  : "—"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="font-medium">
                {eoiForm.mortgage_preferences?.status || "—"}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {eoiForm.signature_url && (
        <Card>
          <CardHeader>
            <CardTitle>Signature</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={eoiForm.signature_url}
              alt="Signature"
              className="h-32 max-w-xs border rounded-md object-contain bg-muted p-2"
            />
            {eoiForm.signed_at && (
              <p className="mt-2 text-xs text-muted-foreground">
                Signed on {new Date(eoiForm.signed_at).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

