"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { apiFetch, approveLandEoiForm, rejectLandEoiForm } from "@/lib/api/client"
import { resolveStorageUrl } from "@/lib/api/config"
import { Can } from "@/components/admin/can-permission"

interface LandEoiFormDetail {
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
  land: {
    land_title?: string
    land_code?: string
    location?: string
    cost?: number
    land_size?: number
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
  land_snapshot?: Record<string, unknown> | null
  applicant_snapshot?: Record<string, unknown> | null
  next_of_kin_snapshot?: Record<string, unknown> | null
  net_salary?: number | null
  has_existing_loan?: boolean
  existing_loan_types?: string[] | null
  signature_path?: string | null
  signed_at?: string | null
}

export default function LandEoiFormDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [eoiForm, setEoiForm] = useState<LandEoiFormDetail | null>(null)
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
      const response = await apiFetch<{ success: boolean; data: LandEoiFormDetail }>(
        `/admin/land-eoi-forms/${formId}`
      )
      if (response.success) {
        setEoiForm(response.data)
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch land EOI form",
        variant: "destructive",
      })
      router.push("/admin/land-eoi-forms")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!id) return
    try {
      setProcessing(true)
      const response = await approveLandEoiForm(id)
      if (response.success) {
        toast({
          title: "Land EOI Approved",
          description: response.message || "The submission has been approved.",
        })
        fetchEOIForm(id)
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to approve this land EOI submission."
      toast({
        title: "Approval failed",
        description: message,
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
      const response = await rejectLandEoiForm(id, reason)
      if (response.success) {
        toast({
          title: "Land EOI Rejected",
          description: response.message || "The submission has been rejected.",
        })
        fetchEOIForm(id)
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to reject this land EOI submission."
      toast({
        title: "Rejection failed",
        description: message,
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
        <p className="text-muted-foreground">Land EOI form not found</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/admin/land-eoi-forms">Back to Land EOI Forms</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/land-eoi-forms">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Land EOI Details</h1>
          <p className="text-muted-foreground mt-1">View land expression of interest submission</p>
        </div>
      </div>

      {eoiForm.status === "pending" && (
        <div className="flex justify-end gap-4">
          <Can permission="approve_allotments">
            <Button onClick={handleApprove} disabled={processing}>
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Approve
            </Button>
          </Can>
          <Can permission="reject_allotments">
            <Button variant="destructive" onClick={handleReject} disabled={processing}>
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
              Reject
            </Button>
          </Can>
        </div>
      )}

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
                {eoiForm.member?.member_id || eoiForm.member?.staff_id || "—"}
              </div>
            </div>
            {eoiForm.member?.rank && (
              <div>
                <div className="text-sm text-muted-foreground">Rank</div>
                <div className="font-medium">{eoiForm.member.rank}</div>
              </div>
            )}
            {typeof eoiForm.applicant_snapshot?.command === "string" && (
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
            <CardTitle>Land Parcel</CardTitle>
            <CardDescription>Funding option: {eoiForm.funding_option || "N/A"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Title</div>
              <div className="font-medium">
                {eoiForm.land?.land_title || eoiForm.land?.land_code || "—"}
              </div>
            </div>
            {eoiForm.land?.location && (
              <div>
                <div className="text-sm text-muted-foreground">Location</div>
                <div className="font-medium">{eoiForm.land.location}</div>
              </div>
            )}
            {typeof eoiForm.land?.cost === "number" && (
              <div>
                <div className="text-sm text-muted-foreground">Cost</div>
                <div className="font-medium">₦{eoiForm.land.cost.toLocaleString()}</div>
              </div>
            )}
            {typeof eoiForm.land?.land_size === "number" && (
              <div>
                <div className="text-sm text-muted-foreground">Size</div>
                <div className="font-medium">{eoiForm.land.land_size} sqm</div>
              </div>
            )}
            <div>
              <div className="text-sm text-muted-foreground">Interest Type</div>
              <div className="font-medium">{eoiForm.interest_type || "—"}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <Badge
                variant={
                  eoiForm.status === "approved"
                    ? "default"
                    : eoiForm.status === "pending"
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
            <div className="font-medium">{new Date(eoiForm.created_at).toLocaleString()}</div>
          </div>
          {eoiForm.approved_at && (
            <div>
              <div className="text-sm text-muted-foreground">Approved</div>
              <div className="font-medium">{new Date(eoiForm.approved_at).toLocaleString()}</div>
            </div>
          )}
          {eoiForm.rejected_at && (
            <div>
              <div className="text-sm text-muted-foreground">Rejected</div>
              <div className="font-medium">{new Date(eoiForm.rejected_at).toLocaleString()}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {eoiForm.signature_path && (
        <Card>
          <CardHeader>
            <CardTitle>Signature</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={resolveStorageUrl(eoiForm.signature_path)}
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
