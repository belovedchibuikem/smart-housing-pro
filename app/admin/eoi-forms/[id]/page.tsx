"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, Download } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"

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
  }
  interest_type: string
  status: string
  message?: string
  created_at: string
  approved_at?: string
  rejected_at?: string
}

export default function EoiFormDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [eoiForm, setEoiForm] = useState<EoiFormDetail | null>(null)
  const [id, setId] = useState<string>("")

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
      const response = await apiFetch<{ success: boolean; data: any }>(
        `/admin/eoi-forms/${id}/download`
      )
      if (response.success && response.data) {
        const data = JSON.stringify(response.data, null, 2)
        const blob = new Blob([data], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `eoi-form-${id}.json`
        a.click()
        window.URL.revokeObjectURL(url)
        
        toast({
          title: "Success",
          description: "EOI form downloaded successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download EOI form",
        variant: "destructive",
      })
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
        <Button variant="outline" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Member Information</CardTitle>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Information</CardTitle>
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
    </div>
  )
}

