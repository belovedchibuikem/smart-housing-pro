"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Building2, Globe } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { toast } from "sonner"

interface DomainRequestDetail {
  id: string
  tenant_id: string
  business_name: string
  business_email: string
  business_address: string
  full_domain: string
  status: string
  verification_token?: string
  requested_at: string
  admin_notes?: string | null
}

export default function DomainRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [req, setReq] = useState<DomainRequestDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const res = await apiFetch<{ request: DomainRequestDetail }>(`/super-admin/domain-requests/${id}`)
        if (!cancelled && res.request) setReq(res.request)
      } catch (e: any) {
        toast.error(e?.message || "Failed to load request")
        router.push("/super-admin/domain-requests")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, router])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!req) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">Request not found.</CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/super-admin/domain-requests">
            <ArrowLeft className="h-4 w-4 mr-2" />
            All requests
          </Link>
        </Button>
        <Badge variant="outline" className="capitalize">
          {req.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {req.full_domain}
          </CardTitle>
          <CardDescription>Custom domain request details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground">Business</p>
              <p className="font-medium">{req.business_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tenant ID</p>
              <p className="font-mono text-xs">{req.tenant_id}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Contact email</p>
              <p>{req.business_email || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Requested</p>
              <p>{new Date(req.requested_at).toLocaleString()}</p>
            </div>
          </div>
          {req.business_address ? (
            <div>
              <p className="text-muted-foreground">Address</p>
              <p>{req.business_address}</p>
            </div>
          ) : null}
          {req.admin_notes ? (
            <div>
              <p className="text-muted-foreground">Admin notes</p>
              <p className="whitespace-pre-wrap">{req.admin_notes}</p>
            </div>
          ) : null}
          {req.verification_token ? (
            <div>
              <p className="text-muted-foreground">Verification token</p>
              <p className="font-mono text-xs break-all">{req.verification_token}</p>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-4">
            <Button variant="outline" asChild>
              <Link href={`/super-admin/businesses/${req.tenant_id}`}>
                <Building2 className="h-4 w-4 mr-2" />
                View business
              </Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Use the domain requests list to approve or reject pending requests.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
